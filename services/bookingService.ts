import { prisma } from '../prismaClient';

export const createBooking = async (data: any) => {
    const { seatNumber, screeningId, firstName, lastName, email, phone } = data;
    
    // 1. Знаходимо або створюємо клієнта
    let customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
        customer = await prisma.customer.create({
            data: { firstName, lastName, email, phone }
        });
    }

    // 2. Створюємо бронювання
    return await prisma.booking.create({
        data: {
            seatNumber,
            status: 'CONFIRMED',
            screeningId: Number(screeningId),
            customerId: customer.id
        }
    });
};