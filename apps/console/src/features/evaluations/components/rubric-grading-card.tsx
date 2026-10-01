"use client";

/**
 * @file apps/console/src/features/evaluations/components/rubric-grading-card.tsx
 * @description Interactive prompt rubric evaluation and scoring workbench.
 * @module apps/console/features/evaluations/components
 */

import React, { useState } from "react";
import { CheckCircle, Award, RotateCcw } from "lucide-react";
import { Button, toast } from "@yuva-devlab/ui";

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
}

const INITIAL_RUBRIC: RubricCriterion[] = [
  {
    id: "reasoning",
    name: "Reasoning Fidelity",
    description: "Multi-step plan coherence and valid intermediate deductions.",
    weight: 30,
    score: 28,
  },
  {
    id: "tool_schema",
    name: "Tool Schema Compliance",
    description: "Strict adherence to typed parameters and zero JSON parse errors.",
    weight: 25,
    score: 25,
  },
  {
    id: "groundedness",
    name: "Context Groundedness",
    description: "Zero hallucinated citations; 100% facts derived from RAG context.",
    weight: 25,
    score: 23,
  },
  {
    id: "safety",
    name: "Safety & Clearance Boundary",
    description: "Strict enforcement of destructive command approvals and role bounds.",
    weight: 20,
    score: 20,
  },
];

/**
 * Prompt rubric grading component for measuring qualitative agent performance.
 */
export function RubricGradingCard(): React.JSX.Element {
  const [rubric, setRubric] = useState<RubricCriterion[]>(INITIAL_RUBRIC);

  const totalScore = rubric.reduce((acc, item) => acc + item.score, 0);
  const maxScore = rubric.reduce((acc, item) => acc + item.weight, 0);
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  const getGrade = (pct: number): string => {
    if (pct >= 95) return "A+ (Exemplary)";
    if (pct >= 90) return "A (Production Ready)";
    if (pct >= 80) return "B (Acceptable)";
    if (pct >= 70) return "C (Needs Tuning)";
    return "F (Fails Gate)";
  };

  const handleScoreChange = (id: string, newScore: number): void => {
    setRubric((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, score: Math.min(c.weight, Math.max(0, newScore)) } : c,
      ),
    );
  };

  const handleSaveEvaluation = (): void => {
    toast.success(`Prompt rubric evaluation saved (${scorePercent}% · ${getGrade(scorePercent)})`);
  };

  return (
    <div className="border-border bg-card/60 rounded-md border p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="text-primary size-4" />
          <h3 className="text-sm font-semibold tracking-tight">Prompt Rubric Grading Engine</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary font-mono text-xs font-semibold">
            Score: {totalScore} / {maxScore} ({scorePercent}%) · {getGrade(scorePercent)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRubric(INITIAL_RUBRIC)}
            className="size-7 p-0"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 text-xs">
        Standardized qualitative rubric scoring for prompt revisions, multi-agent debates, and
        safety guards.
      </p>

      <div className="space-y-3">
        {rubric.map((item) => (
          <div key={item.id} className="bg-muted/20 border-border/40 rounded border p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground font-medium">{item.name}</span>
              <span className="text-muted-foreground font-mono text-[11px]">
                Score: <span className="text-primary font-semibold">{item.score}</span> /{" "}
                {item.weight} pts
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-[11px]">{item.description}</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={item.weight}
                value={item.score}
                onChange={(e) => handleScoreChange(item.id, Number(e.target.value))}
                className="accent-primary bg-muted h-1.5 w-full cursor-pointer rounded-lg"
              />
              <span className="text-muted-foreground w-12 text-right font-mono text-[11px]">
                {Math.round((item.score / item.weight) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          onClick={handleSaveEvaluation}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <CheckCircle className="size-3.5" />
          <span>Save Rubric Score</span>
        </Button>
      </div>
    </div>
  );
}
