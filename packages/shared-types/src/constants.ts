/**
 * @file packages/shared-types/src/constants.ts
 * @description System-wide constant values, network ports, timeouts, and default limits.
 */

/**
 * Standard network ports for OrchestrAI applications in local development.
 */
export const DEFAULT_PORTS = {
  /** Ingress API Gateway (Port 4000 reserved for FinAI) */
  GATEWAY: 4001,
  /** Realtime WebSocket / SSE streamer */
  REALTIME: 4002,
  /** Background Worker Engine diagnostics */
  WORKER: 4003,
  /** Operator Console Web UI (Port 3000 reserved for FinAI) */
  CONSOLE: 3001,
  /** Local Ollama Model Server */
  OLLAMA: 11434,
  /** PostgreSQL with pgvector */
  POSTGRES: 5432,
  /** Redis cache and BullMQ broker */
  REDIS: 6379,
} as const;

/**
 * Default execution limits and timeout thresholds in milliseconds.
 */
export const EXECUTION_LIMITS = {
  /** Default execution timeout (5 minutes) */
  DEFAULT_TIMEOUT_MS: 300_000,
  /** Default per-tool execution timeout (30 seconds) */
  DEFAULT_TOOL_TIMEOUT_MS: 30_000,
  /** Default human approval timeout window (10 minutes) */
  DEFAULT_APPROVAL_TIMEOUT_MS: 600_000,
  /** Maximum loop steps permitted for an agent execution run */
  DEFAULT_MAX_STEPS: 25,
  /** Maximum consecutive identical actions before loop detector triggers */
  MAX_CONSECUTIVE_IDENTICAL_ACTIONS: 3,
  /** Maximum allowed context window tokens (fallback) */
  DEFAULT_CONTEXT_WINDOW_TOKENS: 8192,
} as const;

/**
 * BullMQ background job queue identifiers.
 */
export const QUEUE_NAMES = {
  /** Primary queue for agent executions */
  AGENT_EXECUTION: "orchestrai:agent-execution",
  /** Queue for deferred or long-running tool calls */
  TOOL_EXECUTION: "orchestrai:tool-execution",
  /** Dead-letter queue for exhausted retry attempts */
  DEAD_LETTER: "orchestrai:dead-letter",
} as const;

/**
 * Redis Pub/Sub channels.
 */
export const PUBSUB_CHANNELS = {
  /** Execution lifecycle event stream */
  EXECUTION_EVENTS: "orchestrai:events:execution",
  /** Realtime token stream channel prefix (appended with executionId) */
  EXECUTION_STREAM_PREFIX: "orchestrai:stream:",
} as const;
