import { prisma } from './database.server';

export async function addReview(reviewData) {
    try {
        await prisma.weeklyReview.create({data: {
            date: reviewData.date,
            satisfaction: reviewData.satisfaction,
        }});

        return {ok: true};
    } catch(error){
        throw error;
    }
}