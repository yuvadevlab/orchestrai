import React from "react";
import { Badge, Button } from "@yuva-devlab/ui";
import { Play, RotateCcw } from "lucide-react";
import type { ConsoleTelemetry } from "../types";

export interface ConsoleHeaderProps {
  telemetry: ConsoleTelemetry;
  isRunning: boolean;
  onReset: () => void;
  onTriggerRun: () => void;
}

/**
 * Top operational summary header for the agent execution console.
 *
 * @param props.telemetry - Live metrics snapshot.
 * @param props.isRunning - Boolean indicating if an execution is actively streaming.
 * @param props.onReset - Callback to reset execution events.
 * @param props.onTriggerRun - Callback to trigger the agent DAG.
 */
export function ConsoleHeader({
  telemetry,
  isRunning,
  onReset,
  onTriggerRun,
}: ConsoleHeaderProps): React.JSX.Element {
  return (
    <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-xl font-bold tracking-tight">Agent Execution Console</h1>
          <Badge
            variant={isRunning ? "default" : "outline"}
            className="px-2 py-0.5 font-mono text-xs font-semibold"
          >
            {isRunning ? "PROCESSING" : "IDLE"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          Direct, observe, and trace autonomous agents as they plan and execute DAG steps.
        </p>
      </div>

      {/* Telemetry Numbers & Action */}
      <div className="flex items-center gap-3">
        <div className="border-border bg-card/50 hidden items-center gap-4 rounded-md border px-3 py-1.5 font-mono text-xs md:flex">
          <div>
            <span className="text-muted-foreground">Agents: </span>
            <span className="text-foreground font-semibold">{telemetry.activeAgents}</span>
          </div>
          <div className="bg-border h-3 w-px" />
          <div>
            <span className="text-muted-foreground">Tokens: </span>
            <span className="text-foreground font-semibold">
              {(telemetry.tokensProcessed / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="bg-border h-3 w-px" />
          <div>
            <span className="text-muted-foreground">Avg Latency: </span>
            <span className="text-primary font-semibold">{telemetry.averageLatencyMs}ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={isRunning}
            className="h-8 gap-1 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onTriggerRun}
            disabled={isRunning}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Play className="size-3.5" />
            <span>Execute DAG</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
