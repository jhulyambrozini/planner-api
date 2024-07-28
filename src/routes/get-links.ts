import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";

export async function getLinks(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/links', {
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
            include: {links: true}
        })

        if(!trip) {
            throw new Error('Viagem não existe')
        }

        
       return { links: trip.links}
    })
}