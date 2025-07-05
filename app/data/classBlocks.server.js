import { prisma } from './database.server';

export async function addClassBlock(classBlockData) {
    try {
        await prisma.classBlock.create({data: {
            id: classBlockData.id,
            blockId : classBlockData.blockId,
            name: classBlockData.name,
            subject: {
                connect: {id: classBlockData.subjectId},
            },
            subjectName: classBlockData.subjectName,
            time: classBlockData.time,
            date: new Date(classBlockData.date),
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
            time: classBlockData.time,
            notes: classBlockData.notes,
            }
        });

        return {ok: true};
    } catch(error){
        throw error;
    }
}

export async function deleteClassBlock(classBlockData) {
    try {
        await prisma.classBlock.delete({
            where: {
                id: classBlockData.id,
            },
        });
        
        return {ok: true};
    } catch(error){
        throw error;
    }
}