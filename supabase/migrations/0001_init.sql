-- TeacherBuddy — initial schema (Phase 1 MVP + suggestions table for Phase 2)
-- Run this in the Supabase SQL editor (or `supabase db push`).

-- updated_at helper -----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- students --------------------------------------------------------------------
create table if not exists public.students (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  learner_type  text not null default 'adult' check (learner_type in ('adult', 'child')),
  focus         text,
  level         text,
  goals         text,
  start_date    date,
  status        text not null default 'active' check (status in ('active', 'inactive')),
  general_notes text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists students_teacher_id_idx on public.students (teacher_id);

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- lesson_notes ----------------------------------------------------------------
create table if not exists public.lesson_notes (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students (id) on delete cascade,
  teacher_id      uuid not null references auth.users (id) on delete cascade,
  date            date not null default current_date,
  focus_area      text,
  progress_rating smallint check (progress_rating between 1 and 5),
  struggle_tags   text[] not null default '{}',
  what_worked     text,
  homework        text,
  freeform_notes  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists lesson_notes_student_id_idx on public.lesson_notes (student_id);
create index if not exists lesson_notes_teacher_id_idx on public.lesson_notes (teacher_id);

drop trigger if exists lesson_notes_set_updated_at on public.lesson_notes;
create trigger lesson_notes_set_updated_at
  before update on public.lesson_notes
  for each row execute function public.set_updated_at();

-- suggestions (Phase 2 — table created now so the schema is stable) -----------
create table if not exists public.suggestions (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students (id) on delete cascade,
  teacher_id      uuid not null references auth.users (id) on delete cascade,
  generated_at    timestamptz not null default now(),
  content         jsonb not null,
  source_note_ids uuid[] not null default '{}',
  provider        text,
  model           text,
  teacher_feedback text,
  status          text not null default 'new' check (status in ('new', 'accepted', 'edited', 'dismissed'))
);

create index if not exists suggestions_student_id_idx on public.suggestions (student_id);

-- Row-Level Security ----------------------------------------------------------
alter table public.students     enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.suggestions  enable row level security;

-- Each teacher can only see and touch their own rows.
create policy "students are owner-scoped"
  on public.students for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "lesson_notes are owner-scoped"
  on public.lesson_notes for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "suggestions are owner-scoped"
  on public.suggestions for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);
