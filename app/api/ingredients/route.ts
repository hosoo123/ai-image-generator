import { apiError, getHuggingFaceClient } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { description } = (await request.json()) as { description?: string };

    if (!description?.trim()) {
      return Response.json({ error: "Please describe the food." }, { status: 400 });
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
            'Identify the dish and extract its ingredients from the user description. Reply in the same language as the user. Return only valid JSON with this exact shape: {"dishName":"...","summary":"...","ingredients":["..."],"note":"..."}. The summary must introduce the identified dish and ingredient list. The note must be one short, friendly closing sentence. Do not use markdown. Do not claim uncertain ingredients as certain.',
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
      dishName: String(parsed.dishName || "Your dish"),
      summary: String(
        parsed.summary || "Here is a quick summary of the identified ingredients:",
      ),
      ingredients,
      note: String(parsed.note || "Simple, classic, and delicious!"),
    });
  } catch (error) {
    return apiError(error);
  }
}
