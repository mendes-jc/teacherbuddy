"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { generateSuggestion, setSuggestionStatus } from "@/lib/actions";
import type { Suggestion, SuggestionStatus } from "@/lib/types";
import { SuggestionCard } from "@/components/suggestion-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function StatusBadge({ status }: { status: SuggestionStatus }) {
  if (status === "accepted")
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
        Accepted
      </Badge>
    );
  if (status === "dismissed")
    return <Badge variant="outline">Dismissed</Badge>;
  return <Badge variant="secondary">New</Badge>;
}

export function SuggestionPanel({
  studentId,
  initial,
  aiConfigured,
}: {
  studentId: string;
  initial: Suggestion | null;
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function generate() {
    setGenerating(true);
    const result = await generateSuggestion(studentId);
    setGenerating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Suggestions ready");
    router.refresh();
  }

  async function updateStatus(status: SuggestionStatus) {
    if (!initial) return;
    setUpdating(true);
    const result = await setSuggestionStatus(initial.id, studentId, status);
    setUpdating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI next moves
          </CardTitle>
          <CardDescription>
            Personalized coaching grounded in this student&apos;s record.
          </CardDescription>
        </div>
        {initial && (
          <Button
            variant="outline"
            size="sm"
            onClick={generate}
            disabled={generating || !aiConfigured}
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Regenerate
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {generating ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            Thinking through this student&apos;s progress…
          </div>
        ) : initial ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <StatusBadge status={initial.status} />
              <span>
                {formatDistanceToNow(parseISO(initial.generated_at), {
                  addSuffix: true,
                })}
              </span>
              {initial.model && (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  {initial.provider}:{initial.model}
                </span>
              )}
            </div>

            <SuggestionCard result={initial.content} />

            {initial.status === "new" && (
              <div className="flex gap-2 border-t pt-4">
                <Button
                  size="sm"
                  onClick={() => updateStatus("accepted")}
                  disabled={updating}
                >
                  <Check className="size-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateStatus("dismissed")}
                  disabled={updating}
                >
                  <X className="size-4" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Turn this student&apos;s notes and goals into a concrete plan for
              the next lesson.
            </p>
            <Button onClick={generate} disabled={!aiConfigured}>
              <Sparkles className="size-4" />
              Suggest next moves
            </Button>
            {!aiConfigured && (
              <p className="text-xs text-muted-foreground">
                Add an AI provider key to <code>.env.local</code> to enable this.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
