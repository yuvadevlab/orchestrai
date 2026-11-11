"use client";

/**
 * @file execution-row-actions.tsx
 * @description Action buttons for an execution table row.
 * @module apps/console/features/executions/components
 */

import React from "react";
import Link from "next/link";
import { Button } from "@orchestrai/ui";
import { ExternalLink, Bug } from "lucide-react";
import type { ExecutionRun } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

export interface ExecutionRowActionsProps {
  readonly execution: ExecutionRun;
  readonly onSelectDebug?: (execution: ExecutionRun) => void;
}

/**
 * Action buttons for execution row: Forensic debug button and session link.
 */
export function ExecutionRowActions({
  execution: ex,
  onSelectDebug,
}: ExecutionRowActionsProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "0.375rem",
      }}
    >
      {onSelectDebug && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectDebug(ex)}
          style={{
            height: "1.75rem",
            gap: "0.25rem",
            paddingInline: "0.5rem",
            fontSize: "0.75rem",
          }}
          title={UI_COPY.EXECUTIONS.TABLE.DEBUG_TOOLTIP}
          aria-label={UI_COPY.EXECUTIONS.TABLE.DEBUG_TOOLTIP}
        >
          <Bug
            style={{
              width: "0.75rem",
              height: "0.75rem",
              color: "var(--warning, #eab308)",
            }}
          />
          <span>{UI_COPY.EXECUTIONS.TABLE.DEBUG_BTN}</span>
        </Button>
      )}
      {ex.conversationId && (
        <Button
          asChild
          variant="ghost"
          size="sm"
          style={{
            height: "1.75rem",
            gap: "0.25rem",
            paddingInline: "0.5rem",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
          }}
          title={UI_COPY.EXECUTIONS.TABLE.SESSION_TOOLTIP}
          aria-label={UI_COPY.EXECUTIONS.TABLE.SESSION_TOOLTIP}
        >
          <Link href={`/session/${ex.conversationId}`}>
            <span>{UI_COPY.EXECUTIONS.TABLE.SESSION_BTN}</span>
            <ExternalLink style={{ width: "0.75rem", height: "0.75rem" }} />
          </Link>
        </Button>
      )}
    </div>
  );
}
