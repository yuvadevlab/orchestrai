"use client";

/**
 * @file apps/console/src/features/memory/components/memory-page-content.tsx
 * @description Main dashboard view for agent long-term memory, episodic reflections, and learned facts.
 * @module apps/console/features/memory/components
 */

import React, { useState } from "react";
import { Plus, Search, Sparkles, Brain } from "lucide-react";
import { Button, Input } from "@yuva-devlab/ui";
import { MemoryType } from "@orchestrai/shared-types";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/ui";
import { useMemories } from "../api";
import { MemoryCreateDialog } from "./memory-create-dialog";
import { MemoryRecallDialog } from "./memory-recall-dialog";
import { MemoryItemsList } from "./memory-items-list";

const MEMORY_TYPE_PILLS = [
  { id: "all", label: "All Types" },
  { id: MemoryType.FACT, label: "Facts" },
  { id: MemoryType.EPISODIC, label: "Episodic" },
  { id: MemoryType.USER_PREFERENCE, label: "Preferences" },
  { id: MemoryType.WORKING, label: "Working" },
];

/**
 * Enterprise agent memory dashboard and recall testing workbench.
 */
export function MemoryPageContent(): React.JSX.Element {
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

  return (
    <PageShell
      title="Agent Memory & Recall"
      breadcrumb="Memory"
      stats={`${memories.length} memories retained`}
      description="Cross-session episodic reflections and semantic facts that persist across swarm interactions."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecallOpen(true)}
            className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
          >
            <Sparkles className="size-3.5" />
            <span>Test recall</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
          >
            <Plus className="size-3.5" />
            <span>Record memory</span>
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
              placeholder="Search memories by content..."
              startIcon={<Search className="size-3.5" />}
              className="bg-card h-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            {MEMORY_TYPE_PILLS.map((pill) => (
              <Button
                key={pill.id}
                variant={selectedType === pill.id ? "default" : "outline"}
                size="sm"
                onClick={(): void => setSelectedType(pill.id)}
                className="h-7 cursor-pointer rounded-full px-3 text-xs capitalize"
              >
                {pill.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Persisted Memories List */}
        {isLoading ? (
          <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-md border backdrop-blur">
            <span className="text-muted-foreground animate-pulse text-xs">
              Loading agent memories from gateway...
            </span>
          </div>
        ) : error ? (
          <div className="border-border bg-card flex flex-col items-center justify-center gap-2 rounded-md border p-6 text-center">
            <p className="text-foreground text-xs font-medium">Failed to load memories</p>
            <p className="text-muted-foreground max-w-md text-xs">{error.message}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
              className="mt-2 h-7 cursor-pointer text-xs"
            >
              Retry
            </Button>
          </div>
        ) : memories.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No Memories Retained"
            description="Cross-session memories store learned facts, user preferences, and execution reflections."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreateOpen(true)}
                className="h-8 cursor-pointer text-xs"
              >
                <Plus className="mr-1.5 size-3.5" /> Record First Memory
              </Button>
            }
          />
        ) : filteredMemories.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Memories Matched"
            description={`No memories matched your search query "${search}".`}
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
    </PageShell>
  );
}
