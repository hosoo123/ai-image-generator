import { generateGeminiText } from "@/lib/gemini";
import {
  fallbackEnglishFoodPrompt,
  knownEnglishFoodPrompt,
  knownIngredientResult,
} from "@/lib/mongolian-dishes";

export type FoodIngredientResult = {
  dishName: string;
  summary: string;
  ingredients: string[];
  note: string;
};

const INGREDIENT_SYSTEM = `Identify the dish and extract its typical ingredients. The user may write only a dish name.
A short name is enough: "Бууз", "Хуушуур", "buuz", or "pasta carbonara" should all be recognized.
Cyrillic Mongolian and Mongolian written in Latin letters are Mongolian.
When the user writes Mongolian (Cyrillic or Latin), reply in fluent natural Mongolian Cyrillic.
When the user writes in English, reply in English.
Do not translate a Mongolian dish into an unrelated English dish.
Return only valid JSON with this exact shape: {"dishName":"...","summary":"...","ingredients":["..."],"note":"..."}.
The summary must introduce the identified dish and ingredient list.
The note must be one short, friendly closing sentence.
Do not use markdown. Do not claim uncertain ingredients as certain.`;

const IMAGE_PROMPT_SYSTEM = `Convert the user's food image request into one detailed English image-generation prompt for a photorealistic food photo.
The user may write only a dish name in Mongolian Cyrillic, Mongolian Latin, or English.
Understand Mongolian Latin as Mongolian. "бууз" or "buuz" means Mongolian steamed meat dumplings, not a random plate of food.
Keep the same specific dish. Do not invent a different meal.
Return only the English prompt. No quotes, no markdown, no extra commentary.`;

function cleanModelText(text: string) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:[\w-]+)?\n?([\s\S]*?)```/g, "$1")
    .trim();
}

export function parseIngredientResult(text: string): FoodIngredientResult {
  const json = cleanModelText(text).match(/\{[\s\S]*\}/)?.[0];

  if (!json) {
    throw new Error("Орцын хариу уншигдсангүй. Дахин оролдоно уу.");
  }

  let parsed: {
    dishName?: unknown;
    summary?: unknown;
    ingredients?: unknown;
    note?: unknown;
  };

  try {
    parsed = JSON.parse(json) as typeof parsed;
  } catch {
    throw new Error("Орцын хариу уншигдсангүй. Дахин оролдоно уу.");
  }

  const ingredients = Array.isArray(parsed.ingredients)
    ? parsed.ingredients.map(String).slice(0, 30)
    : [];
  const dishName = String(parsed.dishName || "").trim();

  if (!dishName && ingredients.length === 0) {
    throw new Error("Орц танигдсангүй. Хоолны нэрээ дахин бичнэ үү.");
  }

  return {
    dishName: dishName || "Таны хоол",
    summary: String(parsed.summary || "Хоолны орцууд:"),
    ingredients,
    note: String(parsed.note || "Энгийн, амттай хоол!"),
  };
}

export async function recognizeFoodIngredients(description: string) {
  const known = knownIngredientResult(description);
  if (known) return known;

  const reply = await generateGeminiText(INGREDIENT_SYSTEM, description, 500);
  return parseIngredientResult(reply);
}

export async function toEnglishFoodImagePrompt(prompt: string) {
  const known = knownEnglishFoodPrompt(prompt);
  if (known) return known;

  try {
    const reply = cleanModelText(
      await generateGeminiText(IMAGE_PROMPT_SYSTEM, prompt, 180),
    )
      .replace(/^["']+|["']+$/g, "")
      .trim();

    if (reply && !/[\u0400-\u04FF]/.test(reply)) {
      return reply;
    }
  } catch {
    // Use the local dish-name fallback instead of sending Mongolian to FLUX.
  }

  return fallbackEnglishFoodPrompt(prompt);
}
