"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-documents-table.tsx
 * @description Data table listing all indexed documents in the tenant's RAG knowledge repository.
 * @module apps/console/features/knowledge/components
 */

import React from "react";
import { FileText, Trash2, Globe, Database, Calendar } from "lucide-react";
import { Button, toast } from "@orchestrai/ui";
import { EmptyState } from "@orchestrai/ui";
import { TableSkeleton } from "@orchestrai/ui/components/skeleton";
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
          <Button
            size="sm"
            onClick={onOpenUpload}
            style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
          >
            <FileText style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>{UI_COPY.KNOWLEDGE.UPLOAD_BUTTON}</span>
          </Button>
        }
      />
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "color-mix(in oklab, var(--card) 40%, transparent)",
        borderRadius: "var(--radius-md, 0.375rem)",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {documents.map((doc) => (
          <div
            key={doc.documentId}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              padding: "1rem",
              borderBottom: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
              transition: "background-color 150ms ease",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText
                  style={{ color: "var(--primary)", width: "1rem", height: "1rem", flexShrink: 0 }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {doc.title}
                </span>
                <span
                  style={{
                    border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                    backgroundColor: "color-mix(in oklab, var(--muted) 60%, transparent)",
                    color: "var(--mutedForeground)",
                    borderRadius: "var(--radius-sm, 0.25rem)",
                    paddingInline: "0.375rem",
                    paddingBlock: "0.125rem",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.625rem",
                  }}
                >
                  {doc.mimeType}
                </span>
              </div>
              <div
                style={{
                  color: "var(--mutedForeground)",
                  marginTop: "0.375rem",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.6875rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  <Globe style={{ width: "0.75rem", height: "0.75rem" }} />
                  <span
                    style={{
                      maxWidth: "18rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.sourceUri}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Calendar style={{ width: "0.75rem", height: "0.75rem" }} />
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(doc)}
                disabled={deleteMutation.isPending}
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  color: "var(--mutedForeground)",
                  borderRadius: "var(--radius-sm, 0.25rem)",
                }}
                title={UI_COPY.KNOWLEDGE.TABLE.DELETE_TOOLTIP}
                aria-label={UI_COPY.KNOWLEDGE.TABLE.DELETE_TOOLTIP}
              >
                <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
