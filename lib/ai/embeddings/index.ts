import type { EmbeddingProvider } from "@/lib/ai/embeddings/types";
import { geminiEmbeddingProvider } from "@/lib/ai/embeddings/providers/gemini";
import { openaiEmbeddingProvider } from "@/lib/ai/embeddings/providers/openai";

const providers: Record<string, EmbeddingProvider> = {
  gemini: geminiEmbeddingProvider,
  openai: openaiEmbeddingProvider,
};

const keyEnvVar: Record<string, string> = {
  gemini: "GEMINI_API_KEY",
  openai: "OPENAI_API_KEY",
};

// Defaults to Gemini (free tier). Override with EMBEDDING_PROVIDER.
function selectedName(): string {
  return (process.env.EMBEDDING_PROVIDER || "gemini").toLowerCase();
}

export function getEmbeddingProvider(): EmbeddingProvider {
  const name = selectedName();
  const provider = providers[name];
  if (!provider) {
    throw new Error(
      `Unknown EMBEDDING_PROVIDER "${name}". Available: ${Object.keys(providers).join(", ")}.`,
    );
  }
  return provider;
}

export function isEmbeddingConfigured(): boolean {
  const envVar = keyEnvVar[selectedName()];
  return !!envVar && !!process.env[envVar];
}

export { EMBEDDING_DIM } from "@/lib/ai/embeddings/types";
export type { EmbeddingProvider };
