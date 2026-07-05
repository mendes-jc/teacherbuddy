"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLessonNote } from "@/lib/actions";
import type { LessonNoteInput } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StruggleTagsInput } from "@/components/struggle-tags-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyNote(): LessonNoteInput {
  return {
    date: today(),
    focus_area: "",
    progress_rating: null,
    struggle_tags: [],
    what_worked: "",
    homework: "",
    freeform_notes: "",
  };
}

const RATING_LABELS = ["Tough", "Slow", "Steady", "Good", "Great"];

export function LessonNoteForm({
  studentId,
  trigger,
}: {
  studentId: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LessonNoteInput>(emptyNote());
  const [saving, setSaving] = useState(false);

  function update<K extends keyof LessonNoteInput>(
    key: K,
    value: LessonNoteInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await createLessonNote(studentId, form);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Lesson logged");
    setOpen(false);
    setForm(emptyNote());
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setForm(emptyNote());
      }}
    >
      <DialogTrigger render={trigger as ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log a lesson</DialogTitle>
            <DialogDescription>
              A few quick fields plus anything else on your mind.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="focus_area">Focus</Label>
                <Input
                  id="focus_area"
                  value={form.focus_area}
                  onChange={(e) => update("focus_area", e.target.value)}
                  placeholder="Scales, new piece…"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Progress</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      update(
                        "progress_rating",
                        form.progress_rating === n ? null : n,
                      )
                    }
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-xs transition-colors",
                      form.progress_rating === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span className="text-base font-semibold">{n}</span>
                    {RATING_LABELS[n - 1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Where they struggled</Label>
              <StruggleTagsInput
                value={form.struggle_tags}
                onChange={(tags) => update("struggle_tags", tags)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="what_worked">What worked</Label>
              <Textarea
                id="what_worked"
                rows={2}
                value={form.what_worked}
                onChange={(e) => update("what_worked", e.target.value)}
                placeholder="Breakthroughs, what clicked…"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="homework">Homework</Label>
              <Textarea
                id="homework"
                rows={2}
                value={form.homework}
                onChange={(e) => update("homework", e.target.value)}
                placeholder="What to practice before next time."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="freeform_notes">Notes</Label>
              <Textarea
                id="freeform_notes"
                rows={3}
                value={form.freeform_notes}
                onChange={(e) => update("freeform_notes", e.target.value)}
                placeholder="Everything else — mood, context, ideas for next time."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save lesson
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
