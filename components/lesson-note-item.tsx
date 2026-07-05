import { format, parseISO } from "date-fns";
import type { LessonNote } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const RATING_LABELS = ["Tough", "Slow", "Steady", "Good", "Great"];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}

export function LessonNoteItem({ note }: { note: LessonNote }) {
  return (
    <div className="relative pl-8">
      {/* timeline dot */}
      <span className="absolute left-0 top-1.5 flex size-6 items-center justify-center rounded-full border bg-background">
        <span className="size-2 rounded-full bg-primary" />
      </span>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">
            {format(parseISO(note.date), "EEEE, MMM d, yyyy")}
          </p>
          {note.progress_rating != null && (
            <Badge variant="secondary">
              {note.progress_rating}/5 · {RATING_LABELS[note.progress_rating - 1]}
            </Badge>
          )}
        </div>

        {note.focus_area && (
          <p className="mt-1 text-sm text-muted-foreground">
            Focus: {note.focus_area}
          </p>
        )}

        {note.struggle_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.struggle_tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-amber-500/40 text-amber-700 dark:text-amber-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-3 grid gap-3">
          {note.what_worked && (
            <Field label="What worked" value={note.what_worked} />
          )}
          {note.homework && <Field label="Homework" value={note.homework} />}
          {note.freeform_notes && (
            <Field label="Notes" value={note.freeform_notes} />
          )}
        </div>
      </div>
    </div>
  );
}
