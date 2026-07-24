import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { apiClient } from '../../api/client';


// 1. Tool для створення зали
export const createHallTool = tool(
    async ({ name, capacity }) => {
        try {
           const response = await apiClient.post('/halls', { name, capacity });
            return JSON.stringify({ status: "success", hall: response.data });
        } catch (error: any) {
            return `Не вдалося створити залу: ${error.response?.data?.error || error.message}`;
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
            const response = await apiClient.get('/halls');
            return JSON.stringify(response.data);
        } catch (error: any) {
            return `Не вдалося отримати список залів: ${error.response?.data?.error || error.message}`;
        }
    },
    {
        name: "list_halls",
        description: "Повертає список усіх наявних залів.",
        schema: z.object({}), // Не потребує аргументів
    }
);