import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getAllScreenings, createScreening } from '../../api/services/screeningService';

// 1. Tool для отримання списку сеансів
export const listScreeningsTool = tool(
    async () => {
        try {
            const screenings = await getAllScreenings();
            return JSON.stringify(screenings);
        } catch (error) {
            return "Не вдалося отримати розклад.";
        }
    },
    {
        name: "list_screenings",
        description: "Отримує поточний розклад усіх сеансів у кінотеатрі.",
        schema: z.object({}), // Не потребує аргументів
    }
);

// 2. Tool для створення нового сеансу
export const createScreeningTool = tool(
    async ({ startTime, price, movieId, hallId }) => {
        try {
            // Викликаємо твій сервіс (перетворюємо дані, якщо треба)
            const screening = await createScreening({ 
                startTime, 
                price, 
                movieId, 
                hallId 
            });
            return JSON.stringify({ status: "success", screening });
        } catch (error: any) {
            return `Не вдалося створити сеанс: ${error.message}`;
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