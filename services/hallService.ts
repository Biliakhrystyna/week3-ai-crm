// api/services/hallService.ts
import { prisma } from '../prismaClient';

export const createHall = async (data: any) => {
    return await prisma.hall.create({
        data: { 
            name: data.name, 
            capacity: Number(data.capacity) 
        }
    });
};