import { type AIProvider, AINotConfiguredError } from "@/lib/ai/types";
import { openAICompatibleGenerate } from "@/lib/ai/providers/openai-compatible";

/**
 * OpenAI (and any OpenAI-compatible endpoint via OPENAI_BASE_URL). Point
 * OPENAI_BASE_URL at Groq / OpenRouter / Together / Ollama to reuse this.
 */
export const openaiProvider: AIProvider = {
  name: "openai",

  async generateSuggestions(request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AINotConfiguredError(
        "OPENAI_API_KEY is not set. Add it to .env.local to use the OpenAI provider.",
      );
    }
    return openAICompatibleGenerate({
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      apiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-2024-08-06",
      request,
      strict: true,
    });
  },
};
