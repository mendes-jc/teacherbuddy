import type { AIProvider } from "@/lib/ai/types";
import { claudeProvider } from "@/lib/ai/providers/claude";
import { openaiProvider } from "@/lib/ai/providers/openai";

const providers: Record<string, AIProvider> = {
  claude: claudeProvider,
  openai: openaiProvider,
};

/**
 * Selects the active provider from the AI_PROVIDER env var (default "claude").
 * Add a new model/provider by writing one adapter and registering it here — the
 * rest of the app is provider-unaware.
 */
export function getProvider(): AIProvider {
  const name = (process.env.AI_PROVIDER || "claude").toLowerCase();
  const provider = providers[name];
  if (!provider) {
    throw new Error(
      `Unknown AI_PROVIDER "${name}". Available: ${Object.keys(providers).join(", ")}.`,
    );
  }
  return provider;
}

export type { AIProvider };
export { buildSuggestionContext } from "@/lib/ai/context";
export type { SuggestionResult } from "@/lib/ai/types";
