import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { apiClient } from '../../api/client';

// 1. Tool для пошуку фільмів
export const listMoviesTool = tool(
    async ({ title }) => {
        try {
            const response = await apiClient.get('/movies', { params: { title } });
            return JSON.stringify(response.data);
        } catch (error:any) {
            return `Не вдалося отримати список фільмів: ${error.response?.data?.error || error.message}`;
        }
    },
    {
        name: "list_movies",
        description: "Шукає фільми в базі даних. Можна шукати за назвою, або отримати всі фільми.",
        schema: z.object({
            title: z.string().optional().describe("Назва фільму для фільтрації"),
        }),
    }
);

// 2. Tool для оновлення фільму
export const updateMovieTool = tool(
    async ({ id, updateData }) => {
        try {
           const response = await apiClient.put(`/movies/${id}`, updateData);
            return JSON.stringify({ status: "success", movie: response.data });
        } catch (error:any) {
            return `Не вдалося оновити фільм: ${error.response?.data?.error || error.message}`;
        }
    },
    {
        name: "update_movie",
        description: "Оновлює дані фільму за його ID.",
        schema: z.object({
            id: z.number().describe("ID фільму, який треба оновити"),
            updateData: z.any().describe("Об'єкт з новими даними для фільму"),
        }),
    }
);

// 3. Tool для видалення фільму
export const deleteMovieTool = tool(
    async ({ id }) => {
        try {
            await apiClient.delete(`/movies/${id}`);
            return "Фільм успішно видалено.";
        } catch (error:any) {
           return `Помилка при видаленні фільму: ${error.response?.data?.error || error.message}`;
        }
    },
    {
        name: "delete_movie",
        description: "Видаляє фільм з бази даних за його ID.",
        schema: z.object({
            id: z.number().describe("ID фільму, який треба видалити"),
        }),
    }
);