import { BookOpen, Plus } from "lucide-react";
import { listDocuments } from "@/lib/documents";
import { isEmbeddingConfigured } from "@/lib/ai/embeddings";
import { DocumentForm } from "@/components/document-form";
import { DocumentList } from "@/components/document-list";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const documents = await listDocuments();
  const embeddingConfigured = isEmbeddingConfigured();

  const addButton = (
    <Button>
      <Plus className="size-4" />
      Add material
    </Button>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your teaching material. AI suggestions are grounded in it.
          </p>
        </div>
        {embeddingConfigured && <DocumentForm trigger={addButton} />}
      </div>

      {!embeddingConfigured && (
        <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Add an embedding provider key to <code>.env.local</code> (e.g.{" "}
          <code>GEMINI_API_KEY</code>) to upload material for grounding.
        </div>
      )}

      <div className="mt-8">
        {documents.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No material yet"
            description="Add your methods, exercises, or curriculum. Suggestions will draw on them to match how you actually teach."
            action={embeddingConfigured ? <DocumentForm trigger={addButton} /> : undefined}
          />
        ) : (
          <DocumentList documents={documents} />
        )}
      </div>
    </div>
  );
}
