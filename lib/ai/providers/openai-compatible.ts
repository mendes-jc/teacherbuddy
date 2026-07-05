import {
  type AIRequest,
  type SuggestionResult,
  suggestionResultSchema,
} from "@/lib/ai/types";

/**
 * Shared logic for any OpenAI-compatible Chat Completions endpoint
 * (OpenAI, Gemini's compat endpoint, Groq, OpenRouter, Together, Ollama, …).
 * Adapters just supply base URL, key, and model.
 */
export async function openAICompatibleGenerate(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  request: AIRequest;
  /** Some providers reject strict json_schema; set false for those. */
  strict?: boolean;
}): Promise<{ result: SuggestionResult; model: string }> {
  const { baseUrl, apiKey, model, request, strict = true } = opts;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "suggestion", strict, schema: request.schema },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Provider returned no content.");

  const result = suggestionResultSchema.parse(JSON.parse(content));
  return { result, model: data.model ?? model };
}
