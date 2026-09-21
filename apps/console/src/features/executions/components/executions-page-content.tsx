"use client";

/**
 * @file executions-page-content.tsx
 * @description Executions trace view with live API mapping, refresh capability, and EmptyState guards.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import { ExecutionTable } from "./execution-table";
import { Button, Input, Badge } from "@yuva-devlab/ui";
import { Search, RotateCcw, Play } from "lucide-react";
import { useExecutions } from "../api";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Main Executions View.
 * Displays searchable execution history, step counts, live API mapping, and empty state rendering.
 */
export function ExecutionsPageContent(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { data: executionList, isLoading, refetch } = useExecutions();

  const filteredExecutions = executionList.filter((ex) => {
    const matchesSearch =
      ex.id.toLowerCase().includes(search.toLowerCase()) ||
      ex.intent.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryAgent.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || ex.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-bold tracking-tight">Execution History</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {executionList.length} DAG Runs
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Inspect past and active agent runs, step checkpoints, and forensic traces.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            refetch();
          }}
          className="h-8 gap-1.5 font-mono text-xs"
        >
          <RotateCcw className="size-3.5" />
          <span>Refresh Traces</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
          <Input
            value={search}
            onChange={(e): void => setSearch(e.target.value)}
            placeholder="Search by ID, intent, or agent..."
            className="bg-card h-8 pl-8 font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {["ALL", "COMPLETED", "RUNNING", "FAILED"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={(): void => setStatusFilter(s)}
              className="h-7 px-2.5 font-mono text-xs"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Execution Area */}
      {isLoading ? (
        <div className="border-border bg-card/30 flex min-h-50 items-center justify-center rounded-lg border backdrop-blur">
          <span className="text-muted-foreground animate-pulse font-mono text-xs">
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
        <ExecutionTable executions={filteredExecutions} />
      )}
    </div>
  );
}
