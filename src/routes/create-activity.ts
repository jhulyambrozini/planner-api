import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from 'zod'
import {dayjs} from '../lib/dayjs'
import { prisma } from "../lib/prisma";

export async function createActivity(app: FastifyInstance){
     app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                title: z.string().min(4),
                accours_at: z.coerce.date(),
               
            })
        }
     }, async (request) => {
        const {
            title,
            accours_at,
        } = request.body

        const {tripId}  = request.params
        const trip = await prisma.trip.findUnique({
            where: {id: tripId}
        })
        
        if(!trip){
            throw new Error('Viagem não encontrada')
        }

        if(dayjs(accours_at).isBefore(trip.starts_at)){
            throw new Error('Data inválida')
        }

        if(dayjs(accours_at).isAfter(trip.ends_at)){
            throw new Error('Data inválida')
        }

        const activity =await prisma.activity.create({
            data: {
                title, accours_at, trip_id: tripId
            }
        })

        return {activityId: activity.id}
    })
}