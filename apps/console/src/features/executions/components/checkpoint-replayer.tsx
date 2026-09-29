"use client";

/**
 * @file apps/console/src/features/executions/components/checkpoint-replayer.tsx
 * @description Historical checkpoint timeline scrubber and state replayer for execution runs.
 * @module apps/console/features/executions/components
 */

import React, { useState, useEffect } from "react";
import { History, Play, Pause, SkipBack, SkipForward, RotateCw } from "lucide-react";
import { Button, toast } from "@yuva-devlab/ui";
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
      `Replaying execution from checkpoint #${activeCheckpoint.index}: "${activeCheckpoint.label}"`,
    );
  };

  return (
    <div className="border-border bg-card/60 flex flex-col rounded-md border p-4 backdrop-blur">
      {/* Header and Controls */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <History className="text-primary size-4" />
          <h3 className="text-sm font-semibold tracking-tight">Checkpoint Time-Travel Replayer</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="size-7 p-0"
          >
            <SkipBack className="size-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-7 px-2 font-mono text-xs"
          >
            {isPlaying ? (
              <Pause className="mr-1 size-3" />
            ) : (
              <Play className="mr-1 size-3 fill-current" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.min(checkpoints.length - 1, prev + 1))}
            disabled={currentIndex === checkpoints.length - 1}
            className="size-7 p-0"
          >
            <SkipForward className="size-3" />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleForkCheckpoint}
            className="h-7 gap-1 px-2 font-mono text-xs"
          >
            <RotateCw className="size-3" />
            <span>Fork Here</span>
          </Button>
        </div>
      </div>

      {/* Scrubbing Slider & Step Indicators */}
      <div className="my-4 space-y-2">
        <div className="text-muted-foreground flex items-center justify-between font-mono text-[11px]">
          <span>
            Checkpoint {currentIndex + 1} of {checkpoints.length}
          </span>
          <span>{activeCheckpoint.timestamp}</span>
        </div>
        <input
          type="range"
          min={0}
          max={checkpoints.length - 1}
          value={currentIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentIndex(Number(e.target.value));
          }}
          className="accent-primary w-full cursor-pointer"
        />
        <div className="text-muted-foreground flex justify-between font-mono text-[10px]">
          {checkpoints.map((cp, idx) => (
            <button
              key={cp.index}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(idx);
              }}
              className={`cursor-pointer transition-colors ${
                idx === currentIndex ? "text-primary font-bold" : "hover:text-foreground"
              }`}
            >
              #{cp.index}
            </button>
          ))}
        </div>
      </div>

      {/* State Snapshot Card */}
      <div className="bg-muted/30 border-border/60 rounded border p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-foreground font-semibold">{activeCheckpoint.label}</span>
          <span className="text-primary font-mono text-[11px] uppercase">
            {activeCheckpoint.status}
          </span>
        </div>
        <pre className="text-muted-foreground bg-card overflow-x-auto rounded p-2 font-mono text-[11px] leading-relaxed">
          {JSON.stringify(activeCheckpoint.variables, null, 2)}
        </pre>
      </div>
    </div>
  );
}
