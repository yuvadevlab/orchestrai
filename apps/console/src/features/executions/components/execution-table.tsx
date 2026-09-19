import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from "@yuva-devlab/ui";
import { CheckCircle2, XCircle, Play } from "lucide-react";
import type { ExecutionRun, ExecutionStatus } from "../types";

export interface ExecutionTableProps {
  executions: ExecutionRun[];
}

function getStatusBadge(status: ExecutionStatus): React.JSX.Element {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="default" className="gap-1 px-1.5 py-0 font-mono text-[10px]">
          <CheckCircle2 className="size-3" />
          <span>COMPLETED</span>
        </Badge>
      );
    case "RUNNING":
      return (
        <Badge
          variant="outline"
          className="text-primary border-primary/40 animate-pulse gap-1 px-1.5 py-0 font-mono text-[10px]"
        >
          <Play className="size-3" />
          <span>RUNNING</span>
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1 px-1.5 py-0 font-mono text-[10px]">
          <XCircle className="size-3" />
          <span>FAILED</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
          {status}
        </Badge>
      );
  }
}

/**
 * Data table displaying historical and live agent execution runs.
 */
export function ExecutionTable({ executions }: ExecutionTableProps): React.JSX.Element {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="text-xs font-semibold">Execution ID</TableHead>
            <TableHead className="text-xs font-semibold">Intent</TableHead>
            <TableHead className="text-xs font-semibold">Lead Agent</TableHead>
            <TableHead className="text-xs font-semibold">Status</TableHead>
            <TableHead className="text-xs font-semibold">Steps</TableHead>
            <TableHead className="text-xs font-semibold">Latency</TableHead>
            <TableHead className="text-right text-xs font-semibold">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((ex) => (
            <TableRow key={ex.id} className="hover:bg-muted/20 text-xs">
              <TableCell className="text-foreground font-mono font-medium">{ex.id}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate font-medium">
                {ex.intent}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono">{ex.primaryAgent}</TableCell>
              <TableCell>{getStatusBadge(ex.status)}</TableCell>
              <TableCell className="font-mono">
                {ex.stepsCompleted} / {ex.totalSteps}
              </TableCell>
              <TableCell className="text-primary font-mono">{ex.latencyMs}ms</TableCell>
              <TableCell className="text-muted-foreground text-right font-mono">
                {ex.createdAt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
