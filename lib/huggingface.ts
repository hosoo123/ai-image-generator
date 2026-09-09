import {
  InferenceClient,
  InferenceClientHubApiError,
  InferenceClientProviderApiError,
} from "@huggingface/inference";

export function getHuggingFaceClient() {
  const token = process.env.HF_TOKEN;

  if (!token) {
    throw new Error("HF_TOKEN is missing. Add it to .env.local and restart the server.");
  }

  return new InferenceClient(token);
}

export function apiError(error: unknown) {
  console.error(error);

  if (
    error instanceof InferenceClientProviderApiError ||
    error instanceof InferenceClientHubApiError
  ) {
    const providerBody = error.httpResponse.body;
    const details =
      typeof providerBody === "string"
        ? providerBody
        : JSON.stringify(providerBody);

    return Response.json(
      {
        error: error.message,
        details,
        providerStatus: error.httpResponse.status,
      },
      { status: 502 },
    );
  }

  const message =
    error instanceof Error ? error.message : "An unexpected AI service error occurred.";

  return Response.json({ error: message }, { status: 500 });
}
