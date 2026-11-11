"use client";

/**
 * @file execution-debug-payload.tsx
 * @description Renders DAG checkpoint trace list and raw JSON state inspector with clipboard copy.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@orchestrai/ui";
import type { ExecutionRun } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

export interface ExecutionDebugPayloadProps {
  readonly execution: ExecutionRun;
}

/**
 * Forensic step traces and raw state inspector.
 */
export function ExecutionDebugPayload({
  execution,
}: ExecutionDebugPayloadProps): React.JSX.Element {
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyJson = (): void => {
    navigator.clipboard.writeText(JSON.stringify(execution, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <>
      {/* Steps Trace Preview */}
      {execution.steps && execution.steps.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ color: "var(--foreground)", fontSize: "0.75rem", fontWeight: 600 }}>
            {UI_COPY.EXECUTIONS.DEBUG_DIALOG.DAG_CHECKPOINTS}
          </span>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md, 0.375rem)",
              fontSize: "0.75rem",
            }}
          >
            {execution.steps.map((st, idx) => (
              <div
                key={st.stepIndex}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.625rem",
                  borderBottom:
                    idx < (execution.steps?.length ?? 0) - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6875rem" }}>
                  #{st.stepIndex + 1} {st.nodeName}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {st.durationMs !== undefined && (
                    <span
                      style={{
                        color: "var(--mutedForeground)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.6875rem",
                      }}
                    >
                      {st.durationMs}ms
                    </span>
                  )}
                  <span
                    style={{
                      border: "1px solid var(--border)",
                      backgroundColor: "color-mix(in oklab, var(--muted) 40%, transparent)",
                      borderRadius: "var(--radius-sm, 0.25rem)",
                      paddingInline: "0.375rem",
                      paddingBlock: "0.125rem",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.625rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {st.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw State JSON Box */}
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "var(--foreground)", fontSize: "0.75rem", fontWeight: 600 }}>
            {UI_COPY.EXECUTIONS.DEBUG_DIALOG.JSON_PAYLOAD_TITLE}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            style={{
              height: "1.625rem",
              cursor: "pointer",
              gap: "0.25rem",
              paddingInline: "0.5rem",
              fontSize: "0.6875rem",
            }}
          >
            {copiedJson ? (
              <Check style={{ width: "0.75rem", height: "0.75rem" }} />
            ) : (
              <Copy style={{ width: "0.75rem", height: "0.75rem" }} />
            )}
            <span>
              {copiedJson
                ? UI_COPY.COMMON.ACTIONS.COPIED
                : UI_COPY.EXECUTIONS.DEBUG_DIALOG.COPY_JSON}
            </span>
          </Button>
        </div>
        <div
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "color-mix(in oklab, var(--muted) 40%, transparent)",
            maxHeight: "18rem",
            width: "100%",
            overflow: "auto",
            borderRadius: "var(--radius-md, 0.375rem)",
            padding: "0.875rem",
          }}
        >
          <pre
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6875rem",
              lineHeight: 1.5,
              whiteSpace: "pre",
              margin: 0,
            }}
          >
            {JSON.stringify(execution, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
}
