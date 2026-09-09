import { apiError, getHuggingFaceClient } from "@/lib/huggingface";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return Response.json({ error: "Please select an image." }, { status: 400 });
    }

    const hasImageMimeType = image.type.startsWith("image/");
    const hasImageExtension = /\.(jpe?g|png|webp|gif)$/i.test(image.name);

    if (!hasImageMimeType && !hasImageExtension) {
      return Response.json({ error: "The selected file must be an image." }, { status: 400 });
    }

    if (image.size > 5 * 1024 * 1024) {
      return Response.json({ error: "The image must be smaller than 5 MB." }, { status: 400 });
    }

    const mimeType = image.type.startsWith("image/")
      ? image.type
      : image.name.toLowerCase().endsWith(".png")
        ? "image/png"
        : image.name.toLowerCase().endsWith(".webp")
          ? "image/webp"
          : image.name.toLowerCase().endsWith(".gif")
            ? "image/gif"
            : "image/jpeg";
    const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;
    const client = getHuggingFaceClient();
    const result = await client.chatCompletion({
      model: process.env.HF_VISION_MODEL || "Qwen/Qwen3-VL-8B-Instruct",
      provider: "auto",
      max_tokens: 450,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image. Identify the dish, visible ingredients, and useful nutrition or allergy notes. Be clear and concise. Do not claim certainty when an ingredient is not clearly visible.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    return Response.json({ result: result.choices[0]?.message.content || "No result returned." });
  } catch (error) {
    return apiError(error);
  }
}
