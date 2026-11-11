"use client";

/**
 * @file apps/console/src/features/memory/components/memory-page-content.tsx
 * @description Main dashboard view for agent long-term memory, episodic reflections, and learned facts.
 * @module apps/console/features/memory/components
 */

import React, { useState } from "react";
import { Plus, Search, Sparkles, Brain } from "lucide-react";
import { Button, Input } from "@orchestrai/ui";
import { MemoryType } from "@orchestrai/shared-types";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState, TableSkeleton, DynamicErrorState } from "@orchestrai/ui";
import { useMemories } from "../api";
import { UI_COPY } from "@/lib/ui-copy";
import { MemoryCreateDialog } from "./memory-create-dialog";
import { MemoryRecallDialog } from "./memory-recall-dialog";
import { MemoryItemsList } from "./memory-items-list";

const MEMORY_TYPE_PILLS = [
  { id: "all", label: UI_COPY.MEMORY.TYPE_FILTERS.ALL },
  { id: MemoryType.FACT, label: UI_COPY.MEMORY.TYPE_FILTERS.FACTS },
  { id: MemoryType.EPISODIC, label: UI_COPY.MEMORY.TYPE_FILTERS.EPISODIC },
  { id: MemoryType.USER_PREFERENCE, label: UI_COPY.MEMORY.TYPE_FILTERS.PREFERENCES },
  { id: MemoryType.WORKING, label: UI_COPY.MEMORY.TYPE_FILTERS.WORKING },
];

export interface MemoryPageContentProps {
  /** If true, renders the content directly without wrapping in PageShell */
  readonly hideShell?: boolean;
}

/**
 * Enterprise agent memory dashboard and recall testing workbench.
 */
export function MemoryPageContent({
  hideShell = false,
}: MemoryPageContentProps = {}): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const { data: memories = [], isLoading, error, refetch } = useMemories();

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = m.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "all" || m.memoryType === selectedType;
    return matchesSearch && matchesType;
  });

  const actionButtons = (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsRecallOpen(true)}
        style={{
          height: hideShell ? "1.75rem" : "2rem",
          cursor: "pointer",
          gap: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        <Sparkles style={{ width: "0.875rem", height: "0.875rem" }} />
        <span>{UI_COPY.MEMORY.RECALL_TESTER.TRIGGER_BUTTON}</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsCreateOpen(true)}
        style={{
          height: hideShell ? "1.75rem" : "2rem",
          cursor: "pointer",
          gap: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
        <span>{UI_COPY.MEMORY.RECORD_BUTTON}</span>
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
            placeholder={UI_COPY.MEMORY.SEARCH_PLACEHOLDER}
            startIcon={<Search style={{ width: "0.875rem", height: "0.875rem" }} />}
            style={{ height: "2rem", fontSize: "0.75rem" }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.375rem" }}>
            {MEMORY_TYPE_PILLS.map((pill) => (
              <Button
                key={pill.id}
                variant={selectedType === pill.id ? "default" : "outline"}
                size="sm"
                onClick={(): void => setSelectedType(pill.id)}
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

      {/* Persisted Memories List */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <DynamicErrorState
          error={error}
          title={UI_COPY.MEMORY.ERROR_TITLE}
          reset={() => void refetch()}
        />
      ) : memories.length === 0 ? (
        <EmptyState
          icon={Brain}
          title={UI_COPY.MEMORY.EMPTY_TITLE}
          description={UI_COPY.MEMORY.EMPTY_DESC}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateOpen(true)}
              style={{ height: "2rem", cursor: "pointer", fontSize: "0.75rem" }}
            >
              <Plus style={{ marginRight: "0.375rem", width: "0.875rem", height: "0.875rem" }} />{" "}
              {UI_COPY.MEMORY.RECORD_BUTTON}
            </Button>
          }
        />
      ) : filteredMemories.length === 0 ? (
        <EmptyState
          icon={Search}
          title={UI_COPY.MEMORY.NO_MATCH_TITLE}
          description={UI_COPY.MEMORY.NO_MATCH_DESC(search)}
        />
      ) : (
        <MemoryItemsList
          memories={filteredMemories}
          isLoading={isLoading}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      )}

      {/* Record Memory Modal Dialog */}
      <MemoryCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Interactive Recall Tester Modal Dialog */}
      <MemoryRecallDialog isOpen={isRecallOpen} onClose={() => setIsRecallOpen(false)} />
    </div>
  );

  if (hideShell) {
    return bodyContent;
  }

  return (
    <PageShell
      title={UI_COPY.MEMORY.PAGE_TITLE}
      breadcrumb={UI_COPY.MEMORY.BREADCRUMB}
      stats={UI_COPY.MEMORY.STATS(memories.length)}
      description={UI_COPY.MEMORY.PAGE_DESCRIPTION}
      actions={actionButtons}
    >
      {bodyContent}
    </PageShell>
  );
}
