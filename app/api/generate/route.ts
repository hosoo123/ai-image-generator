import { toEnglishFoodImagePrompt } from "@/lib/gemini-food";
import { apiError, getHuggingFaceClient } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt?: string };

    if (!prompt?.trim()) {
      return Response.json({ error: "Зургийн тайлбараа бичнэ үү." }, { status: 400 });
    }

    const userPrompt = prompt.trim();
    const imagePrompt = await toEnglishFoodImagePrompt(userPrompt);

    const client = getHuggingFaceClient();
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
