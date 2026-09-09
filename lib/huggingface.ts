import { InferenceClient } from "@huggingface/inference";

export function getHuggingFaceClient() {
  const token = process.env.HF_TOKEN;

  if (!token) {
    throw new Error("HF_TOKEN is missing. Add it to .env.local and restart the server.");
  }

  return new InferenceClient(token);
}

export function apiError(error: unknown) {
  console.error(error);

  const message =
    error instanceof Error ? error.message : "An unexpected AI service error occurred.";

  return Response.json({ error: message }, { status: 500 });
}
