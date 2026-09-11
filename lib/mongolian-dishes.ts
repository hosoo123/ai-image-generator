export type KnownIngredientResult = {
  dishName: string;
  summary: string;
  ingredients: string[];
  note: string;
};

const DISH_INGREDIENTS: Record<string, KnownIngredientResult> = {
  бууз: {
    dishName: "Бууз",
    summary: "Буузны үндсэн орцууд:",
    ingredients: ["Гурил", "Ус", "Үхрийн эсвэл хонины мах", "Сонгино", "Давс", "Чинжүү"],
    note: "Шинээр жигнэсэн бууз хамгийн амттай.",
  },
  buuz: {
    dishName: "Бууз",
    summary: "Буузны үндсэн орцууд:",
    ingredients: ["Гурил", "Ус", "Үхрийн эсвэл хонины мах", "Сонгино", "Давс", "Чинжүү"],
    note: "Шинээр жигнэсэн бууз хамгийн амттай.",
  },
  хуушуур: {
    dishName: "Хуушуур",
    summary: "Хуушуурын үндсэн орцууд:",
    ingredients: ["Гурил", "Ус", "Үхрийн эсвэл хонины мах", "Сонгино", "Давс", "Тос"],
    note: "Шаржигнуун хуушуурыг цөцгийтэй идэхэд тохиромжтой.",
  },
  khuushuur: {
    dishName: "Хуушуур",
    summary: "Хуушуурын үндсэн орцууд:",
    ingredients: ["Гурил", "Ус", "Үхрийн эсвэл хонины мах", "Сонгино", "Давс", "Тос"],
    note: "Шаржигнуун хуушуурыг цөцгийтэй идэхэд тохиромжтой.",
  },
  huushuur: {
    dishName: "Хуушуур",
    summary: "Хуушуурын үндсэн орцууд:",
    ingredients: ["Гурил", "Ус", "Үхрийн эсвэл хонины мах", "Сонгино", "Давс", "Тос"],
    note: "Шаржигнуун хуушуурыг цөцгийтэй идэхэд тохиромжтой.",
  },
  цуйван: {
    dishName: "Цуйван",
    summary: "Цуйваны үндсэн орцууд:",
    ingredients: ["Гурил", "Үхрийн мах", "Сонгино", "Лууван", "Байцаа", "Тос", "Давс"],
    note: "Шарсан гурилтай цуйван өтгөн, цатгалан хоол.",
  },
  tsuivan: {
    dishName: "Цуйван",
    summary: "Цуйваны үндсэн орцууд:",
    ingredients: ["Гурил", "Үхрийн мах", "Сонгино", "Лууван", "Байцаа", "Тос", "Давс"],
    note: "Шарсан гурилтай цуйван өтгөн, цатгалан хоол.",
  },
  бантан: {
    dishName: "Бантан",
    summary: "Бантаны үндсэн орцууд:",
    ingredients: ["Гурил", "Мах", "Сонгино", "Давс", "Ус"],
    note: "Бантан нь энгийн, бүлээн шөл.",
  },
  bantan: {
    dishName: "Бантан",
    summary: "Бантаны үндсэн орцууд:",
    ingredients: ["Гурил", "Мах", "Сонгино", "Давс", "Ус"],
    note: "Бантан нь энгийн, бүлээн шөл.",
  },
  хорхог: {
    dishName: "Хорхог",
    summary: "Хорхогийн үндсэн орцууд:",
    ingredients: ["Хонины мах", "Сонгино", "Лууван", "Төмс", "Давс", "Халуун чулуу"],
    note: "Хорхог бол чулуугаар жигнэсэн махтай хоол.",
  },
  khorkhog: {
    dishName: "Хорхог",
    summary: "Хорхогийн үндсэн орцууд:",
    ingredients: ["Хонины мах", "Сонгино", "Лууван", "Төмс", "Давс", "Халуун чулуу"],
    note: "Хорхог бол чулуугаар жигнэсэн махтай хоол.",
  },
  horkhog: {
    dishName: "Хорхог",
    summary: "Хорхогийн үндсэн орцууд:",
    ingredients: ["Хонины мах", "Сонгино", "Лууван", "Төмс", "Давс", "Халуун чулуу"],
    note: "Хорхог бол чулуугаар жигнэсэн махтай хоол.",
  },
  гурилтайшөл: {
    dishName: "Гурилтай шөл",
    summary: "Гурилтай шөлний үндсэн орцууд:",
    ingredients: ["Гурил", "Мах", "Сонгино", "Давс", "Ус"],
    note: "Гурилтай шөл бүлээн, цатгалан хоол.",
  },
  "guriltai shul": {
    dishName: "Гурилтай шөл",
    summary: "Гурилтай шөлний үндсэн орцууд:",
    ingredients: ["Гурил", "Мах", "Сонгино", "Давс", "Ус"],
    note: "Гурилтай шөл бүлээн, цатгалан хоол.",
  },
  банш: {
    dishName: "Банш",
    summary: "Баншны үндсэн орцууд:",
    ingredients: ["Гурил", "Мах", "Сонгино", "Давс", "Ус"],
    note: "Баншыг шөлтэй нь идэхэд амттай.",
  },
  bansh: {
    dishName: "Банш",
    summary: "Баншны үндсэн орцууд:",
    ingredients: ["Гурил", "Мах", "Сонгино", "Давс", "Ус"],
    note: "Баншыг шөлтэй нь идэхэд амттай.",
  },
};

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

function lookupRecord<T>(table: Record<string, T>, text: string) {
  const key = normalizeDishKey(text);
  const compact = key.replace(/\s+/g, "");
  if (table[key]) return table[key];
  if (table[compact]) return table[compact];

  for (const dishKey of Object.keys(table)) {
    if (dishKey.length < 4) continue;
    const dishCompact = dishKey.replace(/\s+/g, "");
    if (key.includes(dishKey) || compact.includes(dishCompact)) {
      return table[dishKey];
    }
  }

  return undefined;
}

export function knownIngredientResult(text: string) {
  return lookupRecord(DISH_INGREDIENTS, text);
}

export function knownEnglishFoodPrompt(text: string) {
  return lookupRecord(DISH_PROMPTS, text);
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
  const mapped = knownEnglishFoodPrompt(text);

  if (mapped) return mapped;

  if (looksMongolian(text)) {
    const latin = latinizeMongolian(text) || "Mongolian food";
    return `photorealistic food photo of ${latin}, Mongolian dish`;
  }

  return `photorealistic food photo of ${text.trim()}`;
}
