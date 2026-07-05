import { AINotConfiguredError } from "@/lib/ai/types";
import {
  type EmbeddingProvider,
  EMBEDDING_DIM,
} from "@/lib/ai/embeddings/types";
import { openAICompatibleEmbed } from "@/lib/ai/embeddings/openai-compatible-embed";

/**
 * OpenAI (or any OpenAI-compatible endpoint via OPENAI_BASE_URL).
 * `text-embedding-3-*` supports reducing output to EMBEDDING_DIM dimensions.
 */
export const openaiEmbeddingProvider: EmbeddingProvider = {
  name: "openai",

  async embed(texts) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AINotConfiguredError(
        "OPENAI_API_KEY is not set. Add it to .env.local to use OpenAI embeddings.",
      );
    }
    return openAICompatibleEmbed({
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      apiKey,
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      texts,
      dimensions: EMBEDDING_DIM,
    });
  },
};
