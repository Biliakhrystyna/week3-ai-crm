import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { allTools } from "./tools"; // Всі твої тули вже мають бути огорнуті в tool()

const model = new ChatGoogleGenerativeAI({ 
    model: "gemini-3.1-flash-lite", 
    apiKey: "AQ.Ab8RN6IJWPwEBJcphtY6HEkMVbAkTVxRgRgQXxu1ah-eXfG_DA",
}).bindTools(allTools);

// Вузол агента
const agentNode = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
};

const toolNode = new ToolNode(allTools);

// Логіка переходу
const shouldContinue = (state: typeof MessagesAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1] as any;
    if (lastMessage.tool_calls?.length > 0) return "tools";
    return "__end__";
};

const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

export const agentGraph = workflow.compile();