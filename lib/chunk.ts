/**
 * Split text into overlapping chunks for embedding. Prefers paragraph/sentence
 * boundaries, then hard-wraps anything still too long.
 */
export function chunkText(
  text: string,
  { size = 800, overlap = 120 }: { size?: number; overlap?: number } = {},
): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  // Split into paragraphs, then greedily pack into chunks up to `size`.
  const paragraphs = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const push = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(trimmed);
    current = "";
  };

  for (const para of paragraphs) {
    if (para.length > size) {
      push();
      // Hard-wrap a very long paragraph with overlap.
      for (let i = 0; i < para.length; i += size - overlap) {
        chunks.push(para.slice(i, i + size).trim());
      }
      continue;
    }
    if ((current + "\n\n" + para).length > size) {
      push();
    }
    current = current ? `${current}\n\n${para}` : para;
  }
  push();

  return chunks;
}
