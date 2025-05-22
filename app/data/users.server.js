import { prisma } from './database.server';

export async function addUser(userData) {
    try {
        await prisma.user.create({data: {
            nameUser: userData.nameUser,
            password: userData.password,
        }});

        return {ok: true};
    } catch(error){
        console.log(error);
        throw error;
    }
}