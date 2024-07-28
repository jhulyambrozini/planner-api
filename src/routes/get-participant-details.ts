import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getParticipantDetaisl(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId', {
        schema: {
            params: z.object({
                participantId: z.string().uuid(),
            })
        }
    }, async (request) => {

        const {participantId} = request.params

        const participant = await prisma.participant.findUnique({
            where: {
                id: participantId
            },
            select: {
                id: true,
                name: true,
                is_confirmed: true,
                email: true,
            }
        })

        if(!participant) {
            throw new Error('Participante não existe')
        }

        return {participant
        }
    })}