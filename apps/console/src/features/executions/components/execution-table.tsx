"use client";

/**
 * @file execution-table.tsx
 * @description Rich data table displaying execution runs with human-readable specialist names, timing, and debug actions.
 * @module apps/console/features/executions/components
 */

import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@orchestrai/ui";
import type { ExecutionRun } from "../types";
import { UI_COPY } from "@/lib/ui-copy";
import { ExecutionTableRow } from "./execution-table-row";

export interface ExecutionTableProps {
  executions: ExecutionRun[];
  onSelectDebug?: (execution: ExecutionRun) => void;
}

/**
 * Data table displaying historical and live agent execution runs with rich debugging context.
 */
export function ExecutionTable({
  executions,
  onSelectDebug,
}: ExecutionTableProps): React.JSX.Element {
  return (
    <div className="orch-table-container">
      <Table>
        <TableHeader
          style={{ backgroundColor: "color-mix(in oklab, var(--muted) 40%, transparent)" }}
        >
          <TableRow>
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {UI_COPY.EXECUTIONS.TABLE.EXECUTION_TIME}
            </TableHead>
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {UI_COPY.EXECUTIONS.TABLE.TASK_OBJECTIVE}
            </TableHead>
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {UI_COPY.EXECUTIONS.TABLE.SPECIALIST_ENGINE}
            </TableHead>
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {UI_COPY.EXECUTIONS.TABLE.STATUS_STEPS}
            </TableHead>
            <TableHead style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {UI_COPY.EXECUTIONS.TABLE.DURATION_USAGE}
            </TableHead>
            <TableHead style={{ textAlign: "right", fontSize: "0.75rem", fontWeight: 600 }}>
              {UI_COPY.EXECUTIONS.TABLE.FORENSIC_ACTIONS}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((ex) => (
            <ExecutionTableRow key={ex.id} execution={ex} onSelectDebug={onSelectDebug} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
