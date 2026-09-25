/**
 * @file executions-page-content.tsx
 * @description Executions trace view with single header, refresh capability, and EmptyState guards.
 * @module apps/console/features/executions/components
 */

"use client";

import React, { useState } from "react";
import { ExecutionTable } from "./execution-table";
import { ExecutionDebugDialog } from "./execution-debug-dialog";
import { Button, Input } from "@yuva-devlab/ui";
import { Search, RotateCcw, Play } from "lucide-react";
import { useExecutions } from "../api";
import type { ExecutionRun } from "../types";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/layout/page-shell";

/**
 * Main Executions View.
 * Displays searchable execution history, step counts, live API mapping, and empty state rendering.
 */
export function ExecutionsPageContent(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedDebugExecution, setSelectedDebugExecution] = useState<ExecutionRun | null>(null);
  const { data: executionList, isLoading, refetch } = useExecutions();

  const filteredExecutions = executionList.filter((ex) => {
    const matchesSearch =
      ex.id.toLowerCase().includes(search.toLowerCase()) ||
      ex.intent.toLowerCase().includes(search.toLowerCase()) ||
      ex.agentName.toLowerCase().includes(search.toLowerCase()) ||
      ex.agentModel.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || ex.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageShell
      title="Execution history"
      breadcrumb="Executions"
      stats={`${executionList.length} DAG runs`}
      description="A replayable record of execution DAG runs, step checkpoints, and forensic traces."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            refetch();
          }}
          className="h-8 gap-1.5 font-sans text-xs"
        >
          <RotateCcw className="size-3.5" />
          <span>Refresh traces</span>
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Search and Filters */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)}
              placeholder="Search by ID, intent, or agent..."
              startIcon={<Search className="size-3.5" />}
              className="bg-card h-8 font-sans text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {["ALL", "COMPLETED", "RUNNING", "FAILED"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={(): void => setStatusFilter(s)}
                className="h-7 px-2.5 font-sans text-xs"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Execution Area */}
        {isLoading ? (
          <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-md border backdrop-blur">
            <span className="text-muted-foreground animate-pulse font-sans text-xs">
              Fetching execution traces from gateway...
            </span>
          </div>
        ) : executionList.length === 0 ? (
          <EmptyState
            icon={Play}
            title="No Executions Recorded"
            description="No execution traces have been dispatched to the OrchestrAI cluster yet."
          />
        ) : filteredExecutions.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Executions Matched"
            description={`No execution traces matched your search query "${search}".`}
          />
        ) : (
          <ExecutionTable
            executions={filteredExecutions}
            onSelectDebug={(ex) => setSelectedDebugExecution(ex)}
          />
        )}

        {/* Forensic Execution Debug Dialog */}
        <ExecutionDebugDialog
          execution={selectedDebugExecution}
          isOpen={Boolean(selectedDebugExecution)}
          onClose={() => setSelectedDebugExecution(null)}
        />
      </div>
    </PageShell>
  );
}
