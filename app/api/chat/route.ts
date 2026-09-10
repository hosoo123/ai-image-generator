import { generateGeminiReply } from "@/lib/gemini";

type ChatMessage = { role: "assistant" | "user"; text: string };

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages?: ChatMessage[] };

    if (!messages?.length) {
      return Response.json({ error: "Please enter a message." }, { status: 400 });
    }

    const reply = await generateGeminiReply(messages);

    return Response.json({ reply });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected Gemini API error occurred.";

    return Response.json({ error: message }, { status: 502 });
  }
}
