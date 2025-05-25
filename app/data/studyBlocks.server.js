import { prisma } from './database.server';

export async function addStudyBlock(studyBlockData) {
    try {
        await prisma.studyBlock.create({data: {

            blockId : studyBlockData.blockId,
            time: studyBlockData.time,
            repetition: studyBlockData.repetition,
            name: studyBlockData.name,
            subject: {
                connect: {name: studyBlockData.subjectName},
            },
            
        }});

        return {ok: true};
    } catch(error){
        console.log(error);
        throw error;
    }
}