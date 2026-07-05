import { createClient } from "@/lib/supabase/server";
import type { LessonNote } from "@/lib/types";

/** Lesson notes for a student, most recent first. */
export async function listLessonNotes(
  studentId: string,
): Promise<LessonNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_notes")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as LessonNote[];
}
