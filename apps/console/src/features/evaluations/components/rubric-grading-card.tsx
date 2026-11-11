"use client";

/**
 * @file apps/console/src/features/evaluations/components/rubric-grading-card.tsx
 * @description Interactive prompt rubric evaluation and scoring workbench.
 * @module apps/console/features/evaluations/components
 */

import React, { useState } from "react";
import { CheckCircle, Award, RotateCcw } from "lucide-react";
import { Button, toast } from "@orchestrai/ui";
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
    <div
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "color-mix(in oklab, var(--card) 60%, transparent)",
        borderRadius: "var(--radius-md, 0.375rem)",
        padding: "1rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          marginBottom: "0.75rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Award style={{ color: "var(--primary)", width: "1rem", height: "1rem" }} />
          <h3
            style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}
          >
            {UI_COPY.EVALUATIONS.RUBRIC.CARD_TITLE}
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              color: "var(--primary)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
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
            style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
          >
            <RotateCcw style={{ width: "0.875rem", height: "0.875rem" }} />
          </Button>
        </div>
      </div>

      <p
        style={{
          color: "var(--mutedForeground)",
          marginBottom: "1rem",
          fontSize: "0.75rem",
          marginInline: 0,
        }}
      >
        {UI_COPY.EVALUATIONS.RUBRIC.CARD_DESC}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {rubric.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
              border: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
              borderRadius: "var(--radius-sm, 0.25rem)",
              padding: "0.625rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.75rem",
              }}
            >
              <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{item.name}</span>
              <span
                style={{
                  color: "var(--mutedForeground)",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6875rem",
                }}
              >
                {UI_COPY.EVALUATIONS.RUBRIC.POINTS_LABEL(item.score, item.weight)}
              </span>
            </div>
            <p
              style={{
                color: "var(--mutedForeground)",
                marginTop: "0.125rem",
                fontSize: "0.6875rem",
                marginInline: 0,
                marginBottom: 0,
              }}
            >
              {item.description}
            </p>
            <div
              style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <input
                type="range"
                min={0}
                max={item.weight}
                value={item.score}
                onChange={(e) => handleScoreChange(item.id, Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "0.375rem",
                  cursor: "pointer",
                  accentColor: "var(--primary)",
                }}
              />
              <span
                style={{
                  color: "var(--mutedForeground)",
                  width: "3rem",
                  textAlign: "right",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.6875rem",
                }}
              >
                {Math.round((item.score / item.weight) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <Button
          size="sm"
          onClick={handleSaveEvaluation}
          style={{ height: "2rem", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 500 }}
        >
          <CheckCircle style={{ width: "0.875rem", height: "0.875rem" }} />
          <span>{UI_COPY.EVALUATIONS.RUBRIC.SAVE_BUTTON}</span>
        </Button>
      </div>
    </div>
  );
}
