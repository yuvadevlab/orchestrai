"use client";

/**
 * @file studio-plan-card.tsx
 * @description Interactive execution plan checklist with progress bar.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { CheckCircle2, Circle, ListTodo, Loader2 } from "lucide-react";
import { PlanStepStatus } from "@orchestrai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";
import type { PlanStep } from "../types";

export interface StudioPlanCardProps {
  steps: PlanStep[];
}

/**
 * Visual plan checklist representing decomposed tasks and milestones.
 */
export function StudioPlanCard({ steps }: StudioPlanCardProps): React.JSX.Element {
  if (!steps || steps.length === 0) return <></>;

  const completedCount = steps.filter((s) => s.status === PlanStepStatus.COMPLETED).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="orch-plan-card">
      <div
        className="orch-flex-row orch-justify-between"
        style={{
          alignItems: "center",
          marginBottom: "0.625rem",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
        }}
      >
        <div
          className="orch-flex-row orch-gap-xs"
          style={{ alignItems: "center", fontWeight: 600 }}
        >
          <ListTodo className="orch-text-primary" style={{ width: "1rem", height: "1rem" }} />
          <span>{UI_COPY.STUDIO.PLAN.TITLE}</span>
        </div>
        <span className="orch-text-muted" style={{ fontSize: "0.6875rem" }}>
          {UI_COPY.STUDIO.PLAN.PROGRESS(completedCount, steps.length, progressPercent)}
        </span>
      </div>

      <div className="orch-plan-track">
        <div className="orch-plan-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.75rem",
        }}
      >
        {steps.map((step, idx) => {
          const isDone = step.status === PlanStepStatus.COMPLETED;
          const isRunning = step.status === PlanStepStatus.RUNNING;

          return (
            <div
              key={step.id || idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                borderRadius: "var(--radius-md, 0.375rem)",
                padding: "0.375rem",
                backgroundColor: isRunning
                  ? "color-mix(in oklab, var(--primary) 10%, transparent)"
                  : "transparent",
                border: isRunning
                  ? "1px solid color-mix(in oklab, var(--primary) 20%, transparent)"
                  : "1px solid transparent",
                color: isRunning ? "var(--primary)" : "inherit",
              }}
            >
              {isDone ? (
                <CheckCircle2
                  className="orch-text-primary"
                  style={{
                    marginTop: "0.125rem",
                    width: "0.875rem",
                    height: "0.875rem",
                    flexShrink: 0,
                  }}
                />
              ) : isRunning ? (
                <Loader2
                  className="orch-text-primary"
                  style={{
                    marginTop: "0.125rem",
                    width: "0.875rem",
                    height: "0.875rem",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Circle
                  className="orch-text-muted"
                  style={{
                    marginTop: "0.125rem",
                    width: "0.875rem",
                    height: "0.875rem",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 500,
                    textDecoration: isDone ? "line-through" : "none",
                    color: isDone ? "var(--mutedForeground)" : "inherit",
                  }}
                >
                  {step.title}
                </p>
                {step.detail && (
                  <p
                    className="orch-text-muted"
                    style={{
                      margin: 0,
                      marginTop: "0.125rem",
                      fontSize: "0.6875rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
