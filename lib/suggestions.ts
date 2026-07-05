import { createClient } from "@/lib/supabase/server";
import type { Suggestion } from "@/lib/types";

/** The most recent suggestion for a student, or null. */
export async function getLatestSuggestion(
  studentId: string,
): Promise<Suggestion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suggestions")
    .select("*")
    .eq("student_id", studentId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Suggestion) ?? null;
}
