import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { allTools } from "."; 
import { logTrace } from "./logger"; // ДОДАНО: імпорт логера

const model = new ChatGoogleGenerativeAI({ 
    model: "gemini-3.1-flash-lite", 
    apiKey: process.env.GOOGLE_API_KEY,
}).bindTools(allTools);

// 1. Оновлений вузол агента з трейсингом
const agentNode = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages);
    
    // ТРЕЙСИНГ: Якщо агент згенерував виклик інструменту, логуємо це
    if (response.tool_calls && response.tool_calls.length > 0) {
        logTrace("Agent requested tools", { 
            tool_calls: response.tool_calls.map(t => ({ name: t.name, args: t.args })) 
        });
    } else {
        // Якщо агент просто відповідає текстом (кінець циклу)
        logTrace("Agent responded directly", { content: response.content });
    }

    return { messages: [response] };
};

const standardToolNode = new ToolNode(allTools);

// 2. ДОДАНО: Обгортка для ToolNode для логування результатів
const tracedToolNode = async (state: typeof MessagesAnnotation.State) => {
    // Виконуємо стандартний виклик інструментів
    const result = await standardToolNode.invoke(state);

    // Останні повідомлення в result.messages - це відповіді від інструментів
    const toolMessages = result.messages;
    
    // ТРЕЙСИНГ: Логуємо результат, який повернули інструменти (HTTP відповідь)
    logTrace("Tools executed", {
        results: toolMessages.map((m: any) => ({ 
            name: m.name, 
            response: m.content 
        }))
    });

    return result;
};

// Логіка переходу
const shouldContinue = (state: typeof MessagesAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1] as any;
    if (lastMessage.tool_calls?.length > 0) return "tools";
    return "__end__";
};

// 3. Змінюємо workflow, щоб він використовував наш tracedToolNode
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", tracedToolNode) // ЗМІНЕНО: використовуємо обгортку
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

export const agentGraph = workflow.compile();