"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudent } from "@/lib/students";
import { listLessonNotes } from "@/lib/lesson-notes";
import { getProvider, buildSuggestionContext } from "@/lib/ai";
import { getEmbeddingProvider, isEmbeddingConfigured } from "@/lib/ai/embeddings";
import { matchChunks } from "@/lib/documents";
import { chunkText } from "@/lib/chunk";
import { AINotConfiguredError } from "@/lib/ai/types";
import type {
  StudentInput,
  LessonNoteInput,
  SuggestionStatus,
} from "@/lib/types";

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

export async function generateSuggestion(studentId: string): Promise<Result> {
  try {
    const { supabase, userId } = await requireUserId();

    const student = await getStudent(studentId);
    if (!student) return { error: "Student not found." };
    const notes = await listLessonNotes(studentId);

    // RAG: ground in the teacher's material when embeddings are configured.
    // Never let retrieval failure block a suggestion.
    let references: string[] = [];
    if (isEmbeddingConfigured()) {
      try {
        const query = [
          student.focus,
          student.goals,
          ...notes.slice(0, 3).flatMap((n) => n.struggle_tags),
          notes[0]?.freeform_notes ?? "",
        ]
          .filter(Boolean)
          .join(" ")
          .slice(0, 2000);
        if (query.trim()) {
          const [queryEmbedding] = await getEmbeddingProvider().embed([query]);
          if (queryEmbedding) references = await matchChunks(queryEmbedding, 6);
        }
      } catch {
        references = [];
      }
    }

    const provider = getProvider();
    const request = buildSuggestionContext(student, notes, references);
    const { result, model } = await provider.generateSuggestions(request);

    const { error } = await supabase.from("suggestions").insert({
      student_id: studentId,
      teacher_id: userId,
      content: result,
      source_note_ids: notes.map((n) => n.id),
      provider: provider.name,
      model,
      status: "new",
    });

    if (error) return { error: error.message };
    revalidatePath(`/students/${studentId}`);
    return { error: null };
  } catch (e) {
    if (e instanceof AINotConfiguredError) return { error: e.message };
    return { error: (e as Error).message };
  }
}

export async function setSuggestionStatus(
  id: string,
  studentId: string,
  status: SuggestionStatus,
): Promise<Result> {
  try {
    const { supabase } = await requireUserId();
    const { error } = await supabase
      .from("suggestions")
      .update({ status })
      .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath(`/students/${studentId}`);
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createDocument(
  name: string,
  content: string,
): Promise<Result> {
  if (!name.trim()) return { error: "Give the material a name." };
  const chunks = chunkText(content);
  if (chunks.length === 0) return { error: "There's no text to add." };
  if (!isEmbeddingConfigured()) {
    return {
      error:
        "Embeddings aren't configured. Set an embedding provider key in .env.local to add material.",
    };
  }

  try {
    const { supabase, userId } = await requireUserId();

    const embeddings = await getEmbeddingProvider().embed(chunks);
    if (embeddings.length !== chunks.length) {
      return { error: "Embedding provider returned an unexpected result." };
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ teacher_id: userId, name: name.trim() })
      .select("id")
      .single();
    if (docError) return { error: docError.message };

    const rows = chunks.map((c, i) => ({
      document_id: doc.id as string,
      teacher_id: userId,
      content: c,
      embedding: embeddings[i],
      metadata: { index: i },
    }));
    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert(rows);
    if (chunkError) {
      // Roll back the (now orphaned) document row.
      await supabase.from("documents").delete().eq("id", doc.id);
      return { error: chunkError.message };
    }

    revalidatePath("/materials");
    return { error: null };
  } catch (e) {
    if (e instanceof AINotConfiguredError) return { error: e.message };
    return { error: (e as Error).message };
  }
}

export async function deleteDocument(id: string): Promise<Result> {
  try {
    const { supabase } = await requireUserId();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/materials");
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
