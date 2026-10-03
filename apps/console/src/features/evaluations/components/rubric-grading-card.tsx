"use client";

/**
 * @file apps/console/src/features/evaluations/components/rubric-grading-card.tsx
 * @description Interactive prompt rubric evaluation and scoring workbench.
 * @module apps/console/features/evaluations/components
 */

import React, { useState } from "react";
import { CheckCircle, Award, RotateCcw } from "lucide-react";
import { Button, toast } from "@yuva-devlab/ui";
import { UI_COPY } from "@/lib/ui-copy";

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
    name: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.REASONING_NAME,
    description: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.REASONING_DESC,
    weight: 30,
    score: 28,
  },
  {
    id: "tool_schema",
    name: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.TOOL_SCHEMA_NAME,
    description: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.TOOL_SCHEMA_DESC,
    weight: 25,
    score: 25,
  },
  {
    id: "groundedness",
    name: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.GROUNDEDNESS_NAME,
    description: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.GROUNDEDNESS_DESC,
    weight: 25,
    score: 23,
  },
  {
    id: "safety",
    name: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.SAFETY_NAME,
    description: UI_COPY.EVALUATIONS.RUBRIC.CRITERIA.SAFETY_DESC,
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
    if (pct >= 95) return UI_COPY.EVALUATIONS.RUBRIC.GRADES.A_PLUS;
    if (pct >= 90) return UI_COPY.EVALUATIONS.RUBRIC.GRADES.A;
    if (pct >= 80) return UI_COPY.EVALUATIONS.RUBRIC.GRADES.B;
    if (pct >= 70) return UI_COPY.EVALUATIONS.RUBRIC.GRADES.C;
    return UI_COPY.EVALUATIONS.RUBRIC.GRADES.F;
  };

  const handleScoreChange = (id: string, newScore: number): void => {
    setRubric((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, score: Math.min(c.weight, Math.max(0, newScore)) } : c,
      ),
    );
  };

  const handleSaveEvaluation = (): void => {
    toast.success(UI_COPY.EVALUATIONS.RUBRIC.TOAST_SAVED(scorePercent, getGrade(scorePercent)));
  };

  return (
    <div className="border-border bg-card/60 rounded-md border p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="text-primary size-4" />
          <h3 className="text-sm font-semibold tracking-tight">
            {UI_COPY.EVALUATIONS.RUBRIC.CARD_TITLE}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary font-mono text-xs font-semibold">
            {UI_COPY.EVALUATIONS.RUBRIC.SCORE_FORMAT(
              totalScore,
              maxScore,
              scorePercent,
              getGrade(scorePercent),
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRubric(INITIAL_RUBRIC)}
            aria-label={UI_COPY.EVALUATIONS.RUBRIC.RESET_A11Y}
            className="size-7 p-0"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 text-xs">{UI_COPY.EVALUATIONS.RUBRIC.CARD_DESC}</p>

      <div className="space-y-3">
        {rubric.map((item) => (
          <div key={item.id} className="bg-muted/20 border-border/40 rounded border p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground font-medium">{item.name}</span>
              <span className="text-muted-foreground font-mono text-[11px]">
                {UI_COPY.EVALUATIONS.RUBRIC.POINTS_LABEL(item.score, item.weight)}
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
          <span>{UI_COPY.EVALUATIONS.RUBRIC.SAVE_BUTTON}</span>
        </Button>
      </div>
    </div>
  );
}
