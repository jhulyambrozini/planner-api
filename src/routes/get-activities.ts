import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";

export async function getActivities(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request, reply) => {

        const {tripId} = request.params
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {activities: {
                orderBy: {
                    accours_at: 'asc'
                }
            }}
        })

        if(!trip) {
            throw new Error('Viagem não existe')
        }

        const diffInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(trip.starts_at, 'days') 

        const activities = Array.from({length: diffInDaysBetweenTripStartAndEnd + 1}).map((_, index) => {
            const date = dayjs(trip.starts_at).add(index, 'days')

            return {
                date: date.toDate(),
                activities: trip.activities.filter(activity => {
                    return dayjs(activity.accours_at).isSame(date, 'days')
                })
            }
        })
       return { activities: activities}
    })
}