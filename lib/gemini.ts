type GeminiMessage = {
  role: "assistant" | "user";
  text: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function generateGeminiReply(messages: GeminiMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env.local or Vercel Environment Variables.",
    );
  }

  const model = process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash";
  let response: Response | undefined;
  let details = "";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are a friendly, capable conversational assistant for an AI food tools website.

Language rules:
- Reply in the language used in the user's latest message.
- When the user writes in Mongolian Cyrillic, reply in fluent, natural Mongolian Cyrillic.
- When the user writes Mongolian using Latin letters, understand it as Mongolian and reply in Mongolian Cyrillic.
- Do not translate Mongolian questions into English unless the user asks.
- Avoid stiff, machine-translated, overly formal, or unnatural Mongolian. Use everyday words that are easy to understand.

Conversation rules:
- You can handle greetings, casual conversation, follow-up questions, food questions, cooking advice, ingredients, recipes, nutrition, and general helpful conversation.
- Remember the recent conversation and answer in context.
- Match the requested level of detail: give a short direct answer for a simple question, and a clear step-by-step explanation when the user asks for detail.
- Use short paragraphs or bullet points when they make the answer easier to read.
- Be warm and conversational without adding unnecessary filler.
- Do not invent facts. Clearly state uncertainty when needed.
- For allergies, food safety, or medical nutrition topics, include a short safety note when relevant.`,
              },
            ],
          },
          contents: messages.slice(-10).map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.text }],
          })),
          generationConfig: {
            maxOutputTokens: 800,
          },
        }),
      },
    );

    if (response.ok) break;

    details = await response.text();
    const canRetry = response.status === 429 || response.status === 503;

    if (!canRetry || attempt === 2) {
      throw new Error(`Gemini API error ${response.status}: ${details}`);
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 700 * 2 ** attempt),
    );
  }

  if (!response?.ok) {
    throw new Error(`Gemini API request failed: ${details}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const reply = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!reply) {
    throw new Error("Gemini returned an empty reply.");
  }

  return reply;
}
