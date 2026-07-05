import type { Student, LessonNote } from "@/lib/types";
import { type AIRequest, suggestionJsonSchema } from "@/lib/ai/types";

const SYSTEM = `You are an experienced, encouraging teacher of music and creative
disciplines, coaching a fellow teacher on how to help one specific student.

You are given the student's profile, their goals, and a history of recent lesson
notes (most recent first). Ground every suggestion in that specific evidence —
their actual struggles, what has worked, and their stated goals. Be concrete and
practical, not generic. Prefer small, achievable next steps a teacher can act on
in the very next lesson. Adapt tone and difficulty to whether the learner is an
adult or a child.

Respond only with the structured fields requested.`;

function fmtDate(d: string) {
  return d;
}

function renderNote(note: LessonNote): string {
  const parts: string[] = [`- ${fmtDate(note.date)}`];
  if (note.focus_area) parts.push(`focus: ${note.focus_area}`);
  if (note.progress_rating != null)
    parts.push(`progress: ${note.progress_rating}/5`);
  if (note.struggle_tags.length)
    parts.push(`struggled with: ${note.struggle_tags.join(", ")}`);
  if (note.what_worked) parts.push(`what worked: ${note.what_worked}`);
  if (note.homework) parts.push(`homework: ${note.homework}`);
  if (note.freeform_notes) parts.push(`notes: ${note.freeform_notes}`);
  return parts.join(" | ");
}

/**
 * Provider-neutral: turns a student + their notes into an AIRequest.
 * No provider SDK is referenced here.
 */
export function buildSuggestionContext(
  student: Student,
  notes: LessonNote[],
): AIRequest {
  const recent = notes.slice(0, 12); // most recent first (already ordered)

  const profile = [
    `Name: ${student.name}`,
    `Learner: ${student.learner_type}`,
    student.focus ? `Focus: ${student.focus}` : null,
    student.level ? `Level: ${student.level}` : null,
    student.goals ? `Goals: ${student.goals}` : null,
    student.general_notes ? `General notes: ${student.general_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const history = recent.length
    ? recent.map(renderNote).join("\n")
    : "(no lessons logged yet)";

  const user = `STUDENT PROFILE\n${profile}\n\nRECENT LESSONS (most recent first)\n${history}\n\nBased on this, suggest the next moves to help this student progress toward their goals.`;

  return { system: SYSTEM, user, schema: suggestionJsonSchema };
}
