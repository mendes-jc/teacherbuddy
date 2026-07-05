import {
  type AIProvider,
  type AIRequest,
  AINotConfiguredError,
  suggestionResultSchema,
} from "@/lib/ai/types";

/**
 * Example drop-in adapter (raw fetch, no extra dependency). Shows how little it
 * takes to add a provider: translate the neutral AIRequest into the provider's
 * API and normalize the response back to a SuggestionResult.
 */
export const openaiProvider: AIProvider = {
  name: "openai",

  async generateSuggestions(request: AIRequest) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AINotConfiguredError(
        "OPENAI_API_KEY is not set. Add it to .env.local to use the OpenAI provider.",
      );
    }
    const model = process.env.OPENAI_MODEL || "gpt-4o-2024-08-06";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
          json_schema: {
            name: "suggestion",
            strict: true,
            schema: request.schema,
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI request failed (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned no content.");

    const result = suggestionResultSchema.parse(JSON.parse(content));
    return { result, model: data.model ?? model };
  },
};
