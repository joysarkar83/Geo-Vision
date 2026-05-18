import { aiConfig } from "../config/aiConfig.js";

/**
 * Handle chat interaction with OpenAI
 */
export async function handleChat(messages) {
  try {
    if (!aiConfig.openAI.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = {
      role: "system",
      content: "You are a helpful and expert assistant for Geo-Vision, a land and property platform. Your goal is to help users with questions about land registry, property value, legal terms related to land deeds, and general platform guidance. Keep your answers concise, informative, and professional. If you don't know the answer, politely state that you're an AI assistant and may not have that specific information.",
    };

    const apiMessages = [systemPrompt, ...messages];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.openAI.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.openAI.modelText || "gpt-4o",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      reply: data.choices[0].message,
    };
  } catch (error) {
    console.error("Chatbot error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
