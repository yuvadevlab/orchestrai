"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-documents-table.tsx
 * @description Data table listing all indexed documents in the tenant's RAG knowledge repository.
 * @module apps/console/features/knowledge/components
 */

import React from "react";
import { FileText, Trash2, Globe, Database, Calendar } from "lucide-react";
import { Button, toast } from "@yuva-devlab/ui";
import { EmptyState } from "@/components/ui";
import { TableSkeleton } from "@/components/ui/skeleton";
import { UI_COPY } from "@/lib/ui-copy";
import { useDeleteDocument } from "../api";
import type { KnowledgeDocument } from "../types";

export interface KnowledgeDocumentsTableProps {
  readonly documents: KnowledgeDocument[];
  readonly isLoading: boolean;
  readonly onOpenUpload: () => void;
}

/**
 * Renders the table of indexed knowledge documents with deletion actions.
 */
export function KnowledgeDocumentsTable({
  documents,
  isLoading,
  onOpenUpload,
}: KnowledgeDocumentsTableProps): React.JSX.Element {
  const deleteMutation = useDeleteDocument();

  const handleDelete = async (doc: KnowledgeDocument): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(doc.documentId);
      toast.success(UI_COPY.KNOWLEDGE.TABLE.FEEDBACK_REMOVED(doc.title));
    } catch {
      toast.error(UI_COPY.KNOWLEDGE.TABLE.FEEDBACK_ERROR(doc.title));
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={4} />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title={UI_COPY.KNOWLEDGE.EMPTY_TITLE}
        description={UI_COPY.KNOWLEDGE.EMPTY_DESC}
        action={
          <Button size="sm" onClick={onOpenUpload} className="h-8 gap-1.5 text-xs font-medium">
            <FileText className="size-3.5" />
            <span>{UI_COPY.KNOWLEDGE.UPLOAD_BUTTON}</span>
          </Button>
        }
      />
    );
  }

  return (
    <div className="border-border bg-card/40 overflow-hidden rounded-md border backdrop-blur">
      <div className="divide-border/60 divide-y">
        {documents.map((doc) => (
          <div
            key={doc.documentId}
            className="hover:bg-muted/30 flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <FileText className="text-primary size-4 shrink-0" />
                <span className="truncate text-xs font-semibold">{doc.title}</span>
                <span className="border-border/80 bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
                  {doc.mimeType}
                </span>
              </div>
              <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1 font-mono">
                  <Globe className="size-3" />
                  <span className="max-w-72 truncate">{doc.sourceUri}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(doc)}
                disabled={deleteMutation.isPending}
                className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground size-7 rounded"
                title={UI_COPY.KNOWLEDGE.TABLE.DELETE_TOOLTIP}
                aria-label={UI_COPY.KNOWLEDGE.TABLE.DELETE_TOOLTIP}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
