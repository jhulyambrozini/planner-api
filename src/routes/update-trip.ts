import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from 'zod'
import {dayjs} from '../lib/dayjs'
import { prisma } from "../lib/prisma";

export async function updateTrip(app: FastifyInstance){
     app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
            })
        }
     }, async (request) => {
        const { destination, ends_at, starts_at} = request.body

        const {tripId} = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })

        if(!trip) {
            throw new Error('Viagem não existe')
        }

        if(dayjs(starts_at).isBefore(new Date)){
            throw new Error('Data de inicio inválida.')
        }

        if(dayjs(ends_at).isBefore(starts_at)){
        throw new Error('Data de fim inválida.')
        }

        await prisma.trip.update({
            where: {id: tripId},
            data: {
                destination,
                starts_at,
                ends_at,
            }
        })

        return {
           trip_id: trip.id
        }
    })
}