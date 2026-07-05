import { z } from "zod";

/**
 * The normalized shape every provider must return. The rest of the app depends
 * on this — never on a provider's raw response.
 */
export const suggestionResultSchema = z.object({
  where_they_are: z.string(),
  struggles_identified: z.array(z.string()),
  next_lesson_plan: z.array(z.string()),
  exercises: z.array(z.string()),
  longer_term_direction: z.string(),
});

export type SuggestionResult = z.infer<typeof suggestionResultSchema>;

/** JSON Schema handed to providers that support structured output. */
export const suggestionJsonSchema = {
  type: "object",
  properties: {
    where_they_are: {
      type: "string",
      description: "A short read of where the student is right now.",
    },
    struggles_identified: {
      type: "array",
      items: { type: "string" },
      description: "Concrete difficulties to address.",
    },
    next_lesson_plan: {
      type: "array",
      items: { type: "string" },
      description: "Ordered, concrete steps for the next lesson.",
    },
    exercises: {
      type: "array",
      items: { type: "string" },
      description: "Specific exercises or drills to assign.",
    },
    longer_term_direction: {
      type: "string",
      description: "Where to steer this student over the coming weeks.",
    },
  },
  required: [
    "where_they_are",
    "struggles_identified",
    "next_lesson_plan",
    "exercises",
    "longer_term_direction",
  ],
  additionalProperties: false,
} as const;

/** A provider-neutral request. Adapters translate this to their own API. */
export interface AIRequest {
  system: string;
  user: string;
  schema: typeof suggestionJsonSchema;
}

/** The interface every model/provider adapter implements. */
export interface AIProvider {
  readonly name: string;
  generateSuggestions(
    request: AIRequest,
  ): Promise<{ result: SuggestionResult; model: string }>;
}

/** Raised when a provider is selected but its API key is missing. */
export class AINotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AINotConfiguredError";
  }
}
