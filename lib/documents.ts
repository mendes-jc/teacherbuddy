import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/lib/types";

/** All of the signed-in teacher's documents, newest first. */
export async function listDocuments(): Promise<Document[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, teacher_id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Document[];
}

/** True if the teacher has any material to ground suggestions in. */
export async function hasDocuments(): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

/** Top-k most relevant chunks for a query embedding (RLS-scoped via the RPC). */
export async function matchChunks(
  embedding: number[],
  k = 6,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: embedding,
    match_count: k,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as { content: string }[]).map((r) => r.content);
}
