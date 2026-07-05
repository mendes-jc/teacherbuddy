# TeacherBuddy

A calm, personal app for music/creativity teachers to manage students, capture
lesson notes, and track progress over time. **Phase 1 (this MVP)** is the living
student record — no AI yet. Phases 2 (AI "next moves" suggestions) and 3 (document
RAG grounding) build on top of it.

- **Design & spec:** `docs/superpowers/specs/2026-07-04-teacherbuddy-design.md`
- **This plan:** `docs/superpowers/plans/2026-07-04-phase1-mvp.md`

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · shadcn/ui (Base UI) ·
Supabase (Postgres + Auth) · Recharts.

## Setup

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), create a free project.

### 2. Create the schema

In the Supabase dashboard → **SQL Editor**, paste and run the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This
creates the `students`, `lesson_notes`, and `suggestions` tables and the
row-level-security policies that scope every row to its owning teacher.

### 3. Configure environment

Copy the example and fill in the two values from **Project Settings → API**:

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. (Optional) Turn off email confirmation for a personal setup

In Supabase → **Authentication → Providers → Email**, disable "Confirm email"
if you want sign-up to log you straight in without an email round-trip.

### 5. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and add
your first student.

## What Phase 1 does

- Email/password auth; each teacher sees only their own data (enforced by RLS).
- Add / edit students (learner type, focus, level, goals, status, notes).
- Log lessons with a hybrid form: date, focus, a 1–5 progress rating,
  "where they struggled" tags, what worked, homework, and freeform notes.
- Per-student view: profile, a progress-over-time chart, and a lesson timeline.
- Light/dark theme.

## Verification status

- `npm run build` passes (type-check + compile), and the app renders (login and
  redirects verified against a running dev server).
- Full end-to-end auth + CRUD requires **your** Supabase project (URL + anon key)
  and the migration from step 2 — it can't be exercised without those credentials.
