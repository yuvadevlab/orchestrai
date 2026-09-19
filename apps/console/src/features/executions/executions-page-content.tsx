"use client";

import React, { useState } from "react";
import { ExecutionTable } from "./components/execution-table";
import { MOCK_EXECUTIONS } from "./mock-executions";
import { Button, Input, Badge } from "@yuva-devlab/ui";
import { Search, RotateCcw } from "lucide-react";

/**
 * Main Executions View.
 * Displays searchable execution history, step counts, and status indicators.
 */
export function ExecutionsPageContent(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredExecutions = MOCK_EXECUTIONS.filter((ex) => {
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
              {MOCK_EXECUTIONS.length} DAG Runs
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Inspect past and active agent runs, step checkpoints, and forensic traces.
          </p>
        </div>

        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
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

      {/* Execution Table */}
      <ExecutionTable executions={filteredExecutions} />
    </div>
  );
}
