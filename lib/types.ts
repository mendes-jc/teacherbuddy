import type { SuggestionResult } from "@/lib/ai/types";

export type LearnerType = "adult" | "child";
export type StudentStatus = "active" | "inactive";
export type SuggestionStatus = "new" | "accepted" | "edited" | "dismissed";

export interface Student {
  id: string;
  teacher_id: string;
  name: string;
  learner_type: LearnerType;
  focus: string | null;
  level: string | null;
  goals: string | null;
  start_date: string | null;
  status: StudentStatus;
  general_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonNote {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  focus_area: string | null;
  progress_rating: number | null;
  struggle_tags: string[];
  what_worked: string | null;
  homework: string | null;
  freeform_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Fields a teacher edits when creating/updating a student. */
export interface StudentInput {
  name: string;
  learner_type: LearnerType;
  focus: string;
  level: string;
  goals: string;
  status: StudentStatus;
  general_notes: string;
}

export interface Document {
  id: string;
  teacher_id: string;
  name: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  student_id: string;
  teacher_id: string;
  generated_at: string;
  content: SuggestionResult;
  source_note_ids: string[];
  provider: string | null;
  model: string | null;
  teacher_feedback: string | null;
  status: SuggestionStatus;
}

/** Fields a teacher fills in when logging a lesson. */
export interface LessonNoteInput {
  date: string;
  focus_area: string;
  progress_rating: number | null;
  struggle_tags: string[];
  what_worked: string;
  homework: string;
  freeform_notes: string;
}
