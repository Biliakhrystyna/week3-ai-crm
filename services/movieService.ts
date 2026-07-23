import { prisma } from '../prismaClient';

export const getAllMovies = (title?: string) => {
    return prisma.movie.findMany({
        where: title ? { title: { contains: String(title), mode: 'insensitive' } } : {}
    });
};

export const createMovie = (data: any) => {
    return prisma.movie.create({ 
        data: { 
            title: data.title,
            genre: data.genre,
            duration: Number(data.duration),
            rating: data.rating 
        } 
    });
};

export const updateMovie = (id: number, data: any) => {
    return prisma.movie.update({
        where: { id: id },
        data: { 
            title: data.title,
            genre: data.genre,
            duration: Number(data.duration),
            rating: data.rating 
        }
    });
};

export const deleteMovie = (id: number) => {
    return prisma.movie.delete({ 
        where: { id: id } 
    });
};