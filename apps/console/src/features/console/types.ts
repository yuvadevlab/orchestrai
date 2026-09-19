/**
 * Demo preset scenarios available for instant execution in the Console.
 */
export type DemoType = "research" | "developer" | "multi";

/**
 * Execution step event emitted during an agent DAG run.
 */
export interface ExecutionEvent {
  id: string;
  agent: string;
  title: string;
  detail: string;
  meta: string;
  type: "think" | "plan" | "search" | "web" | "file" | "database" | "delegate" | "model";
}

/**
 * Pre-packaged demo scenario specification.
 */
export interface DemoScenario {
  label: string;
  prompt: string;
  response: string;
  events: ExecutionEvent[];
}

/**
 * Live operational telemetry summary.
 */
export interface ConsoleTelemetry {
  activeAgents: number;
  tokensProcessed: number;
  averageLatencyMs: number;
  successRate: number;
}
