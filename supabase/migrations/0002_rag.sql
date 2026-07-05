-- TeacherBuddy — Phase 3: document RAG (pgvector)
-- Run after 0001_init.sql. Embedding dimension is 768 (matches lib/ai/embeddings
-- EMBEDDING_DIM). If you switch to an embedding model with a different native
-- dimension, change vector(768) here and re-embed existing material.

create extension if not exists vector;

-- documents -------------------------------------------------------------------
create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create index if not exists documents_teacher_id_idx on public.documents (teacher_id);

-- document_chunks -------------------------------------------------------------
create table if not exists public.document_chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  teacher_id  uuid not null references auth.users (id) on delete cascade,
  content     text not null,
  embedding   vector(768),
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists document_chunks_document_id_idx
  on public.document_chunks (document_id);

-- Approximate nearest-neighbour index (cosine).
create index if not exists document_chunks_embedding_idx
  on public.document_chunks using hnsw (embedding vector_cosine_ops);

-- Row-Level Security ----------------------------------------------------------
alter table public.documents       enable row level security;
alter table public.document_chunks enable row level security;

create policy "documents are owner-scoped"
  on public.documents for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "document_chunks are owner-scoped"
  on public.document_chunks for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

-- Similarity search -----------------------------------------------------------
-- SECURITY INVOKER (default): runs as the caller, so auth.uid() + RLS apply.
create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_count int default 6
)
returns table (id uuid, document_id uuid, content text, distance float)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.embedding <=> query_embedding as distance
  from public.document_chunks dc
  where dc.teacher_id = auth.uid()
    and dc.embedding is not null
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_document_chunks(vector, int) to authenticated;
