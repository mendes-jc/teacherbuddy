import { createClient } from "@/lib/supabase/server";
import type { Student } from "@/lib/types";

/** All of the signed-in teacher's students (RLS scopes to the owner). */
export async function listStudents(): Promise<Student[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Student[];
}

/** A single student by id, or null if not found / not owned. */
export async function getStudent(id: string): Promise<Student | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Student) ?? null;
}
