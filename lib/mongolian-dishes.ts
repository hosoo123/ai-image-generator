const DISH_PROMPTS: Record<string, string> = {
  бууз: "photorealistic food photo of Mongolian steamed buuz dumplings filled with minced meat and onion, served on a plate",
  buuz: "photorealistic food photo of Mongolian steamed buuz dumplings filled with minced meat and onion, served on a plate",
  хуушуур:
    "photorealistic food photo of crispy fried Mongolian khuushuur meat pastries, golden brown, served with sour cream",
  khuushuur:
    "photorealistic food photo of crispy fried Mongolian khuushuur meat pastries, golden brown, served with sour cream",
  huushuur:
    "photorealistic food photo of crispy fried Mongolian khuushuur meat pastries, golden brown, served with sour cream",
  цуйван:
    "photorealistic food photo of Mongolian tsuivan stir-fried noodles with meat and vegetables",
  tsuivan:
    "photorealistic food photo of Mongolian tsuivan stir-fried noodles with meat and vegetables",
  бантан: "photorealistic food photo of Mongolian bantan flour soup with meat in a bowl",
  bantan: "photorealistic food photo of Mongolian bantan flour soup with meat in a bowl",
  хорхог:
    "photorealistic food photo of Mongolian khorkhog, meat cooked with hot stones",
  khorkhog:
    "photorealistic food photo of Mongolian khorkhog, meat cooked with hot stones",
  horkhog:
    "photorealistic food photo of Mongolian khorkhog, meat cooked with hot stones",
  гурилтайшөл:
    "photorealistic food photo of Mongolian guriltai shul noodle soup with meat",
  "guriltai shul":
    "photorealistic food photo of Mongolian guriltai shul noodle soup with meat",
  банш: "photorealistic food photo of Mongolian bansh dumplings in broth",
  bansh: "photorealistic food photo of Mongolian bansh dumplings in broth",
};

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  ө: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ү: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function normalizeDishKey(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function looksMongolian(text: string) {
  return /[\u0400-\u04FF]/.test(text);
}

export function latinizeMongolian(text: string) {
  return [...text]
    .map((char) => {
      const lower = char.toLowerCase();
      return CYRILLIC_TO_LATIN[lower] ?? char;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function fallbackEnglishFoodPrompt(text: string) {
  const key = normalizeDishKey(text);
  const compact = key.replace(/\s+/g, "");
  const mapped = DISH_PROMPTS[key] || DISH_PROMPTS[compact];

  if (mapped) return mapped;

  if (looksMongolian(text)) {
    const latin = latinizeMongolian(text) || "Mongolian food";
    return `photorealistic food photo of ${latin}, Mongolian dish`;
  }

  return `photorealistic food photo of ${text.trim()}`;
}
