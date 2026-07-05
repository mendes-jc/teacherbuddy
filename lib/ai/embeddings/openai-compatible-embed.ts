/**
 * Shared caller for any OpenAI-compatible `/embeddings` endpoint
 * (OpenAI, Gemini's compat endpoint, Together, etc.).
 */
export async function openAICompatibleEmbed(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  texts: string[];
  /** Only sent when set (some models fix their own dimension). */
  dimensions?: number;
}): Promise<number[][]> {
  const { baseUrl, apiKey, model, texts, dimensions } = opts;
  if (texts.length === 0) return [];

  const res = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
      ...(dimensions ? { dimensions } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Embedding request failed (${res.status}): ${await res.text()}`,
    );
  }

  const data = await res.json();
  const rows: { index: number; embedding: number[] }[] = data?.data ?? [];
  // Return in input order.
  return rows
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((r) => r.embedding);
}
