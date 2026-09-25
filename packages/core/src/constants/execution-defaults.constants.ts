/**
 * @file packages/core/src/constants/execution-defaults.constants.ts
 * @description Centralized, reusable execution hyperparameters, limits, and system defaults.
 */

/**
 * Global default execution hyperparameters and safety bounds for autonomous agents.
 */
export const AGENT_EXECUTION_DEFAULTS = {
  /** Standard sampling temperature for balanced creativity and reasoning */
  DEFAULT_TEMPERATURE: 0.7,
  /** Deterministic sampling temperature for coding and exact syntax tasks */
  DETERMINISTIC_TEMPERATURE: 0.1,
  /** Low-variance sampling temperature for factual research and retrieval */
  FACTUAL_TEMPERATURE: 0.2,
  /** Maximum autonomous execution loop steps before stopping runaway tasks */
  DEFAULT_MAX_STEPS: 20,
  /** Default token budget per output completion */
  DEFAULT_MAX_OUTPUT_TOKENS: 2048,
  /** Default context window size in tokens */
  DEFAULT_CONTEXT_WINDOW: 8192,
  /** Default per-request execution timeout in milliseconds */
  DEFAULT_TIMEOUT_MS: 30_000,
  /** Default rate limit window duration in milliseconds */
  DEFAULT_RATE_LIMIT_WINDOW_MS: 60_000,
  /** Default maximum requests permitted per rate limit window */
  DEFAULT_RATE_LIMIT_MAX_REQUESTS: 120,
} as const;

/**
 * Type representing the structured agent execution defaults.
 */
export type AgentExecutionDefaults = typeof AGENT_EXECUTION_DEFAULTS;
