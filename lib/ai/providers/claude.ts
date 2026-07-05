import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  type AIProvider,
  type AIRequest,
  AINotConfiguredError,
  suggestionResultSchema,
} from "@/lib/ai/types";

const MODEL = "claude-opus-4-8";

export const claudeProvider: AIProvider = {
  name: "claude",

  async generateSuggestions(request: AIRequest) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AINotConfiguredError(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI suggestions.",
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: request.system,
      messages: [{ role: "user", content: request.user }],
      output_config: { format: zodOutputFormat(suggestionResultSchema) },
    });

    if (!response.parsed_output) {
      throw new Error(
        response.stop_reason === "refusal"
          ? "The model declined to produce a suggestion."
          : "The model did not return a valid suggestion.",
      );
    }

    return { result: response.parsed_output, model: response.model };
  },
};
