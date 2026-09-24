"use client";

/**
 * @file execution-table.tsx
 * @description Data table displaying historical and live agent execution runs with studio links.
 * @module apps/console/features/executions/components
 */

import React from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
} from "@yuva-devlab/ui";
import { ExternalLink } from "lucide-react";
import type { ExecutionRun, ExecutionStatus } from "../types";

import { StatusBadge } from "@/components/ui/status-badge";

export interface ExecutionTableProps {
  executions: ExecutionRun[];
}

function getStatusBadge(status: ExecutionStatus): React.JSX.Element {
  return <StatusBadge status={status} />;
}

/**
 * Data table displaying historical and live agent execution runs.
 */
export function ExecutionTable({ executions }: ExecutionTableProps): React.JSX.Element {
  return (
    <div className="border-border bg-card overflow-hidden rounded-md border shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="text-xs font-semibold">Execution ID</TableHead>
            <TableHead className="text-xs font-semibold">Intent</TableHead>
            <TableHead className="text-xs font-semibold">Specialist</TableHead>
            <TableHead className="text-xs font-semibold">Status</TableHead>
            <TableHead className="text-xs font-semibold">Steps</TableHead>
            <TableHead className="text-xs font-semibold">Latency</TableHead>
            <TableHead className="text-right text-xs font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((ex) => (
            <TableRow key={ex.id} className="hover:bg-muted/20 text-xs">
              <TableCell className="text-foreground font-mono font-medium">
                {ex.id.slice(0, 8)}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate font-medium">
                {ex.intent}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono">{ex.primaryAgent}</TableCell>
              <TableCell>{getStatusBadge(ex.status)}</TableCell>
              <TableCell className="font-mono">
                {ex.stepsCompleted} / {ex.totalSteps}
              </TableCell>
              <TableCell className="text-primary font-mono">{ex.latencyMs}ms</TableCell>
              <TableCell className="text-right">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 font-mono text-xs"
                >
                  <Link href={`/session/${ex.id}`}>
                    <span>Inspect</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
