import { Plus, Users } from "lucide-react";
import { listStudents } from "@/lib/students";
import { StudentCard } from "@/components/student-card";
import { StudentForm } from "@/components/student-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const students = await listStudents();
  const active = students.filter((s) => s.status === "active").length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {students.length === 0
              ? "Your studio starts here."
              : `${students.length} student${students.length === 1 ? "" : "s"} · ${active} active`}
          </p>
        </div>
        <StudentForm
          trigger={
            <Button>
              <Plus className="size-4" />
              Add student
            </Button>
          }
        />
      </div>

      <div className="mt-8">
        {students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students yet"
            description="Add your first student to start capturing lessons and tracking their progress."
            action={
              <StudentForm
                trigger={
                  <Button>
                    <Plus className="size-4" />
                    Add student
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
