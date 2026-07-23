import { prisma } from '../prismaClient';

export const getAllScreenings = () => {
    return prisma.screening.findMany({
        include: { movie: true, hall: true }
    });
};

export const createScreening = (data: any) => {
    return prisma.screening.create({
        data: {
            startTime: new Date(data.startTime),
            price: Number(data.price),
            movieId: Number(data.movieId),
            hallId: Number(data.hallId)
        }
    });
};