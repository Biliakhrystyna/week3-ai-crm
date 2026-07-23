import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createHall } from '../../api/services/hallService';
// Припустимо, що в тебе є цей метод у сервісі, або просто імпортуй його з prismaClient, якщо треба
import { prisma } from '../../api/prismaClient'; 

// 1. Tool для створення зали
export const createHallTool = tool(
    async ({ name, capacity }) => {
        try {
            const hall = await createHall({ name, capacity });
            return JSON.stringify({ status: "success", hall });
        } catch (error: any) {
            return `Не вдалося створити залу: ${error.message}`;
        }
    },
    {
        name: "create_hall",
        description: "Створює нову залу в кінотеатрі. Використовуй для розширення залів.",
        schema: z.object({
            name: z.string().describe("Назва зали (наприклад, 'Blue Hall')"),
            capacity: z.number().describe("Кількість місць у залі"),
        }),
    }
);

// 2. Tool для отримання списку залів (дуже корисно для агента)
export const listHallsTool = tool(
    async () => {
        try {
            const halls = await prisma.hall.findMany();
            return JSON.stringify(halls);
        } catch (error) {
            return "Не вдалося отримати список залів.";
        }
    },
    {
        name: "list_halls",
        description: "Повертає список усіх наявних залів.",
        schema: z.object({}), // Не потребує аргументів
    }
);