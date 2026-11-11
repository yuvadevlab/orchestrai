"use client";

/**
 * @file apps/console/src/features/executions/components/checkpoint-replayer.tsx
 * @description Historical checkpoint timeline scrubber and state replayer for execution runs.
 * @module apps/console/features/executions/components
 */

import React, { useState, useEffect } from "react";
import { History, Play, Pause, SkipBack, SkipForward, RotateCw } from "lucide-react";
import { Button, toast } from "@orchestrai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { ExecutionRun } from "../types";

export interface CheckpointReplayerProps {
  execution: ExecutionRun;
}

interface CheckpointState {
  index: number;
  label: string;
  timestamp: string;
  variables: Record<string, string | number>;
  status: string;
}

/**
 * Checkpoint timeline scrubber enabling forensic step rollback and replay.
 */
export function CheckpointReplayer({ execution }: CheckpointReplayerProps): React.JSX.Element {
  const checkpoints: CheckpointState[] = [
    {
      index: 0,
      label: "Initial Graph Ingress",
      timestamp: "10:14:02.120",
      variables: { intent: execution.intent, memoryAllocatedKb: 64, activeStep: 0 },
      status: "initialized",
    },
    {
      index: 1,
      label: "Context Vectors Hydrated",
      timestamp: "10:14:02.300",
      variables: { ragDocsRetrieved: 3, topKScore: 0.94, memoryAllocatedKb: 128 },
      status: "context_loaded",
    },
    {
      index: 2,
      label: "Planner Tool Selected",
      timestamp: "10:14:02.610",
      variables: { toolCandidate: "query_database", clearanceRequired: 0, memoryAllocatedKb: 192 },
      status: "tool_planned",
    },
    {
      index: 3,
      label: "Kernel Invocation Complete",
      timestamp: "10:14:03.130",
      variables: { kernelOutputSize: 1042, exitCode: 0, memoryAllocatedKb: 256 },
      status: execution.status,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(checkpoints.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeCheckpoint = checkpoints[currentIndex] ?? checkpoints[0]!;

  // Handle auto-advance playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= checkpoints.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, checkpoints.length]);

  const handleForkCheckpoint = (): void => {
    toast.success(
      UI_COPY.EXECUTIONS.REPLAYER.TOAST_FORK(activeCheckpoint.index, activeCheckpoint.label),
    );
  };

  return (
    <div className="orch-replayer">
      {/* Header and Controls */}
      <div className="orch-replayer-header">
        <div className="orch-flex-row orch-gap-sm">
          <History className="orch-text-primary" style={{ width: "1rem", height: "1rem" }} />
          <h3
            className="orch-font-semibold"
            style={{ fontSize: "0.875rem", letterSpacing: "-0.01em" }}
          >
            {UI_COPY.EXECUTIONS.REPLAYER.TITLE}
          </h3>
        </div>

        <div className="orch-flex-row orch-gap-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            aria-label={UI_COPY.EXECUTIONS.REPLAYER.A11Y_PREV}
            style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
          >
            <SkipBack style={{ width: "0.75rem", height: "0.75rem" }} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="orch-font-mono"
            style={{ height: "1.75rem", padding: "0 0.5rem", fontSize: "0.75rem" }}
          >
            {isPlaying ? (
              <Pause style={{ width: "0.75rem", height: "0.75rem", marginRight: "0.25rem" }} />
            ) : (
              <Play
                style={{
                  width: "0.75rem",
                  height: "0.75rem",
                  marginRight: "0.25rem",
                  fill: "currentColor",
                }}
              />
            )}
            {isPlaying ? UI_COPY.EXECUTIONS.REPLAYER.PAUSE : UI_COPY.EXECUTIONS.REPLAYER.PLAY}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.min(checkpoints.length - 1, prev + 1))}
            disabled={currentIndex === checkpoints.length - 1}
            aria-label={UI_COPY.EXECUTIONS.REPLAYER.A11Y_NEXT}
            style={{ width: "1.75rem", height: "1.75rem", padding: 0 }}
          >
            <SkipForward style={{ width: "0.75rem", height: "0.75rem" }} />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleForkCheckpoint}
            className="orch-font-mono"
            style={{ height: "1.75rem", gap: "0.25rem", padding: "0 0.5rem", fontSize: "0.75rem" }}
          >
            <RotateCw style={{ width: "0.75rem", height: "0.75rem" }} />
            <span>{UI_COPY.EXECUTIONS.REPLAYER.FORK_HERE}</span>
          </Button>
        </div>
      </div>

      {/* Scrubbing Slider & Step Indicators */}
      <div style={{ margin: "1rem 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div
          className="orch-flex-row orch-justify-between orch-text-muted orch-font-mono"
          style={{ fontSize: "0.6875rem" }}
        >
          <span>
            {UI_COPY.EXECUTIONS.REPLAYER.STEP_LABEL(currentIndex + 1, checkpoints.length)}
          </span>
          <span>{activeCheckpoint.timestamp}</span>
        </div>
        <input
          type="range"
          min={0}
          max={checkpoints.length - 1}
          value={currentIndex}
          aria-label={UI_COPY.EXECUTIONS.REPLAYER.A11Y_SLIDER}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentIndex(Number(e.target.value));
          }}
          style={{ width: "100%", cursor: "pointer", accentColor: "var(--primary)" }}
        />
        <div
          className="orch-flex-row orch-justify-between orch-text-muted orch-font-mono"
          style={{ fontSize: "0.625rem" }}
        >
          {checkpoints.map((cp, idx) => (
            <button
              key={cp.index}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(idx);
              }}
              style={{
                cursor: "pointer",
                background: "none",
                border: "none",
                color: idx === currentIndex ? "var(--primary)" : "inherit",
                fontWeight: idx === currentIndex ? 700 : 400,
                font: "inherit",
              }}
            >
              #{cp.index}
            </button>
          ))}
        </div>
      </div>

      {/* State Snapshot Card */}
      <div className="orch-replayer-snapshot">
        <div
          className="orch-flex-row orch-justify-between"
          style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}
        >
          <span className="orch-font-semibold">{activeCheckpoint.label}</span>
          <span
            className="orch-text-primary orch-font-mono"
            style={{ fontSize: "0.6875rem", textTransform: "uppercase" }}
          >
            {activeCheckpoint.status}
          </span>
        </div>
        <pre className="orch-replayer-snapshot-pre">
          {JSON.stringify(activeCheckpoint.variables, null, 2)}
        </pre>
      </div>
    </div>
  );
}
