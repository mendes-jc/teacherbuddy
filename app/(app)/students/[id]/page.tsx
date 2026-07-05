import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, NotebookPen, Pencil, Plus, Target } from "lucide-react";
import { getStudent } from "@/lib/students";
import { listLessonNotes } from "@/lib/lesson-notes";
import { StudentForm } from "@/components/student-form";
import { LessonNoteForm } from "@/components/lesson-note-form";
import { LessonNoteItem } from "@/components/lesson-note-item";
import { ProgressChart } from "@/components/progress-chart";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const notes = await listLessonNotes(id);
  const rated = notes.filter((n) => n.progress_rating != null);
  const avg =
    rated.length > 0
      ? (
          rated.reduce((sum, n) => sum + (n.progress_rating as number), 0) /
          rated.length
        ).toFixed(1)
      : "—";

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All students
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {student.name}
            </h1>
            <Badge variant="secondary" className="capitalize">
              {student.learner_type}
            </Badge>
            {student.status === "inactive" && (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.focus || "No focus set"}
            {student.level ? ` · ${student.level}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StudentForm
            student={student}
            trigger={
              <Button variant="outline">
                <Pencil className="size-4" />
                Edit
              </Button>
            }
          />
          <LessonNoteForm
            studentId={student.id}
            trigger={
              <Button>
                <Plus className="size-4" />
                Log lesson
              </Button>
            }
          />
        </div>
      </div>

      {/* Top grid: goals/notes + progress */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-primary" />
              Goals &amp; notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Goals
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {student.goals || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                General notes
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {student.general_notes || "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Progress</CardTitle>
            <div className="text-right">
              <p className="text-2xl font-semibold leading-none">{avg}</p>
              <p className="text-xs text-muted-foreground">avg rating</p>
            </div>
          </CardHeader>
          <CardContent>
            <ProgressChart notes={notes} />
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Lesson history</h2>
        {notes.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No lessons logged yet"
            description="Log your first lesson to start building this student's history and progress."
            action={
              <LessonNoteForm
                studentId={student.id}
                trigger={
                  <Button>
                    <Plus className="size-4" />
                    Log lesson
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {notes.map((note) => (
              <LessonNoteItem key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
