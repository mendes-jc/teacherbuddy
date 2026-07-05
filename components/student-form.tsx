"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createStudent, updateStudent } from "@/lib/actions";
import type { Student, StudentInput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function emptyInput(): StudentInput {
  return {
    name: "",
    learner_type: "adult",
    focus: "",
    level: "",
    goals: "",
    status: "active",
    general_notes: "",
  };
}

function fromStudent(s: Student): StudentInput {
  return {
    name: s.name,
    learner_type: s.learner_type,
    focus: s.focus ?? "",
    level: s.level ?? "",
    goals: s.goals ?? "",
    status: s.status,
    general_notes: s.general_notes ?? "",
  };
}

export function StudentForm({
  student,
  trigger,
}: {
  student?: Student;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const isEdit = !!student;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StudentInput>(
    student ? fromStudent(student) : emptyInput(),
  );
  const [saving, setSaving] = useState(false);

  function update<K extends keyof StudentInput>(key: K, value: StudentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = isEdit
      ? await updateStudent(student!.id, form)
      : await createStudent(form);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Student updated" : "Student added");
    setOpen(false);
    if (!isEdit) setForm(emptyInput());
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && !isEdit) setForm(emptyInput());
        if (o && isEdit && student) setForm(fromStudent(student));
      }}
    >
      <DialogTrigger render={trigger as ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit student" : "Add student"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this student's profile."
                : "Who are you teaching? You can fill in the rest later."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Maya Fernandes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Learner</Label>
                <Select
                  value={form.learner_type}
                  onValueChange={(v) =>
                    update("learner_type", v as StudentInput["learner_type"])
                  }
                >
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    update("status", v as StudentInput["status"])
                  }
                >
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="focus">Focus</Label>
                <Input
                  id="focus"
                  value={form.focus}
                  onChange={(e) => update("focus", e.target.value)}
                  placeholder="Piano, songwriting…"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  value={form.level}
                  onChange={(e) => update("level", e.target.value)}
                  placeholder="Beginner, Grade 3…"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={form.goals}
                onChange={(e) => update("goals", e.target.value)}
                placeholder="What is this student working toward?"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="general_notes">General notes</Label>
              <Textarea
                id="general_notes"
                value={form.general_notes}
                onChange={(e) => update("general_notes", e.target.value)}
                placeholder="Anything worth remembering between lessons."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
