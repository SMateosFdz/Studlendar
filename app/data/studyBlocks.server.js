import { prisma } from './database.server';

export async function addStudyBlock(studyBlockData) {
    try {
        await prisma.studyBlock.create({data: {
            id: studyBlockData.id,
            blockId : studyBlockData.blockId,
            repetition: studyBlockData.repetition,
            name: studyBlockData.name,
            subject: {
                connect: {id: studyBlockData.subjectId},
            },
            subjectName: studyBlockData.subjectName,
            time: studyBlockData.time,
            date: new Date(studyBlockData.date),
            completed: studyBlockData.completed,
            notes: studyBlockData.notes,
        }});

        return {ok: true};
    } catch(error){
        throw error;
    }
}

export async function updateStudyBlock(studyBlockData) {
    try {
        await prisma.studyBlock.update({
            where: {
                id: studyBlockData.id,
            },
            data: {
            name: studyBlockData.name,
            date: new Date(studyBlockData.date),
            repetition: studyBlockData.repetition,
            time: studyBlockData.time,
            completed: studyBlockData.completed,
            }
        });

        return {ok: true};
    } catch(error){
        throw error;
    }
}