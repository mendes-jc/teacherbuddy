import { AINotConfiguredError } from "@/lib/ai/types";
import type { EmbeddingProvider } from "@/lib/ai/embeddings/types";
import { openAICompatibleEmbed } from "@/lib/ai/embeddings/openai-compatible-embed";

/**
 * Gemini embeddings via the OpenAI-compatible endpoint. `text-embedding-004` is
 * natively 768-dim, matching EMBEDDING_DIM. Free tier friendly.
 */
export const geminiEmbeddingProvider: EmbeddingProvider = {
  name: "gemini",

  async embed(texts) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AINotConfiguredError(
        "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey.",
      );
    }
    return openAICompatibleEmbed({
      baseUrl:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey,
      model: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
      texts,
    });
  },
};
