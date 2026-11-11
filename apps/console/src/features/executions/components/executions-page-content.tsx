/**
 * @file executions-page-content.tsx
 * @description Executions trace view with single header, refresh capability, and EmptyState guards.
 * @module apps/console/features/executions/components
 */

"use client";

import React, { useState } from "react";
import { ExecutionTable } from "./execution-table";
import { ExecutionDebugDialog } from "./execution-debug-dialog";
import { Button, Input } from "@orchestrai/ui";
import { Search, RotateCcw, Play } from "lucide-react";
import { useExecutions } from "../api";
import { ExecutionStatus, type ExecutionRun } from "../types";
import { EmptyState } from "@orchestrai/ui/components/empty-state";
import { TableSkeleton } from "@orchestrai/ui/components/skeleton";
import { PageShell } from "@/components/layout/page-shell";
import { UI_COPY } from "@/lib/ui-copy";

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
      title={UI_COPY.EXECUTIONS.PAGE_TITLE}
      breadcrumb={UI_COPY.EXECUTIONS.BREADCRUMB}
      stats={UI_COPY.EXECUTIONS.STATS(executionList.length)}
      description={UI_COPY.EXECUTIONS.PAGE_DESCRIPTION}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            refetch();
          }}
          style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem" }}
        >
          <RotateCcw style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>{UI_COPY.COMMON.ACTIONS.REFRESH}</span>
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Search and Filters */}
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
              placeholder={UI_COPY.EXECUTIONS.SEARCH_PLACEHOLDER}
              startIcon={<Search style={{ width: "0.875rem", height: "0.875rem" }} />}
              style={{ height: "2rem", fontSize: "0.75rem" }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.375rem" }}>
            {[
              "ALL",
              ExecutionStatus.COMPLETED,
              ExecutionStatus.RUNNING,
              ExecutionStatus.FAILED,
            ].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={(): void => setStatusFilter(s)}
                style={{ height: "1.75rem", paddingInline: "0.625rem", fontSize: "0.75rem" }}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Execution Area */}
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : executionList.length === 0 ? (
          <EmptyState
            icon={Play}
            title={UI_COPY.EXECUTIONS.EMPTY_TITLE}
            description={UI_COPY.EXECUTIONS.EMPTY_DESC}
          />
        ) : filteredExecutions.length === 0 ? (
          <EmptyState
            icon={Search}
            title={UI_COPY.EXECUTIONS.NO_MATCH_TITLE}
            description={UI_COPY.EXECUTIONS.NO_MATCH_DESC(search)}
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
