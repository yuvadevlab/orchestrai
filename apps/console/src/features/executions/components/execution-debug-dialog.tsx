"use client";

/**
 * @file execution-debug-dialog.tsx
 * @description Forensic developer debug dialog for deep-diving into execution state, errors, and traces.
 * Powered by @yuva-devlab/ui Dialog primitives for accessible dialog behavior and sizing.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Button,
} from "@yuva-devlab/ui";
import { Check, Copy, AlertTriangle, ExternalLink, Terminal } from "lucide-react";
import Link from "next/link";
import type { ExecutionRun } from "../types";
import { StatusBadge } from "@/components/ui/status-badge";

export interface ExecutionDebugDialogProps {
  /** The execution record to inspect, or null if modal is closed */
  execution: ExecutionRun | null;
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback fired when dialog dismiss is requested */
  onClose: () => void;
}

/**
 * Forensic developer debug dialog displaying execution metadata, step graphs, and raw state JSON.
 * Utilizes @yuva-devlab/ui Dialog with size="2xl".
 */
export function ExecutionDebugDialog({
  execution,
  isOpen,
  onClose,
}: ExecutionDebugDialogProps): React.JSX.Element | null {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Guard: Return early if dialog is closed or no execution is loaded
  if (!execution) {
    return null;
  }

  const handleCopyId = (): void => {
    if (!execution.id) return;
    navigator.clipboard.writeText(execution.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyJson = (): void => {
    navigator.clipboard.writeText(JSON.stringify(execution, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-3 pr-8">
            <div className="flex items-center gap-2">
              <Terminal className="text-primary size-4" />
              <DialogTitle className="font-display">Execution Debug Trace</DialogTitle>
            </div>
            <StatusBadge status={execution.status} />
            <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
              <span>ID: {execution.id}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="hover:text-foreground inline-flex cursor-pointer items-center gap-1 transition-colors"
                title="Copy Execution ID"
              >
                {copiedId ? <Check className="text-success size-3" /> : <Copy className="size-3" />}
                <span className="text-[10px]">{copiedId ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Forensic developer debug details, execution metrics, and DAG trace for execution{" "}
            {execution.id}.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5 overflow-y-auto px-6 py-5">
          {/* Error Callout if Failed */}
          {execution.errorMessage && (
            <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-md border p-3.5 text-xs">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">Execution Failure</p>
                <p className="font-mono text-[11px] leading-relaxed break-all">
                  {execution.errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Row */}
          <div className="flex flex-wrap items-stretch gap-3">
            <div className="border-border bg-muted/20 flex min-w-50 flex-1 flex-col justify-between rounded-lg border p-3.5">
              <span className="text-muted-foreground text-xs font-medium">Specialist</span>
              <div className="text-foreground mt-1 text-sm font-semibold">
                {execution.agentName}
              </div>
              <span className="text-muted-foreground mt-0.5 text-xs">{execution.agentRole}</span>
            </div>

            <div className="border-border bg-muted/20 flex min-w-50 flex-1 flex-col justify-between rounded-lg border p-3.5">
              <span className="text-muted-foreground text-xs font-medium">Model Engine</span>
              <div className="text-foreground mt-1 font-mono text-xs font-semibold break-all">
                {execution.agentModel}
              </div>
              <span className="text-muted-foreground mt-0.5 text-xs capitalize">
                {execution.mode} mode
              </span>
            </div>

            <div className="border-border bg-muted/20 flex min-w-45 flex-1 flex-col justify-between rounded-lg border p-3.5">
              <span className="text-muted-foreground text-xs font-medium">Duration & Latency</span>
              <div className="text-foreground mt-1 font-mono text-sm font-semibold">
                {execution.durationFormatted}
              </div>
              <span className="text-muted-foreground mt-0.5 font-mono text-xs">
                {execution.latencyMs.toLocaleString()}ms total
              </span>
            </div>

            <div className="border-border bg-muted/20 flex min-w-45 flex-1 flex-col justify-between rounded-lg border p-3.5">
              <span className="text-muted-foreground text-xs font-medium">Progress & Tokens</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-foreground text-sm font-semibold">
                  Step {execution.stepsCompleted}/{execution.totalSteps}
                </span>
              </div>
              <span className="text-muted-foreground mt-0.5 font-mono text-xs">
                {execution.tokensUsed > 0
                  ? `${execution.tokensUsed.toLocaleString()} tokens`
                  : "0 tokens"}
              </span>
            </div>
          </div>

          {/* Steps Trace Preview */}
          {execution.steps && execution.steps.length > 0 && (
            <div className="space-y-2">
              <span className="text-foreground text-xs font-semibold">DAG Step Checkpoints</span>
              <div className="border-border divide-y rounded-md border text-xs">
                {execution.steps.map((st) => (
                  <div key={st.stepIndex} className="flex items-center justify-between p-2.5">
                    <span className="font-mono text-[11px]">
                      #{st.stepIndex + 1} {st.nodeName}
                    </span>
                    <div className="flex items-center gap-2">
                      {st.durationMs !== undefined && (
                        <span className="text-muted-foreground font-mono text-[11px]">
                          {st.durationMs}ms
                        </span>
                      )}
                      <span className="border-border bg-muted/40 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase">
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw State JSON Box */}
          <div className="min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-semibold">Forensic JSON Payload</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="h-6.5 cursor-pointer gap-1 px-2 text-[11px]"
              >
                {copiedJson ? <Check className="size-3" /> : <Copy className="size-3" />}
                <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
              </Button>
            </div>
            <div className="border-border bg-muted/40 max-h-72 w-full overflow-auto rounded-md border p-3.5">
              <pre className="text-foreground font-mono text-[11px] leading-relaxed whitespace-pre">
                {JSON.stringify(execution, null, 2)}
              </pre>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 cursor-pointer text-xs"
          >
            Close
          </Button>
          {execution.conversationId && (
            <Button
              asChild
              variant="default"
              size="sm"
              className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
            >
              <Link href={`/session/${execution.conversationId}`}>
                <span>Open Session Thread</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
