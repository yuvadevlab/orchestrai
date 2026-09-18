/**
 * @file packages/agent/src/loop/agent-runner.ts
 * @description Multi-step continuous execution runner for autonomous agent loops.
 */

import type { AIMessage } from "@orchestrai/core";
import type { AgentLoop } from "./agent-loop";
import type { StepOutcome } from "./step-result.types";
import { createToolResultMessage } from "./tool-message-converter";

/**
 * Result of executing multiple agent loop steps until halt.
 */
export interface AgentRunResult {
  readonly history: readonly AIMessage[];
  readonly finalOutcome: StepOutcome;
  readonly totalTurns: number;
}

/**
 * Runs sequential loop steps continuously until HALTED, WAITING_FOR_APPROVAL, or ERROR.
 *
 * @param loop - The instantiated AgentLoop controller.
 * @param initialHistory - Starting conversation messages.
 * @param maxTurns - Maximum allowable reasoning rounds before circuit break (default: 10).
 * @returns Result with accumulated message history and final outcome status.
 */
export async function runAgentUntilHalt(
  loop: AgentLoop,
  initialHistory: readonly AIMessage[],
  maxTurns = 10,
): Promise<AgentRunResult> {
  const currentHistory: AIMessage[] = [...initialHistory];
  let turns = 0;
  let finalOutcome: StepOutcome = "CONTINUE";

  while (turns < maxTurns) {
    turns += 1;
    const stepResult = await loop.step(currentHistory);

    if (stepResult.assistantMessage) {
      currentHistory.push(stepResult.assistantMessage);
    }

    for (const result of stepResult.toolResults) {
      currentHistory.push(createToolResultMessage(result));
    }

    finalOutcome = stepResult.outcome;

    // Terminal or pause state reached
    if (
      stepResult.outcome === "HALTED" ||
      stepResult.outcome === "WAITING_FOR_APPROVAL" ||
      stepResult.outcome === "ERROR"
    ) {
      break;
    }
  }

  return {
    history: currentHistory,
    finalOutcome,
    totalTurns: turns,
  };
}
