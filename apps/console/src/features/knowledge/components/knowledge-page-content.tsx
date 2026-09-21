"use client";

/**
 * @file knowledge-page-content.tsx
 * @description Knowledge base & RAG document index view with EmptyState support and document ingestion modal.
 * @module apps/console/features/knowledge/components
 */

import React, { useState } from "react";
import { Panel, StatusChip, Button } from "@yuva-devlab/ui";
import { Database, Plus } from "lucide-react";
import { KnowledgeDialog } from "./knowledge-dialog";
import { useKnowledge } from "../api";
import { EmptyState } from "@/components/ui";

function Stat({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <div>
      <dd className="text-foreground font-mono text-xs font-semibold">{value}</dd>
      <dt className="text-muted-foreground text-[10px]">{label}</dt>
    </div>
  );
}

export function KnowledgePageContent(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: knowledgeDocs, isLoading, refetch } = useKnowledge();

  return (
    <div className="space-y-6">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-display text-xl font-bold tracking-tight">
            Knowledge Base & RAG Index
          </h1>
          <p className="text-muted-foreground text-xs">
            Ingest technical documentation and vector embeddings for semantic context retrieval.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          <span>Ingest Document</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
            Loading knowledge index...
          </span>
        </div>
      ) : knowledgeDocs.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No Knowledge Documents Ingested"
          description="Ingest PDF documents, markdown specs, or URL feeds into the vector database for high-precision agent RAG retrieval."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="h-8 cursor-pointer font-mono text-xs"
            >
              <Plus className="mr-1.5 size-3.5" /> Ingest First Document
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {knowledgeDocs.map((doc) => (
            <Panel key={doc.id}>
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{doc.name}</p>
                  <p className="text-muted-foreground font-mono text-[10px]">
                    {doc.type} · {doc.size}
                  </p>
                </div>
                <span className="ml-auto">
                  <StatusChip status={doc.status} />
                </span>
              </div>

              <dl className="border-border mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                <Stat value={String(doc.chunks || 0)} label="chunks" />
                <Stat value={String(doc.retrievals || 0)} label="retrievals" />
                <Stat value={doc.updatedAt || "N/A"} label="updated" />
              </dl>

              <p className="text-muted-foreground mt-3 font-mono text-[10px]">{doc.embedding}</p>
            </Panel>
          ))}
        </div>
      )}

      <KnowledgeDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
