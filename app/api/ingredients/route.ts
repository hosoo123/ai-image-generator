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
            "Extract likely ingredients from the food description. Return only a JSON array of short ingredient names, with no markdown.",
        },
        { role: "user", content: description.trim() },
      ],
    });

    const content = String(result.choices[0]?.message.content || "[]");
    const json = content.match(/\[[\s\S]*\]/)?.[0] || "[]";
    const parsed = JSON.parse(json);
    const ingredients = Array.isArray(parsed) ? parsed.map(String).slice(0, 30) : [];

    return Response.json({ ingredients });
  } catch (error) {
    return apiError(error);
  }
}
