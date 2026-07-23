import { agentGraph } from "./agent/graph";
import 'dotenv/config';
console.log("Ключ завантажено:", process.env.GOOGLE_API_KEY ? "ТАК" : "НІ");
async function testAgent() {
    const input = "Додай нову залу під назвою 'Main Hall' на 100 місць.";
    
    console.log("--- Початок сценарію ---");
    const result = await agentGraph.invoke(
        { messages: [{ role: "user", content: input }] },
        { configurable: { thread_id: "test-1" } }
    );
    
    console.log("Відповідь агента:", result.messages[result.messages.length - 1].content);
}

testAgent();