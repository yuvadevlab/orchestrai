/**
 * @file packages/core/src/agents/agent-mode.schema.ts
 * @description Operational modes dictating how an agent plans, calls tools, and executes.
 */

import { z } from "zod";
import { AgentMode } from "@orchestrai/shared-types";

/**
 * Supported execution modes for an agent backed by canonical AgentMode enum.
 */
export const AgentModeSchema = z
  .nativeEnum(AgentMode)
  .describe("Operating mode governing agent autonomy and execution strategy");

/**
 * Configuration metadata describing behavioral bounds for each agent mode.
 */
export interface AgentModeMetadata {
  readonly mode: AgentMode;
  readonly description: string;
  readonly allowsAutonomousToolCalls: boolean;
  readonly requiresPreExecutionPlan: boolean;
  readonly defaultMaxSteps: number;
}

/**
 * Immutable lookup table detailing constraints for each AgentMode.
 */
export const AGENT_MODE_CONFIG: Readonly<Record<AgentMode, AgentModeMetadata>> = {
  [AgentMode.CHAT]: {
    mode: AgentMode.CHAT,
    description: "Interactive conversational mode with minimal tool usage",
    allowsAutonomousToolCalls: false,
    requiresPreExecutionPlan: false,
    defaultMaxSteps: 5,
  },
  [AgentMode.PLAN]: {
    mode: AgentMode.PLAN,
    description: "Deconstructs high-level goals into step-by-step execution DAGs",
    allowsAutonomousToolCalls: false,
    requiresPreExecutionPlan: true,
    defaultMaxSteps: 10,
  },
  [AgentMode.ACT]: {
    mode: AgentMode.ACT,
    description: "Autonomous tool execution loop with active safety limits",
    allowsAutonomousToolCalls: true,
    requiresPreExecutionPlan: false,
    defaultMaxSteps: 25,
  },
  [AgentMode.AUTO]: {
    mode: AgentMode.AUTO,
    description: "Adaptive orchestrator that plans, delegates, executes, and verifies",
    allowsAutonomousToolCalls: true,
    requiresPreExecutionPlan: true,
    defaultMaxSteps: 50,
  },
};
