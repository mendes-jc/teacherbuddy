import Link from "next/link";
import { ArrowUpRight, Music2 } from "lucide-react";
import type { Student } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function StudentCard({ student }: { student: Student }) {
  return (
    <Link href={`/students/${student.id}`} className="group block">
      <Card className="h-full gap-0 p-5 transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Music2 className="size-5" />
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <h3 className="mt-4 truncate text-base font-semibold">
          {student.name}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {student.focus || "No focus set"}
          {student.level ? ` · ${student.level}` : ""}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {student.learner_type}
          </Badge>
          {student.status === "inactive" && (
            <Badge variant="outline" className="text-muted-foreground">
              Inactive
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
