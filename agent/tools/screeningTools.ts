import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { apiClient } from '../../api/client';

// 1. Tool для отримання списку сеансів
export const listScreeningsTool = tool(
    async () => {
        try {
            const response = await apiClient.get('/screenings');
            return JSON.stringify(response.data);
        } catch (error:any) {
            return `Не вдалося отримати розклад: ${error.response?.data?.error || error.message}`;;
        }
    },
    {
        name: "list_screenings",
        description: "Отримує поточний розклад усіх сеансів у кінотеатрі.",
        schema: z.object({}), 
    }
);

// 2. Tool для створення нового сеансу
export const createScreeningTool = tool(
    async ({ startTime, price, movieId, hallId }) => {
        try {
            const response = await apiClient.post('/screenings', { 
                startTime, price, movieId, hallId 
            });
            return JSON.stringify({ status: "success", screening: response.data});
        } catch (error: any) {
            return `Не вдалося створити сеанс: ${error.response?.data?.error || error.message}`;
        }
    },
    {
        name: "create_screening",
        description: "Створює новий сеанс у розкладі.",
        schema: z.object({
            startTime: z.string().describe("Час початку у форматі ISO (наприклад, '2026-07-25T18:00:00Z')"),
            price: z.number().describe("Ціна квитка"),
            movieId: z.number().describe("ID фільму (отримай через list_movies)"),
            hallId: z.number().describe("ID зали (отримай через list_halls)"),
        }),
    }
);