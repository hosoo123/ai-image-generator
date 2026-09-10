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

  const model = process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash";
  const response = await fetch(
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
              text: "You are a helpful food assistant. Always reply in the same language as the user's latest message. If the user writes in Mongolian, reply naturally and clearly in Mongolian. If the user writes in English, reply in English. Answer clearly and briefly. Mention uncertainty and food-safety limits when relevant.",
            },
          ],
        },
        contents: messages.slice(-10).map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.text }],
        })),
        generationConfig: {
          maxOutputTokens: 450,
          temperature: 0.5,
        },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${details}`);
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
