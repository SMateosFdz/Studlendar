import { prisma } from './database.server';

export async function addSubject(subjectData) {
    try {
        await prisma.subject.create({data: {
            name: subjectData.name,
            sessions: subjectData.sessions,
            sessionOrg: subjectData.sessionOrg,
            initialDate: new Date(subjectData.initialDate),
            endDate: new Date(subjectData.endDate),
        }});

        return {ok: true};
    } catch(error){
        console.log(error);
        throw error;
    }
}