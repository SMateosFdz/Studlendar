import { prisma } from './database.server';

export async function addUser(userData) {
    try {
        await prisma.user.create({data: {
            nameUser: userData.nameUser,
            email: userData.email,
            password: userData.password,
        }});

        return {ok: true};
    } catch(error){
        console.log(error);
        throw error;
    }
}


export async function updateUser(userData, preferences) {
    try {
        await prisma.user.update({
            where: {
                email: userData.email
            },
            data: {
                nameUser: userData.nameUser,
                password: userData.password,
                preferences: preferences,
            }
        });

        return {ok: true};
    } catch(error){
        throw error;
    }
}