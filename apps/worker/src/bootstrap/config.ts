/**
 * @file apps/worker/src/bootstrap/config.ts
 * @description Zod-validated environment configuration schema and loader for the worker process.
 */

import { z } from "zod";
import dotenv from "dotenv";
import { ValidationError, AGENT_EXECUTION_DEFAULTS } from "@orchestrai/core";

// Load local environment variables from .env file if present
dotenv.config();

/**
 * Worker application environment configuration schema.
 */
export const WorkerConfigSchema = z.object({
  /** Redis connection URL string (e.g., redis://localhost:6379) */
  redisUrl: z.string().optional(),
  /** Redis host address fallback */
  redisHost: z.string().default("localhost"),
  /** Redis port fallback */
  redisPort: z.coerce.number().int().positive().default(6379),
  /** Optional Redis auth password */
  redisPassword: z.string().optional(),
  /** Redis database index (0-15) */
  redisDb: z.coerce.number().int().min(0).max(15).default(0),

  /** Maximum parallel agent execution runs processed concurrently */
  agentConcurrency: z.coerce.number().int().positive().default(5),
  /** Maximum parallel detached tool execution tasks processed concurrently */
  toolConcurrency: z.coerce.number().int().positive().default(10),
  /** Maximum parallel maintenance/DLQ tasks processed concurrently */
  maintenanceConcurrency: z.coerce.number().int().positive().default(2),

  /** Unique instance identifier for this worker process in metrics and logs */
  workerId: z
    .string()
    .min(1)
    .default(() => `worker-${Math.random().toString(36).slice(2, 10)}`),

  /** Logging verbosity level */
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),

  /** Maximum milliseconds to wait for active jobs to complete during graceful shutdown */
  gracefulShutdownTimeoutMs: z.coerce.number().int().positive().default(15_000),

  /** Default application-wide LLM Provider configured via environment */
  defaultModelProvider: z.string().default(process.env.DEFAULT_MODEL_PROVIDER || "ollama"),
  /** Default application-wide LLM Model configured via environment */
  defaultModelName: z.string().default(process.env.DEFAULT_MODEL_NAME || "qwen2.5:7b"),
  /** Default sampling temperature for worker-orchestrated agents */
  defaultAgentTemperature: z.coerce
    .number()
    .min(0)
    .max(2)
    .default(
      process.env.DEFAULT_AGENT_TEMPERATURE
        ? Number(process.env.DEFAULT_AGENT_TEMPERATURE)
        : AGENT_EXECUTION_DEFAULTS.DEFAULT_TEMPERATURE,
    ),
  /** Default max steps for worker-orchestrated agents */
  defaultMaxSteps: z.coerce
    .number()
    .int()
    .positive()
    .default(
      process.env.DEFAULT_MAX_AGENT_STEPS
        ? Number(process.env.DEFAULT_MAX_AGENT_STEPS)
        : AGENT_EXECUTION_DEFAULTS.DEFAULT_MAX_STEPS,
    ),
  /** Default context window size for fallback model adapters */
  defaultContextWindow: z.coerce
    .number()
    .int()
    .positive()
    .default(
      process.env.DEFAULT_CONTEXT_WINDOW
        ? Number(process.env.DEFAULT_CONTEXT_WINDOW)
        : AGENT_EXECUTION_DEFAULTS.DEFAULT_CONTEXT_WINDOW,
    ),
  /** Default max output tokens for fallback model adapters */
  defaultMaxOutputTokens: z.coerce
    .number()
    .int()
    .positive()
    .default(
      process.env.DEFAULT_MAX_OUTPUT_TOKENS
        ? Number(process.env.DEFAULT_MAX_OUTPUT_TOKENS)
        : AGENT_EXECUTION_DEFAULTS.DEFAULT_MAX_OUTPUT_TOKENS,
    ),
});

export type WorkerConfig = z.infer<typeof WorkerConfigSchema>;

/**
 * Parses and validates environment variables into a strongly-typed WorkerConfig.
 *
 * @param env - Source environment dictionary (defaults to process.env).
 * @returns Validated WorkerConfig object.
 */
export function loadWorkerConfig(env: NodeJS.ProcessEnv = process.env): WorkerConfig {
  const parsed = WorkerConfigSchema.safeParse({
    redisUrl: env.REDIS_URL,
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    redisPassword: env.REDIS_PASSWORD,
    redisDb: env.REDIS_DB,
    agentConcurrency: env.AGENT_CONCURRENCY,
    toolConcurrency: env.TOOL_CONCURRENCY,
    maintenanceConcurrency: env.MAINTENANCE_CONCURRENCY,
    workerId: env.WORKER_ID,
    logLevel: env.LOG_LEVEL,
    gracefulShutdownTimeoutMs: env.GRACEFUL_SHUTDOWN_TIMEOUT_MS,
    defaultModelProvider: env.DEFAULT_MODEL_PROVIDER,
    defaultModelName: env.DEFAULT_MODEL_NAME,
    defaultAgentTemperature: env.DEFAULT_AGENT_TEMPERATURE,
    defaultMaxSteps: env.DEFAULT_MAX_AGENT_STEPS,
    defaultContextWindow: env.DEFAULT_CONTEXT_WINDOW,
    defaultMaxOutputTokens: env.DEFAULT_MAX_OUTPUT_TOKENS,
  });

  // Guard against invalid configuration and provide clear diagnostics
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new ValidationError(`Invalid worker configuration: ${errorDetails}`, parsed.error.issues);
  }

  return parsed.data;
}
