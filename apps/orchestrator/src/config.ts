/**
 * @file apps/orchestrator/src/config.ts
 * @description Configuration loader and environment schema for the OrchestrAI Execution Orchestrator.
 * @module apps/orchestrator/config
 */

import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/**
 * Zod schema validating orchestrator configuration.
 */
export const OrchestratorConfigSchema = z.object({
  /** gRPC server port */
  grpcPort: z.coerce.number().int().positive().default(50051),
  /** HTTP health and metrics port */
  httpPort: z.coerce.number().int().positive().default(4004),
  /** Host address for network bindings */
  host: z.string().default("0.0.0.0"),
  /** Execution environment mode */
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  /** Redis connection URL for real-time pub/sub distribution */
  redisUrl: z.string().default("redis://localhost:6379"),
  /** PostgreSQL connection URL for checkpoints and state persistence */
  databaseUrl: z.string().optional(),
  /** Graceful shutdown timeout in milliseconds */
  shutdownTimeoutMs: z.coerce.number().int().positive().default(10000),
});

export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;

/**
 * Loads and validates environment variables into an {@link OrchestratorConfig}.
 *
 * @returns Fully validated orchestrator configuration object
 */
export function loadOrchestratorConfig(): OrchestratorConfig {
  return OrchestratorConfigSchema.parse({
    grpcPort: process.env.ORCHESTRATOR_GRPC_PORT || process.env.GRPC_PORT,
    httpPort: process.env.ORCHESTRATOR_HTTP_PORT || process.env.HTTP_PORT,
    host: process.env.ORCHESTRATOR_HOST || process.env.HOST,
    nodeEnv: process.env.NODE_ENV,
    redisUrl: process.env.REDIS_URL,
    databaseUrl: process.env.DATABASE_URL,
    shutdownTimeoutMs: process.env.SHUTDOWN_TIMEOUT_MS,
  });
}
