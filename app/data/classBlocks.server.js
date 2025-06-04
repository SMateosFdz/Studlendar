import { prisma } from './database.server';

export async function addClassBlock(classBlockData) {
    try {
        await prisma.classBlock.create({data: {

            blockId : classBlockData.blockId,
            name: classBlockData.name,
            repetition: classBlockData.repetition,
            subject: {
                connect: {name: classBlockData.subjectName},
            },
            time: classBlockData.time,
            date: new Date(classBlockData.date),
        }});

        return {ok: true};
    } catch(error){
        console.log(error);
        throw error;
    }
}