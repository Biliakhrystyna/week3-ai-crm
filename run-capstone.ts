import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { apiClient, setAuthToken } from './api/client';
import { agentGraph } from './agent/graph';

// Функція логування
function logTrace(data: any) {
    const logDir = './logs';
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const logEntry = { timestamp: new Date().toISOString(), ...data };
    fs.appendFileSync(path.join(logDir, 'capstone-trace.jsonl'), JSON.stringify(logEntry) + '\n');
}

async function runCapstone() {
    console.log("🚀 Запуск Capstone...");
    try {
        const auth = await apiClient.post('/auth/login', { 
            email: process.env.CRM_USERNAME, 
            password: process.env.CRM_PASSWORD 
        });
        setAuthToken(auth.data.token);
        
        const userPrompt = process.argv.slice(2).join(" ");
        if (!userPrompt) {
            console.log("❌ Помилка: Ти не ввела промпт!");
            process.exit(1);
        }
        
        const result = await agentGraph.invoke({ 
            messages: [{ role: "user", content: userPrompt }] 
        });
        
        const lastMessage = result.messages[result.messages.length - 1].content;
        console.log("🏁 Результат:", lastMessage);

        // Зберігаємо лог (це твоя інтеграційна вимога)
        logTrace({ prompt: userPrompt, response: lastMessage, status: "success" });
        
    } catch (err: any) {
        console.error("❌ Помилка:", err.message);
        logTrace({ error: err.message, status: "failed" });
    }
}

runCapstone();