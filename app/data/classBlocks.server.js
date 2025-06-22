import { prisma } from './database.server';

export async function addClassBlock(classBlockData) {
    try {
        await prisma.classBlock.create({data: {
            id: classBlockData.id,
            blockId : classBlockData.blockId,
            name: classBlockData.name,
            repetition: classBlockData.repetition,
            subject: {
                connect: {id: classBlockData.subjectId},
            },
            subjectName: classBlockData.subjectName,
            time: classBlockData.time,
            date: new Date(classBlockData.date),
            completed: classBlockData.completed,
            notes: classBlockData.notes,
        }});

        return {ok: true};
    } catch(error){
        throw error;
    }
}

export async function updateClassBlock(classBlockData) {
    try {
        await prisma.classBlock.update({
            where: {
                id: classBlockData.id,
            },
            data: {
            name: classBlockData.name,
            date: new Date(classBlockData.date),
            repetition: classBlockData.repetition,
            time: classBlockData.time,
            completed: classBlockData.completed,
            }
        });

        return {ok: true};
    } catch(error){
        throw error;
    }
}