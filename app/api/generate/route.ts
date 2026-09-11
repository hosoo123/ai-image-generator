import { apiError, getHuggingFaceClient } from "@/lib/huggingface";

async function toEnglishImagePrompt(
  client: ReturnType<typeof getHuggingFaceClient>,
  prompt: string,
) {
  try {
    const result = await client.chatCompletion({
      model: process.env.HF_CHAT_MODEL || "Qwen/Qwen3-32B",
      provider: "auto",
      max_tokens: 120,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Convert the user's food image request into one detailed English image-generation prompt for a photorealistic food photo. The user may write in Mongolian Cyrillic, Mongolian Latin letters, or English. Understand Mongolian Latin as Mongolian. Keep the same dish, ingredients, and style. Return only the English prompt. No quotes, no markdown, no extra commentary.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = String(result.choices[0]?.message.content || "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/```(?:[\w-]+)?\n?([\s\S]*?)```/g, "$1")
      .replace(/^["'\s]+|["'\s]+$/g, "")
      .trim();

    return text || prompt;
  } catch {
    return prompt;
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt?: string };

    if (!prompt?.trim()) {
      return Response.json({ error: "Зургийн тайлбараа бичнэ үү." }, { status: 400 });
    }

    const client = getHuggingFaceClient();
    const imagePrompt = await toEnglishImagePrompt(client, prompt.trim());
    const image = await client.textToImage(
      {
        model: process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell",
        provider: "auto",
        inputs: imagePrompt,
      },
      { outputType: "dataUrl" },
    );

    return Response.json({ image });
  } catch (error) {
    return apiError(error);
  }
}
