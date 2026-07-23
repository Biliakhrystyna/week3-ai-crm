import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getAllMovies, updateMovie, deleteMovie } from '../../api/services/movieService';

// 1. Tool для пошуку фільмів
export const listMoviesTool = tool(
    async ({ title }) => {
        try {
            const movies = await getAllMovies(title || "");
            return JSON.stringify(movies);
        } catch (error) {
            return "Не вдалося отримати список фільмів.";
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
            const movie = await updateMovie(id, updateData);
            return JSON.stringify({ status: "success", movie });
        } catch (error) {
            return "Не вдалося оновити фільм.";
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
            await deleteMovie(id);
            return "Фільм успішно видалено.";
        } catch (error) {
            return "Помилка при видаленні фільму.";
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