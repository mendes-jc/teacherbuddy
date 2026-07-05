import { type AIProvider, AINotConfiguredError } from "@/lib/ai/types";
import { openAICompatibleGenerate } from "@/lib/ai/providers/openai-compatible";

/**
 * Google Gemini via its OpenAI-compatible endpoint. Free tier available —
 * get a key at https://aistudio.google.com/apikey.
 */
export const geminiProvider: AIProvider = {
  name: "gemini",

  async generateSuggestions(request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AINotConfiguredError(
        "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey.",
      );
    }
    return openAICompatibleGenerate({
      baseUrl:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      request,
      // Gemini's compat endpoint is happiest without strict json_schema.
      strict: false,
    });
  },
};
