"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-page-content.tsx
 * @description Main dashboard view for RAG Knowledge Base and document vector storage.
 * @module apps/console/features/knowledge/components
 */

import React, { useState } from "react";
import { Plus, Search, Sparkles, BookOpen } from "lucide-react";
import { Button, Input } from "@yuva-devlab/ui";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState, TableSkeleton } from "@/components/ui";
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

/**
 * Knowledge Base administration and hybrid vector search workbench.
 */
export function KnowledgePageContent(): React.JSX.Element {
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

  return (
    <PageShell
      title={UI_COPY.KNOWLEDGE.PAGE_TITLE}
      breadcrumb={UI_COPY.KNOWLEDGE.BREADCRUMB}
      stats={UI_COPY.KNOWLEDGE.STATS(documents.length)}
      description={UI_COPY.KNOWLEDGE.PAGE_DESCRIPTION}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQueryOpen(true)}
            className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
          >
            <Sparkles className="size-3.5" />
            <span>{UI_COPY.KNOWLEDGE.QUERY_TESTER.TRIGGER_BUTTON}</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
          >
            <Plus className="size-3.5" />
            <span>{UI_COPY.KNOWLEDGE.UPLOAD_BUTTON}</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Search & Filter Toolbar matching Agents page layout */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)}
              placeholder={UI_COPY.KNOWLEDGE.SEARCH_PLACEHOLDER}
              startIcon={<Search className="size-3.5" />}
              className="bg-card h-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            {MIME_FILTER_PILLS.map((pill) => (
              <Button
                key={pill.id}
                variant={selectedMime === pill.id ? "default" : "outline"}
                size="sm"
                onClick={(): void => setSelectedMime(pill.id)}
                className="h-7 cursor-pointer rounded-full px-3 text-xs capitalize"
              >
                {pill.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ingested Documents List */}
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <div className="border-border bg-card flex flex-col items-center justify-center gap-2 rounded-md border p-6 text-center">
            <p className="text-foreground text-xs font-medium">{UI_COPY.KNOWLEDGE.ERROR_TITLE}</p>
            <p className="text-muted-foreground max-w-md text-xs">{error.message}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              className="mt-2 h-7 cursor-pointer text-xs"
            >
              {UI_COPY.KNOWLEDGE.RETRY_BUTTON}
            </Button>
          </div>
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
                className="h-8 cursor-pointer text-xs"
              >
                <Plus className="mr-1.5 size-3.5" /> {UI_COPY.KNOWLEDGE.UPLOAD_BUTTON}
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
    </PageShell>
  );
}
