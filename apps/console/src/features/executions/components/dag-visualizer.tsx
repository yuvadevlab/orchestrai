"use client";

/**
 * @file apps/console/src/features/executions/components/dag-visualizer.tsx
 * @description Interactive DAG visualizer displaying execution node graph, dependencies, and step states.
 * @module apps/console/features/executions/components
 */

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, CheckCircle2, AlertCircle, Clock, Play } from "lucide-react";
import { Button } from "@orchestrai/ui";
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
    <div className="orch-dag-card">
      {/* Visualizer Header & Zoom Controls */}
      <div className="orch-dag-header">
        <div className="orch-flex-row orch-gap-sm">
          <span
            className="orch-font-semibold"
            style={{ fontSize: "0.75rem", letterSpacing: "-0.01em" }}
          >
            {UI_COPY.EXECUTIONS.DAG.TITLE}
          </span>
          <span className="orch-text-muted orch-font-mono" style={{ fontSize: "0.6875rem" }}>
            {UI_COPY.EXECUTIONS.DAG.SUBTITLE(steps.length, Math.round(zoom * 100))}
          </span>
        </div>
        <div className="orch-flex-row orch-gap-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(0.1)}
            aria-label={UI_COPY.EXECUTIONS.DAG.ZOOM_IN_A11Y}
            title={UI_COPY.EXECUTIONS.DAG.ZOOM_IN_A11Y}
            style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
          >
            <ZoomIn style={{ width: "0.875rem", height: "0.875rem" }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(-0.1)}
            aria-label={UI_COPY.EXECUTIONS.DAG.ZOOM_OUT_A11Y}
            title={UI_COPY.EXECUTIONS.DAG.ZOOM_OUT_A11Y}
            style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
          >
            <ZoomOut style={{ width: "0.875rem", height: "0.875rem" }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            aria-label={UI_COPY.EXECUTIONS.DAG.RESET_ZOOM_A11Y}
            title={UI_COPY.EXECUTIONS.DAG.RESET_ZOOM_A11Y}
            style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
          >
            <RotateCcw style={{ width: "0.875rem", height: "0.875rem" }} />
          </Button>
        </div>
      </div>

      {/* DAG Flow Canvas */}
      <div className="orch-dag-flow">
        <div
          className="orch-flex-row orch-gap-md"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "left center",
            transition: "transform 0.2s ease",
          }}
        >
          {steps.map((step, idx) => {
            const isSelected = selectedStep.stepIndex === step.stepIndex;
            const isCompleted = step.status === "completed";
            const isFailed = step.status === "failed";
            const isRunning = step.status === "running";

            return (
              <React.Fragment key={step.stepIndex}>
                {idx > 0 && (
                  <div className="orch-dag-connector">
                    <span className="orch-dag-connector-arrow">▶</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStep(step)}
                  className={cn(
                    "orch-dag-node",
                    isSelected && "is-selected",
                    isCompleted && "is-completed",
                    isFailed && "is-failed",
                    isRunning && "is-running",
                  )}
                >
                  <div
                    className="orch-flex-row orch-justify-between orch-gap-sm"
                    style={{ marginBottom: "0.25rem" }}
                  >
                    <span
                      className="orch-text-muted orch-font-mono"
                      style={{ fontSize: "0.625rem" }}
                    >
                      {UI_COPY.EXECUTIONS.DAG.STEP_LABEL(step.stepIndex)}
                    </span>
                    {isCompleted && (
                      <CheckCircle2
                        className="orch-text-primary"
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    )}
                    {isFailed && (
                      <AlertCircle
                        className="orch-text-destructive"
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    )}
                    {isRunning && (
                      <Play
                        className="orch-text-primary"
                        style={{ width: "0.75rem", height: "0.75rem", fill: "currentColor" }}
                      />
                    )}
                    {!isCompleted && !isFailed && !isRunning && (
                      <Clock
                        className="orch-text-muted"
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    )}
                  </div>
                  <span className="orch-truncate orch-font-medium" style={{ fontSize: "0.75rem" }}>
                    {step.nodeName}
                  </span>
                  <div
                    className="orch-flex-row orch-justify-between orch-text-muted orch-font-mono"
                    style={{ marginTop: "0.5rem", fontSize: "0.625rem" }}
                  >
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
        <div className="orch-dag-inspector">
          <div className="orch-flex-row orch-justify-between">
            <span className="orch-font-medium">
              {UI_COPY.EXECUTIONS.DAG.NODE_DETAILS}{" "}
              <span className="orch-text-primary orch-font-mono">{selectedStep.nodeName}</span>
            </span>
            <span className="orch-text-muted orch-font-mono" style={{ fontSize: "0.6875rem" }}>
              {UI_COPY.EXECUTIONS.DAG.STATUS_LABEL}{" "}
              <span className="orch-font-semibold" style={{ textTransform: "uppercase" }}>
                {selectedStep.status}
              </span>
            </span>
          </div>
          <div className="orch-dag-inspector-grid">
            <div className="orch-dag-inspector-item">
              <span className="orch-dag-inspector-item-label">
                {UI_COPY.EXECUTIONS.DAG.STEP_INDEX}
              </span>
              <span>{selectedStep.stepIndex}</span>
            </div>
            <div className="orch-dag-inspector-item">
              <span className="orch-dag-inspector-item-label">
                {UI_COPY.EXECUTIONS.DAG.LATENCY}
              </span>
              <span>{UI_COPY.EXECUTIONS.DAG.MS_FORMAT(selectedStep.durationMs ?? 0)}</span>
            </div>
            <div className="orch-dag-inspector-item">
              <span className="orch-dag-inspector-item-label">
                {UI_COPY.EXECUTIONS.DAG.TOKENS_USED}
              </span>
              <span>{selectedStep.tokensUsed ?? 0}</span>
            </div>
            <div className="orch-dag-inspector-item">
              <span className="orch-dag-inspector-item-label">{UI_COPY.EXECUTIONS.DAG.ERROR}</span>
              <span
                className={selectedStep.errorMessage ? "orch-text-destructive" : "orch-text-muted"}
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
