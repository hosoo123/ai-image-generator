import { apiError, getHuggingFaceClient } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { description } = (await request.json()) as { description?: string };

    if (!description?.trim()) {
      return Response.json({ error: "Хоолоо тайлбарлана уу." }, { status: 400 });
    }

    const client = getHuggingFaceClient();
    const result = await client.chatCompletion({
      model: process.env.HF_CHAT_MODEL || "Qwen/Qwen3-32B",
      provider: "auto",
      max_tokens: 300,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            'Identify the dish and extract its ingredients from the user description. Return only valid JSON with this exact shape: {"dishName":"...","summary":"...","ingredients":["..."],"note":"..."}. The summary must introduce the identified dish and ingredient list. The note must be one short, friendly closing sentence. Do not use markdown. Do not claim uncertain ingredients as certain. Language rules: reply in the language of the user\'s latest message; when the user writes in Mongolian Cyrillic, write dishName, summary, ingredients, and note in fluent natural Mongolian Cyrillic; when the user writes Mongolian using Latin letters, understand it as Mongolian and reply in Mongolian Cyrillic; when the user writes in English, reply in English; do not translate Mongolian into English unless the user wrote in English; avoid stiff or machine-translated Mongolian.',
        },
        { role: "user", content: description.trim() },
      ],
    });

    const content = String(result.choices[0]?.message.content || "{}");
    const json = content.match(/\{[\s\S]*\}/)?.[0] || "{}";
    const parsed = JSON.parse(json) as {
      dishName?: unknown;
      summary?: unknown;
      ingredients?: unknown;
      note?: unknown;
    };
    const ingredients = Array.isArray(parsed.ingredients)
      ? parsed.ingredients.map(String).slice(0, 30)
      : [];

    return Response.json({
      dishName: String(parsed.dishName || "Таны хоол"),
      summary: String(parsed.summary || "Хоолны орцууд:"),
      ingredients,
      note: String(parsed.note || "Энгийн, амттай хоол!"),
    });
  } catch (error) {
    return apiError(error);
  }
}
