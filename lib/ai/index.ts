import type { AIProvider } from "@/lib/ai/types";
import { claudeProvider } from "@/lib/ai/providers/claude";
import { openaiProvider } from "@/lib/ai/providers/openai";
import { geminiProvider } from "@/lib/ai/providers/gemini";

const providers: Record<string, AIProvider> = {
  claude: claudeProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
};

/** Which env var holds each provider's key (for the "configured?" check). */
const keyEnvVar: Record<string, string> = {
  claude: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

function selectedName(): string {
  return (process.env.AI_PROVIDER || "claude").toLowerCase();
}

/**
 * Selects the active provider from the AI_PROVIDER env var (default "claude").
 * Add a new model/provider by writing one adapter and registering it here — the
 * rest of the app is provider-unaware.
 */
export function getProvider(): AIProvider {
  const name = selectedName();
  const provider = providers[name];
  if (!provider) {
    throw new Error(
      `Unknown AI_PROVIDER "${name}". Available: ${Object.keys(providers).join(", ")}.`,
    );
  }
  return provider;
}

/** True if the selected provider's API key is present (server-side check). */
export function isAIConfigured(): boolean {
  const envVar = keyEnvVar[selectedName()];
  return !!envVar && !!process.env[envVar];
}

export type { AIProvider };
export { buildSuggestionContext } from "@/lib/ai/context";
export type { SuggestionResult } from "@/lib/ai/types";
