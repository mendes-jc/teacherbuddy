# TeacherBuddy — Design

**Date:** 2026-07-04
**Status:** Approved (pending spec review)

## 1. Purpose

A personal tool for a music/creativity teacher (adults or children) to manage students,
capture what happens in lessons, track progress and struggles over time, and get
AI-generated, personalized suggestions for the next moves that help a student reach
their goals. Built to be genuinely useful with zero AI first, then layered with
AI suggestions, then with document-grounded (RAG) suggestions.

Scope today: a personal tool for the author, plus possibly a few teacher friends.
Not a commercial multi-tenant SaaS — but built multi-teacher-ready via row-level
security so that stays cheap and non-disruptive if it grows.

### Feature priority (drives build order)
1. **The living student record** — organized, searchable history per student.
2. **AI "next moves" coach** — personalized suggestions from that record.
3. **Document-grounded suggestions (RAG)** — advice grounded in the teacher's own material.

## 2. Stack

- **Next.js (TypeScript)** — UI + server routes in one project. The AI provider key
  lives only in server routes, never in the browser.
- **Supabase** — Postgres (data), Auth (email login), Storage (documents, phase 3),
  and **pgvector** for RAG embeddings (phase 3). No separate vector database.
- **Claude Opus 4.8** — default AI model, behind a provider-agnostic interface (see §5).
- **Hosting** — Vercel free tier + Supabase free tier. $0 fixed cost; only pay-per-use
  AI spend.

## 3. Architecture

```
Browser (Next.js UI)
      │
      ▼
Next.js server routes  ──►  AI provider (default: Claude Opus 4.8)   ← key lives here only
      │
      ▼
Supabase
  ├─ Postgres (data + pgvector for RAG)
  ├─ Auth (email login; RLS scopes each teacher to their own rows)
  └─ Storage (uploaded documents, phase 3)
```

**Row-Level Security:** every domain row carries `teacher_id` and is readable/writable
only by its owning teacher. Set up from day one so multi-teacher works automatically
without a retrofit.

## 4. Data model

MVP tables: `students`, `lesson_notes`, `suggestions`.
RAG tables (phase 3): `documents`, `document_chunks`.

### `students`
- `id`, `teacher_id`
- `name`
- `learner_type` — adult | child
- `focus` — e.g. piano, guitar, songwriting, painting
- `level`
- `goals` — free text
- `start_date`
- `status` — active | inactive
- `general_notes`

### `lesson_notes` (hybrid capture — one row per lesson)
- `id`, `student_id`
- `date`
- `focus_area`
- `progress_rating` — 1–5 (structured, chartable)
- `struggle_tags` — string array (structured, chartable)
- `what_worked`
- `homework`
- `freeform_notes`

### `suggestions` (AI output, kept as history)
- `id`, `student_id`
- `generated_at`
- `content` — structured result (see §5 `SuggestionResult`)
- `source_note_ids` — which notes fed the suggestion
- `teacher_feedback`
- `status` — accepted | edited | dismissed

### `documents` (phase 3)
- `id`, `teacher_id`, `name`, `storage_path`

### `document_chunks` (phase 3)
- `id`, `document_id`, `content`, `embedding` (pgvector), `metadata`

**Progress tracking** is derived, not a separate system: chart `progress_rating` over
time and surface recurring `struggle_tags` from a student's `lesson_notes` history.

## 5. AI integration — provider-agnostic

The app never calls a model provider directly. The AI layer is a thin interface with
swappable adapters so any model/provider can be integrated by adding one file and
changing one env var.

```
suggestion route
      │
      ▼
buildSuggestionContext()   ← provider-neutral: student data → a plain request
      │                       (system prompt, user content, JSON output schema)
      ▼
AIProvider.generateSuggestions(request) → SuggestionResult   ← interface
      ├─ ClaudeProvider   (default — Opus 4.8, adaptive thinking)   ← built first
      ├─ OpenAIProvider   (drop-in later)
      └─ …any other
```

### Principles
- **One interface, swappable adapters.** `AIProvider.generateSuggestions(request)`
  returns a normalized `SuggestionResult`. Each adapter translates the neutral request
  into its provider's API and normalizes the response back to `SuggestionResult`, so the
  rest of the app is provider-unaware.
- **Prompt/context building is shared**, living outside the adapters — switching
  providers does not fork prompt logic.
- **Selected by config** — an `AI_PROVIDER` env var picks the adapter; each provider's
  key lives in server env only.
- **Structured output** is normalized per-provider (Claude via `output_config.format`,
  OpenAI via its JSON-schema response format, etc.) into the same `SuggestionResult`.

### `SuggestionResult` (indicative shape)
- `where_they_are`
- `struggles_identified[]`
- `next_lesson_plan[]`
- `exercises[]`
- `longer_term_direction`

### Flow
1. Teacher opens a student and clicks **"Suggest next moves."**
2. `buildSuggestionContext()` assembles the student's profile + goals + last N lesson
   notes (structured + freeform). *(Phase 3 adds top-k relevant document chunks.)*
3. The configured `AIProvider` generates a `SuggestionResult`.
4. Save to `suggestions` and render. Teacher can accept, edit, or dismiss and leave
   feedback, which becomes part of the record.

### Embeddings (phase 3) — also decoupled
An `EmbeddingProvider` interface with a **Voyage AI** adapter first (Anthropic has no
embeddings model, so generation and embedding providers will differ). Same swap-by-config
pattern.

## 6. Build order

- **Phase 1 (MVP):** auth + student CRUD + hybrid lesson-note capture + student
  timeline/progress view. Useful with zero AI.
- **Phase 2:** AI "suggest next moves" flow (provider-agnostic layer + Claude adapter)
  over Phase 1 data.
- **Phase 3:** document upload + chunking + embeddings + pgvector retrieval →
  RAG-grounded suggestions.

## 7. Cost

- **Fixed:** $0 — Supabase free tier (≈500 MB DB, 1 GB storage) + Vercel free tier.
- **Usage:** Claude pay-per-use only when a suggestion is generated (≈ a few cents each
  at this scale). Voyage embeddings (phase 3) negligible.

## 8. Out of scope (for now)

- Billing / payments / commercial multi-tenancy.
- Mobile-native apps (responsive web is sufficient).
- Real-time collaboration between teachers.
