import { prisma } from './database.server';

export async function addEvent(eventData) {
    try {
        await prisma.event.create({data: {
            id: eventData.id,
            blockId : eventData.blockId,
            name: eventData.name,
            color: eventData.color,
            notes: eventData.notes,
            subject: {
                connect: {id: eventData.subjectId},
            },
            subjectName: eventData.subjectName,
            date: new Date(eventData.date),
            completed: eventData.completed,
        }});

        return {ok: true};
    } catch(error){
        throw error;
    }
}

export async function updateEvent(eventData) {
    try {
        await prisma.event.update({
            where: {
                id: eventData.id,
            },
            data: {
            name: eventData.name,
            date: new Date(eventData.date),
            repetition: eventData.repetition,
            time: eventData.time,
            completed: eventData.completed,
            }
        });

        return {ok: true};
    } catch(error){
        throw error;
    }
}