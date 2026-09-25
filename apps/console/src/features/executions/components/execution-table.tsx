"use client";

/**
 * @file execution-table.tsx
 * @description Rich data table displaying execution runs with human-readable specialist names, timing, and debug actions.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
  Badge,
} from "@yuva-devlab/ui";
import { ExternalLink, Copy, Check, Bug } from "lucide-react";
import type { ExecutionRun } from "../types";
import { StatusBadge } from "@/components/ui/status-badge";

export interface ExecutionTableProps {
  executions: ExecutionRun[];
  onSelectDebug?: (execution: ExecutionRun) => void;
}

/**
 * Extracts 2-letter uppercase initials for an agent name.
 */
function getAgentInitials(name: string): string {
  const parts = name.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "AG";
}

/**
 * Data table displaying historical and live agent execution runs with rich debugging context.
 */
export function ExecutionTable({
  executions,
  onSelectDebug,
}: ExecutionTableProps): React.JSX.Element {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-md border shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="text-xs font-semibold">Execution & Time</TableHead>
            <TableHead className="text-xs font-semibold">Task Objective</TableHead>
            <TableHead className="text-xs font-semibold">Specialist & Engine</TableHead>
            <TableHead className="text-xs font-semibold">Status & Steps</TableHead>
            <TableHead className="text-xs font-semibold">Duration & Usage</TableHead>
            <TableHead className="text-right text-xs font-semibold">Forensic Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((ex) => (
            <TableRow key={ex.id} className="hover:bg-muted/20 text-xs transition-colors">
              {/* ID & Time */}
              <TableCell className="align-middle">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 font-mono font-medium">
                    <span className="text-foreground">{ex.id.slice(0, 8)}</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(ex.id, e)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title="Copy full Execution ID"
                    >
                      {copiedId === ex.id ? (
                        <Check className="text-success size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                  <span className="text-muted-foreground text-[11px]">{ex.timeAgo}</span>
                </div>
              </TableCell>

              {/* Task / Intent */}
              <TableCell className="max-w-xs align-middle">
                <div className="flex flex-col gap-1">
                  <span className="text-foreground truncate font-medium" title={ex.intent}>
                    {ex.intent}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {ex.mode}
                    </Badge>
                    {ex.errorMessage && (
                      <span
                        className="text-destructive max-w-45 truncate text-[10px]"
                        title={ex.errorMessage}
                      >
                        {ex.errorMessage}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Specialist & Model */}
              <TableCell className="align-middle">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary border-primary/20 flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold">
                    {getAgentInitials(ex.agentName)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-foreground truncate font-medium">{ex.agentName}</span>
                    <span className="text-muted-foreground truncate font-mono text-[10px]">
                      {ex.agentModel}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Status & Steps */}
              <TableCell className="align-middle">
                <div className="flex flex-col gap-1">
                  <div>
                    <StatusBadge status={ex.status} />
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    Step {ex.stepsCompleted} / {ex.totalSteps}
                    {ex.currentNode && ` · ${ex.currentNode}`}
                  </span>
                </div>
              </TableCell>

              {/* Duration & Tokens */}
              <TableCell className="align-middle">
                <div className="flex flex-col gap-0.5 font-mono">
                  <span className="text-foreground font-medium">{ex.durationFormatted}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {ex.tokensUsed > 0 ? `${ex.tokensUsed.toLocaleString()} tok` : "—"}
                  </span>
                </div>
              </TableCell>

              {/* Forensic Actions */}
              <TableCell className="text-right align-middle">
                <div className="flex items-center justify-end gap-1.5">
                  {onSelectDebug && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectDebug(ex)}
                      className="h-7 gap-1 px-2 text-xs"
                      title="Open developer debug trace"
                    >
                      <Bug className="size-3 text-amber-400" />
                      <span>Debug</span>
                    </Button>
                  )}
                  {ex.conversationId && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 font-mono text-xs"
                      title="Open live session thread"
                    >
                      <Link href={`/session/${ex.conversationId}`}>
                        <span>Session</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
