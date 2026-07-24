import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { apiClient, setAuthToken } from '../api/client';
import { agentGraph } from './graph';
import { logTrace } from './logger';

async function runCapstone() {
    console.log(" Запуск Capstone...");
    try {
        console.log("Авторизація агента...");
        const auth = await apiClient.post('/auth/login', { 
            email: process.env.CRM_USERNAME, 
            password: process.env.CRM_PASSWORD 
        });const token = auth.data.token;
        if (!token) throw new Error("Токен не отримано від сервера!");
        setAuthToken(auth.data.token);
        console.log("Успішна авторизація! Токен встановлено.");

        const userPrompt = process.argv.slice(2).join(" ");
        if (!userPrompt) {
            console.log("Помилка: Не ввели промпт!");
            process.exit(1);
        }
        
        const result = await agentGraph.invoke({ 
            messages: [{ role: "user", content: userPrompt }] 
            },
         {
            recursionLimit: 40
        });''
        
        const lastMessage = result.messages[result.messages.length - 1].content;
        console.log(" Результат:", lastMessage);

        // Зберігаємо лог (це твоя інтеграційна вимога)
        logTrace("Capstone run completed", { prompt: userPrompt, response: lastMessage, status: "success" });
        
    } catch (err: any) {
        console.error("Помилка:", err.message);
        logTrace("Capstone run completed",{ error: err.message, status: "failed" });
    }
}

runCapstone();