import { apiClient } from './api/client';

async function testSecurity() {
    console.log("🛡 Тестуємо захист API (спроба створити залу без токена)...");

    try {
        // Ми не робимо auth/login, тому токен не встановлено
        const response = await apiClient.post('/halls', { 
            name: "Hacker Hall", 
            capacity: 50 
        });
        console.log(" НЕБЕЗПЕЧНО! Залу створено без токена:", response.data);
    } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
            console.log(" Успішно! API відхилив запит (Статус:", err.response.status, "). Доступ закрито.");
        } else {
            console.log(" Отримано несподівану помилку:", err.message);
        }
    }
}

testSecurity();