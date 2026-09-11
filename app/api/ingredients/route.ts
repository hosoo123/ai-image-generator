import {
  parseIngredientResult,
  recognizeFoodIngredients,
} from "@/lib/gemini-food";
import { apiError, getHuggingFaceClient } from "@/lib/huggingface";

const QWEN_SYSTEM =
  'Identify the dish and extract its typical ingredients. A short dish name is enough. Cyrillic Mongolian and Mongolian Latin letters are Mongolian. When the user writes Mongolian, reply in Mongolian Cyrillic. When the user writes English, reply in English. Return only valid JSON with this exact shape: {"dishName":"...","summary":"...","ingredients":["..."],"note":"..."}. The summary must introduce the identified dish and ingredient list. The note must be one short, friendly closing sentence. Do not use markdown.';

async function recognizeWithQwen(description: string) {
  const client = getHuggingFaceClient();
  const result = await client.chatCompletion({
    model: process.env.HF_CHAT_MODEL || "Qwen/Qwen3-32B",
    provider: "auto",
    max_tokens: 1200,
    temperature: 0.1,
    messages: [
      { role: "system", content: QWEN_SYSTEM },
      { role: "user", content: description },
    ],
  });

  return parseIngredientResult(String(result.choices[0]?.message.content || ""));
}

export async function POST(request: Request) {
  try {
    const { description } = (await request.json()) as { description?: string };

    if (!description?.trim()) {
      return Response.json({ error: "Хоолоо тайлбарлана уу." }, { status: 400 });
    }

    const text = description.trim();

    try {
      return Response.json(await recognizeFoodIngredients(text));
    } catch {
      return Response.json(await recognizeWithQwen(text));
    }
  } catch (error) {
    return apiError(error);
  }
}
