import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { apiClient } from '../../api/client';

export const createBookingTool = tool(
    async ({ seatNumber, screeningId, firstName, lastName, email, phone }) => {
        try {
            const response = await apiClient.post('/bookings', { 
                seatNumber, screeningId, firstName, lastName, email, phone 
            });
            return JSON.stringify({ status: "success", booking: response.data });
        } catch (error: any) {
            return `Не вдалося створити бронювання: ${error.response?.data?.error || error.message}`;
        }
    },
    {
        name: "create_booking",
        description: "Створює бронювання квитка на сеанс. Використовуй цей інструмент, коли клієнт хоче купити квиток.",
        schema: z.object({
            seatNumber: z.string().describe("Номер місця (наприклад, 'A1')"),
            screeningId: z.number().describe("ID сеансу (можна знайти через list_screenings)"),
            firstName: z.string().describe("Ім'я клієнта"),
            lastName: z.string().describe("Прізвище клієнта"),
            email: z.string().email().describe("Email клієнта"),
            phone: z.string().describe("Номер телефону"),
        }),
    }
);