"use client";

/**
 * @file studio-plan-card.tsx
 * @description Interactive execution plan checklist with progress bar.
 * @module apps/console/features/studio/components
 */

import React from "react";
import { CheckCircle2, Circle, ListTodo, Loader2 } from "lucide-react";
import type { PlanStep } from "../types";

export interface StudioPlanCardProps {
  steps: PlanStep[];
}

/**
 * Visual plan checklist representing decomposed tasks and milestones.
 */
export function StudioPlanCard({ steps }: StudioPlanCardProps): React.JSX.Element {
  if (!steps || steps.length === 0) return <></>;

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="border-border/80 bg-card/60 my-3 rounded-md border p-3 shadow-xs">
      <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
        <div className="text-foreground flex items-center gap-1.5 font-semibold">
          <ListTodo className="text-primary size-4" />
          <span>Execution Plan</span>
        </div>
        <span className="text-muted-foreground text-[11px]">
          {completedCount}/{steps.length} Tasks ({progressPercent}%)
        </span>
      </div>

      <div className="bg-muted/50 mb-3 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-1.5 font-mono text-xs">
        {steps.map((step, idx) => {
          const isDone = step.status === "completed";
          const isRunning = step.status === "running";

          return (
            <div
              key={step.id || idx}
              className={`flex items-start gap-2 rounded-md p-1.5 transition-colors ${
                isRunning
                  ? "bg-primary/10 border-primary/20 text-primary border"
                  : "text-foreground"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="text-primary mt-0.5 size-3.5 shrink-0" />
              ) : isRunning ? (
                <Loader2 className="text-primary mt-0.5 size-3.5 shrink-0 animate-spin" />
              ) : (
                <Circle className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}>
                  {step.title}
                </p>
                {step.detail && (
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
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
