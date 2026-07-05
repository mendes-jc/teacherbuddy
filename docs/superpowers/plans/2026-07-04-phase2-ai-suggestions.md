# TeacherBuddy Phase 2 (AI Suggestions) Implementation Plan

> **For agentic workers:** implement task-by-task.

**Goal:** A "Suggest next moves" flow that turns a student's record into structured, personalized coaching suggestions — behind a provider-agnostic AI layer so any model/provider can be swapped in.

**Architecture:** A neutral AI layer (`lib/ai`) with a `buildSuggestionContext()` that assembles student data into a provider-neutral request (system prompt, user content, JSON output schema), an `AIProvider` interface, and swappable adapters (Claude default, OpenAI example). A server action generates a suggestion, persists it to the `suggestions` table, and the student page renders it with accept/dismiss controls.

**Tech Stack:** `@anthropic-ai/sdk` (Claude Opus 4.8, adaptive thinking, structured outputs), Zod for output validation.

---

## File structure

```
lib/ai/
  types.ts                # SuggestionResult, zod + JSON schema, AIRequest, AIProvider
  context.ts              # buildSuggestionContext(student, notes) → AIRequest  (provider-neutral)
  index.ts                # getProvider() — selects adapter via AI_PROVIDER env
  providers/
    claude.ts             # ClaudeProvider (default)
    openai.ts             # OpenAIProvider (raw fetch, drop-in example)
lib/suggestions.ts        # data access: latest + list
lib/actions.ts            # + generateSuggestion(), setSuggestionStatus()
lib/types.ts              # + Suggestion, SuggestionStatus
components/
  suggestion-panel.tsx    # client: generate button + renders latest + accept/dismiss
  suggestion-card.tsx     # presentational: renders a SuggestionResult
app/(app)/students/[id]/page.tsx  # + Suggestions section
.env.local.example        # AI_PROVIDER + ANTHROPIC_API_KEY (uncommented guidance)
```

---

## Tasks

### Task 1: Install SDK + neutral AI types
- [ ] `npm i @anthropic-ai/sdk`
- [ ] `lib/ai/types.ts`: `SuggestionResult`, `suggestionResultSchema` (zod), `suggestionJsonSchema` (JSON Schema for structured output), `AIRequest { system; user; schema }`, `AIProvider { name; generateSuggestions(req): Promise<{ result; model }> }`

### Task 2: Context builder (provider-neutral)
- [ ] `lib/ai/context.ts`: `buildSuggestionContext(student, notes)` → `AIRequest`. Compact, readable rendering of profile + goals + recent notes into the user string; a coaching system prompt; the JSON schema attached.

### Task 3: Providers + factory
- [ ] `lib/ai/providers/claude.ts`: call `messages.create` (Opus 4.8, adaptive thinking, `output_config.format`), parse + validate → `SuggestionResult`
- [ ] `lib/ai/providers/openai.ts`: raw-`fetch` Chat Completions with `response_format` json_schema (drop-in example)
- [ ] `lib/ai/index.ts`: `getProvider()` maps `AI_PROVIDER` (default `claude`) → adapter; unknown → clear error

### Task 4: Persistence + actions
- [ ] `lib/types.ts`: add `Suggestion`, `SuggestionStatus`
- [ ] `lib/suggestions.ts`: `getLatestSuggestion(studentId)`, `listSuggestions(studentId)`
- [ ] `lib/actions.ts`: `generateSuggestion(studentId)` (load student+notes → build context → provider → insert row → revalidate); `setSuggestionStatus(id, studentId, status)`

### Task 5: UI
- [ ] `components/suggestion-card.tsx`: render `SuggestionResult` sections
- [ ] `components/suggestion-panel.tsx`: generate/regenerate button, loading, renders latest + accept/dismiss, shows provider/model + time, graceful "not configured" hint
- [ ] Wire a "Suggestions" section into the student detail page (pass latest from server)

### Task 6: Config + build
- [ ] Update `.env.local.example` and `README.md` (Phase 2 section)
- [ ] `npm run build` passes

---

## Verification notes

- `npm run build` must pass. AI generation requires a real provider key (`ANTHROPIC_API_KEY`) at runtime; without one, `generateSuggestion` returns a friendly "AI isn't configured" error and the panel shows a hint. End-to-end generation can't be exercised here without a key + a Supabase project.
