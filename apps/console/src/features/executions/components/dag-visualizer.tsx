"use client";

/**
 * @file apps/console/src/features/executions/components/dag-visualizer.tsx
 * @description Interactive DAG visualizer displaying execution node graph, dependencies, and step states.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, CheckCircle2, AlertCircle, Clock, Play } from "lucide-react";
import { Button } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { UI_COPY } from "@/lib/ui-copy";
import type { ExecutionRun, ExecutionStepTrace } from "../types";

export interface DagVisualizerProps {
  execution: ExecutionRun;
}

/**
 * Interactive DAG step node and dependency visualization component.
 */
export function DagVisualizer({ execution }: DagVisualizerProps): React.JSX.Element {
  const steps: ExecutionStepTrace[] = execution.steps ?? [
    {
      stepIndex: 0,
      nodeName: "Ingress Router",
      status: "completed",
      durationMs: 45,
      tokensUsed: 120,
    },
    {
      stepIndex: 1,
      nodeName: "Context Retrieval",
      status: "completed",
      durationMs: 180,
      tokensUsed: 540,
    },
    {
      stepIndex: 2,
      nodeName: "Tool Planner",
      status: "completed",
      durationMs: 310,
      tokensUsed: 920,
    },
    {
      stepIndex: 3,
      nodeName: "Execution Kernel",
      status: execution.status,
      durationMs: 520,
      tokensUsed: 1450,
    },
    { stepIndex: 4, nodeName: "Egress Validator", status: "queued", durationMs: 0, tokensUsed: 0 },
  ];

  const [selectedStep, setSelectedStep] = useState<ExecutionStepTrace>(steps[0]!);
  const [zoom, setZoom] = useState<number>(1);

  const handleZoom = (delta: number): void => {
    setZoom((prev) => Math.min(1.5, Math.max(0.7, Number((prev + delta).toFixed(1)))));
  };

  return (
    <div className="border-border bg-card/60 flex flex-col rounded-md border backdrop-blur">
      {/* Visualizer Header & Zoom Controls */}
      <div className="border-border/60 flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-tight">
            {UI_COPY.EXECUTIONS.DAG.TITLE}
          </span>
          <span className="text-muted-foreground font-mono text-[11px]">
            {UI_COPY.EXECUTIONS.DAG.SUBTITLE(steps.length, Math.round(zoom * 100))}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(0.1)}
            aria-label={UI_COPY.EXECUTIONS.DAG.ZOOM_IN_A11Y}
            title={UI_COPY.EXECUTIONS.DAG.ZOOM_IN_A11Y}
            className="size-7 p-0"
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(-0.1)}
            aria-label={UI_COPY.EXECUTIONS.DAG.ZOOM_OUT_A11Y}
            title={UI_COPY.EXECUTIONS.DAG.ZOOM_OUT_A11Y}
            className="size-7 p-0"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            aria-label={UI_COPY.EXECUTIONS.DAG.RESET_ZOOM_A11Y}
            title={UI_COPY.EXECUTIONS.DAG.RESET_ZOOM_A11Y}
            className="size-7 p-0"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* DAG Flow Canvas */}
      <div className="bg-muted/10 relative min-h-48 overflow-x-auto p-6">
        <div
          className="flex items-center justify-start gap-4 transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "left center" }}
        >
          {steps.map((step, idx) => {
            const isSelected = selectedStep.stepIndex === step.stepIndex;
            const isCompleted = step.status === "completed";
            const isFailed = step.status === "failed";
            const isRunning = step.status === "running";

            return (
              <React.Fragment key={step.stepIndex}>
                {idx > 0 && (
                  <div className="border-muted-foreground/30 flex w-8 items-center border-t-2 border-dashed">
                    <span className="text-muted-foreground/40 -mr-1.5 ml-auto text-[10px]">▶</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStep(step)}
                  className={cn(
                    "bg-card group relative flex min-w-44 cursor-pointer flex-col rounded-md border p-3 text-left transition-all",
                    isSelected
                      ? "border-primary ring-primary/20 ring-2"
                      : "border-border hover:border-primary/50",
                    isCompleted && "border-primary/40",
                    isFailed && "border-destructive/60 bg-destructive/5",
                    isRunning && "border-primary animate-pulse",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {UI_COPY.EXECUTIONS.DAG.STEP_LABEL(step.stepIndex)}
                    </span>
                    {isCompleted && <CheckCircle2 className="text-primary size-3" />}
                    {isFailed && <AlertCircle className="text-destructive size-3" />}
                    {isRunning && <Play className="text-primary size-3 fill-current" />}
                    {!isCompleted && !isFailed && !isRunning && (
                      <Clock className="text-muted-foreground size-3" />
                    )}
                  </div>
                  <span className="text-foreground truncate text-xs font-medium">
                    {step.nodeName}
                  </span>
                  <div className="text-muted-foreground mt-2 flex items-center justify-between font-mono text-[10px]">
                    <span>
                      {step.durationMs ? UI_COPY.EXECUTIONS.DAG.MS_FORMAT(step.durationMs) : "—"}
                    </span>
                    <span>
                      {step.tokensUsed ? UI_COPY.EXECUTIONS.DAG.TOK_FORMAT(step.tokensUsed) : ""}
                    </span>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Forensic Inspector */}
      {selectedStep && (
        <div className="border-border/60 bg-muted/20 border-t p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {UI_COPY.EXECUTIONS.DAG.NODE_DETAILS}{" "}
              <span className="text-primary font-mono">{selectedStep.nodeName}</span>
            </span>
            <span className="text-muted-foreground font-mono text-[11px]">
              {UI_COPY.EXECUTIONS.DAG.STATUS_LABEL}{" "}
              <span className="text-foreground uppercase">{selectedStep.status}</span>
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] sm:grid-cols-4">
            <div className="bg-card border-border/40 rounded border p-2">
              <span className="text-muted-foreground block text-[10px]">
                {UI_COPY.EXECUTIONS.DAG.STEP_INDEX}
              </span>
              <span>{selectedStep.stepIndex}</span>
            </div>
            <div className="bg-card border-border/40 rounded border p-2">
              <span className="text-muted-foreground block text-[10px]">
                {UI_COPY.EXECUTIONS.DAG.LATENCY}
              </span>
              <span>{UI_COPY.EXECUTIONS.DAG.MS_FORMAT(selectedStep.durationMs ?? 0)}</span>
            </div>
            <div className="bg-card border-border/40 rounded border p-2">
              <span className="text-muted-foreground block text-[10px]">
                {UI_COPY.EXECUTIONS.DAG.TOKENS_USED}
              </span>
              <span>{selectedStep.tokensUsed ?? 0}</span>
            </div>
            <div className="bg-card border-border/40 rounded border p-2">
              <span className="text-muted-foreground block text-[10px]">
                {UI_COPY.EXECUTIONS.DAG.ERROR}
              </span>
              <span
                className={selectedStep.errorMessage ? "text-destructive" : "text-muted-foreground"}
              >
                {selectedStep.errorMessage ?? UI_COPY.EXECUTIONS.DAG.NONE}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
