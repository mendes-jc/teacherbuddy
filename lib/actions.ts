"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StudentInput, LessonNoteInput } from "@/lib/types";

type Result = { error: string | null };

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, userId: user.id };
}

/** Turn "" into null so empty optional fields stay empty in the DB. */
function nullify(value: string): string | null {
  const v = value.trim();
  return v.length ? v : null;
}

export async function createStudent(
  input: StudentInput,
): Promise<Result & { id?: string }> {
  if (!input.name.trim()) return { error: "Name is required." };
  try {
    const { supabase, userId } = await requireUserId();
    const { data, error } = await supabase
      .from("students")
      .insert({
        teacher_id: userId,
        name: input.name.trim(),
        learner_type: input.learner_type,
        focus: nullify(input.focus),
        level: nullify(input.level),
        goals: nullify(input.goals),
        status: input.status,
        general_notes: nullify(input.general_notes),
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/dashboard");
    return { error: null, id: data.id as string };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateStudent(
  id: string,
  input: StudentInput,
): Promise<Result> {
  if (!input.name.trim()) return { error: "Name is required." };
  try {
    const { supabase } = await requireUserId();
    const { error } = await supabase
      .from("students")
      .update({
        name: input.name.trim(),
        learner_type: input.learner_type,
        focus: nullify(input.focus),
        level: nullify(input.level),
        goals: nullify(input.goals),
        status: input.status,
        general_notes: nullify(input.general_notes),
      })
      .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/dashboard");
    revalidatePath(`/students/${id}`);
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createLessonNote(
  studentId: string,
  input: LessonNoteInput,
): Promise<Result> {
  try {
    const { supabase, userId } = await requireUserId();
    const { error } = await supabase.from("lesson_notes").insert({
      student_id: studentId,
      teacher_id: userId,
      date: input.date,
      focus_area: nullify(input.focus_area),
      progress_rating: input.progress_rating,
      struggle_tags: input.struggle_tags,
      what_worked: nullify(input.what_worked),
      homework: nullify(input.homework),
      freeform_notes: nullify(input.freeform_notes),
    });

    if (error) return { error: error.message };
    revalidatePath(`/students/${studentId}`);
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
