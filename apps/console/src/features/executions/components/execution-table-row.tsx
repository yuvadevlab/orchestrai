"use client";

/**
 * @file execution-table-row.tsx
 * @description Single execution table row with forensic debugging actions and copyable ID.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import { TableRow, TableCell, Badge } from "@orchestrai/ui";
import { Copy, Check } from "lucide-react";
import type { ExecutionRun } from "../types";
import { StatusBadge } from "@orchestrai/ui/components/status-badge";
import { UI_COPY } from "@/lib/ui-copy";
import { ExecutionRowActions } from "./execution-row-actions";

export interface ExecutionTableRowProps {
  readonly execution: ExecutionRun;
  readonly onSelectDebug?: (execution: ExecutionRun) => void;
}

function getAgentInitials(name: string): string {
  const parts = name.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "AG";
}

/**
 * Table row representing a single execution run.
 */
export function ExecutionTableRow({
  execution: ex,
  onSelectDebug,
}: ExecutionTableRowProps): React.JSX.Element {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <TableRow style={{ fontSize: "0.75rem" }}>
      {/* ID & Time */}
      <TableCell style={{ verticalAlign: "middle" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontFamily: "var(--font-mono, monospace)",
              fontWeight: 500,
            }}
          >
            <span style={{ color: "var(--foreground)" }}>{ex.id.slice(0, 8)}</span>
            <button
              type="button"
              onClick={(e) => handleCopy(ex.id, e)}
              style={{
                color: "var(--mutedForeground)",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                padding: 0,
              }}
              title={UI_COPY.EXECUTIONS.TABLE.COPY_ID_TOOLTIP}
              aria-label={UI_COPY.EXECUTIONS.TABLE.COPY_ID_TOOLTIP}
            >
              {copiedId === ex.id ? (
                <Check
                  style={{
                    color: "var(--success, #22c55e)",
                    width: "0.75rem",
                    height: "0.75rem",
                  }}
                />
              ) : (
                <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
              )}
            </button>
          </div>
          <span style={{ color: "var(--mutedForeground)", fontSize: "0.6875rem" }}>
            {ex.timeAgo}
          </span>
        </div>
      </TableCell>

      {/* Task / Intent */}
      <TableCell style={{ maxWidth: "20rem", verticalAlign: "middle" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span
            style={{
              color: "var(--foreground)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
            title={ex.intent}
          >
            {ex.intent}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Badge variant="outline" style={{ fontSize: "0.625rem", textTransform: "uppercase" }}>
              {ex.mode}
            </Badge>
            {ex.errorMessage && (
              <span
                style={{
                  color: "var(--destructive)",
                  maxWidth: "11rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "0.625rem",
                }}
                title={ex.errorMessage}
              >
                {ex.errorMessage}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      {/* Specialist & Model */}
      <TableCell style={{ verticalAlign: "middle" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="orch-table-badge">{getAgentInitials(ex.agentName)}</div>
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <span
              style={{
                color: "var(--foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
            >
              {ex.agentName}
            </span>
            <span
              style={{
                color: "var(--mutedForeground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.625rem",
              }}
            >
              {ex.agentModel}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Status & Steps */}
      <TableCell style={{ verticalAlign: "middle" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div>
            <StatusBadge status={ex.status} />
          </div>
          <span
            style={{
              color: "var(--mutedForeground)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
            }}
          >
            Step {ex.stepsCompleted} / {ex.totalSteps}
            {ex.currentNode && ` · ${ex.currentNode}`}
          </span>
        </div>
      </TableCell>

      {/* Duration & Tokens */}
      <TableCell style={{ verticalAlign: "middle" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.125rem",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
            {ex.durationFormatted}
          </span>
          <span style={{ color: "var(--mutedForeground)", fontSize: "0.6875rem" }}>
            {ex.tokensUsed > 0 ? `${ex.tokensUsed.toLocaleString()} tok` : "—"}
          </span>
        </div>
      </TableCell>

      {/* Forensic Actions */}
      <TableCell style={{ textAlign: "right", verticalAlign: "middle" }}>
        <ExecutionRowActions execution={ex} onSelectDebug={onSelectDebug} />
      </TableCell>
    </TableRow>
  );
}
