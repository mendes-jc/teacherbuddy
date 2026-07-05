"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDocument } from "@/lib/actions";
import type { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function DocumentRow({ document }: { document: Document }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    const result = await deleteDocument(document.id);
    setDeleting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Material removed");
    router.refresh();
  }

  return (
    <Card className="flex-row items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{document.name}</p>
          <p className="text-xs text-muted-foreground">
            Added {format(parseISO(document.created_at), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={remove}
        disabled={deleting}
        aria-label="Delete material"
      >
        {deleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4 text-muted-foreground" />
        )}
      </Button>
    </Card>
  );
}

export function DocumentList({ documents }: { documents: Document[] }) {
  return (
    <div className="grid gap-3">
      {documents.map((doc) => (
        <DocumentRow key={doc.id} document={doc} />
      ))}
    </div>
  );
}
