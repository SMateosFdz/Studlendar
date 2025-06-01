import { prisma } from './database.server';

export async function addEvent(eventData) {
    try {
        await prisma.event.create({data: {

            blockId : eventData.blockId,
            name: eventData.name,
            color: eventData.color,
            date: new Date(eventData.date),
            notes: eventData.notes,
            subject: {
                connect: {name: eventData.subjectName},
            },
            
        }});

        return {ok: true};
    } catch(error){
        console.log(error);
        throw error;
    }
}