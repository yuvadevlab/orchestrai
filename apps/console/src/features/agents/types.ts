/**
 * Agent execution status state.
 */
export enum AgentStatus {
  ACTIVE = "active",
  IDLE = "idle",
  PAUSED = "paused",
  DRAINING = "draining",
}

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
