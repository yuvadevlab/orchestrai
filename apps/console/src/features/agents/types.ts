/**
 * Agent execution status state.
 */
export type AgentStatus = "ACTIVE" | "IDLE" | "PAUSED" | "DRAINING";

/**
 * Autonomous agent entity definition.
 */
export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  tools: string[];
  description: string;
  totalExecutions: number;
  successRate: number;
  averageLatencyMs: number;
}
