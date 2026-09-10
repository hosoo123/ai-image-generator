import { apiError, getHuggingFaceClient } from "@/lib/huggingface";

type ChatMessage = { role: "assistant" | "user"; text: string };

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages?: ChatMessage[] };

    if (!messages?.length) {
      return Response.json({ error: "Please enter a message." }, { status: 400 });
    }

    const client = getHuggingFaceClient();
    const result = await client.chatCompletion({
      model: process.env.HF_CHAT_MODEL || "Qwen/Qwen3-32B",
      provider: "auto",
      max_tokens: 450,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful food assistant. Always reply in the same language as the user's latest message. If the user writes in Mongolian, reply naturally and clearly in Mongolian. If the user writes in English, reply in English. Answer clearly and briefly. Mention uncertainty and food-safety limits when relevant.",
        },
        ...messages.slice(-10).map((message) => ({
          role: message.role,
          content: message.text,
        })),
      ],
    });

    return Response.json({ reply: result.choices[0]?.message.content || "No reply returned." });
  } catch (error) {
    return apiError(error);
  }
}
