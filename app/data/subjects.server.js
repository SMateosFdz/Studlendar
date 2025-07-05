import { prisma } from './database.server';

export async function addSubject(subjectData) {
    try {
        await prisma.subject.create({data: {

            name: subjectData.name,
            hours: subjectData.hours,
            sessionSize: subjectData.sessionSize,
            initialDate: new Date(subjectData.initialDate),
            endDate: new Date(subjectData.endDate),
            color: subjectData.color,
            author: {
                connect: {nameUser: subjectData.author},
            },
        }});

        return {ok: true};
    } catch(error){
        console.log(error);
        throw error;
    }
}