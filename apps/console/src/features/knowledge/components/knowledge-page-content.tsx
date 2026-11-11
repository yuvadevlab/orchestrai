"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-page-content.tsx
 * @description Main dashboard view for RAG Knowledge Base and document vector storage.
 * @module apps/console/features/knowledge/components
 */

import React, { useState } from "react";
import { Plus, Search, Sparkles, BookOpen } from "lucide-react";
import { Button, Input } from "@orchestrai/ui";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState, TableSkeleton, DynamicErrorState } from "@orchestrai/ui";
import { useKnowledgeDocuments } from "../api";
import { UI_COPY } from "@/lib/ui-copy";
import { KnowledgeUploadDialog } from "./knowledge-upload-dialog";
import { KnowledgeQueryDialog } from "./knowledge-query-dialog";
import { KnowledgeDocumentsTable } from "./knowledge-documents-table";

const MIME_FILTER_PILLS = [
  { id: "all", label: UI_COPY.KNOWLEDGE.MIME_FILTERS.ALL },
  { id: "markdown", label: UI_COPY.KNOWLEDGE.MIME_FILTERS.MARKDOWN },
  { id: "plain", label: UI_COPY.KNOWLEDGE.MIME_FILTERS.PLAIN },
  { id: "json", label: UI_COPY.KNOWLEDGE.MIME_FILTERS.JSON },
  { id: "csv", label: UI_COPY.KNOWLEDGE.MIME_FILTERS.CSV },
];

export interface KnowledgePageContentProps {
  /** If true, renders the content directly without wrapping in PageShell */
  readonly hideShell?: boolean;
}

/**
 * Knowledge Base administration and hybrid vector search workbench.
 */
export function KnowledgePageContent({
  hideShell = false,
}: KnowledgePageContentProps = {}): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedMime, setSelectedMime] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const { data: documents = [], isLoading, error, refetch } = useKnowledgeDocuments();

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.sourceUri.toLowerCase().includes(search.toLowerCase());
    const matchesMime =
      selectedMime === "all" || doc.mimeType.toLowerCase().includes(selectedMime.toLowerCase());
    return matchesSearch && matchesMime;
  });

  const actionButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsQueryOpen(true)}
        style={{
          height: hideShell ? "1.75rem" : "2rem",
          cursor: "pointer",
          gap: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        <Sparkles style={{ width: "0.875rem", height: "0.875rem" }} />
        <span>{UI_COPY.KNOWLEDGE.QUERY_TESTER.TRIGGER_BUTTON}</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsUploadOpen(true)}
        style={{
          height: hideShell ? "1.75rem" : "2rem",
          cursor: "pointer",
          gap: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
        <span>{UI_COPY.KNOWLEDGE.UPLOAD_BUTTON}</span>
      </Button>
    </div>
  );

  const bodyContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Search & Filter Toolbar matching Agents page layout */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ width: "18rem", maxWidth: "100%" }}>
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)}
            placeholder={UI_COPY.KNOWLEDGE.SEARCH_PLACEHOLDER}
            startIcon={<Search style={{ width: "0.875rem", height: "0.875rem" }} />}
            style={{ height: "2rem", fontSize: "0.75rem" }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.375rem" }}>
            {MIME_FILTER_PILLS.map((pill) => (
              <Button
                key={pill.id}
                variant={selectedMime === pill.id ? "default" : "outline"}
                size="sm"
                onClick={(): void => setSelectedMime(pill.id)}
                style={{
                  height: "1.75rem",
                  cursor: "pointer",
                  borderRadius: "9999px",
                  paddingInline: "0.75rem",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                }}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          {hideShell && actionButtons}
        </div>
      </div>

      {/* Ingested Documents List */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <DynamicErrorState
          error={error}
          title={UI_COPY.KNOWLEDGE.ERROR_TITLE}
          reset={() => void refetch()}
        />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={UI_COPY.KNOWLEDGE.EMPTY_TITLE}
          description={UI_COPY.KNOWLEDGE.EMPTY_DESC}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsUploadOpen(true)}
              style={{ height: "2rem", cursor: "pointer", fontSize: "0.75rem" }}
            >
              <Plus style={{ marginRight: "0.375rem", width: "0.875rem", height: "0.875rem" }} />{" "}
              {UI_COPY.KNOWLEDGE.UPLOAD_BUTTON}
            </Button>
          }
        />
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          icon={Search}
          title={UI_COPY.KNOWLEDGE.NO_MATCH_TITLE}
          description={UI_COPY.KNOWLEDGE.NO_MATCH_DESC(search)}
        />
      ) : (
        <KnowledgeDocumentsTable
          documents={filteredDocuments}
          isLoading={isLoading}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
      )}

      {/* Upload Document Modal Dialog */}
      <KnowledgeUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Interactive Query Tester Modal Dialog */}
      <KnowledgeQueryDialog isOpen={isQueryOpen} onClose={() => setIsQueryOpen(false)} />
    </div>
  );

  if (hideShell) {
    return bodyContent;
  }

  return (
    <PageShell
      title={UI_COPY.KNOWLEDGE.PAGE_TITLE}
      breadcrumb={UI_COPY.KNOWLEDGE.BREADCRUMB}
      stats={UI_COPY.KNOWLEDGE.STATS(documents.length)}
      description={UI_COPY.KNOWLEDGE.PAGE_DESCRIPTION}
      actions={actionButtons}
    >
      {bodyContent}
    </PageShell>
  );
}
