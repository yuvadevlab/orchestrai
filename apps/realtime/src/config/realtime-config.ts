/**
 * @file apps/realtime/src/config/realtime-config.ts
 * @description Invariant configuration schema and environment loader for the Realtime broker.
 */

import { z } from "zod";

/**
 * Validates and parses runtime configuration options for the realtime streaming service.
 */
export const RealtimeConfigSchema = z.object({
  /** Port on which the HTTP, SSE, and WebSocket server listens (default: 4002) */
  port: z.coerce.number().int().positive().default(4002),
  /** Network interface to bind (default: 0.0.0.0) */
  host: z.string().default("0.0.0.0"),
  /** Execution environment mode */
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  /** Redis connection URL for cross-node Pub/Sub and stream consumer */
  redisUrl: z.string().url().default("redis://localhost:6379"),
  /** Allowed origins for Cross-Origin Resource Sharing (CORS) */
  corsOrigins: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (typeof val === "string" ? val.split(",").map((s) => s.trim()) : val))
    .default(["http://localhost:3001", "http://localhost:3000"]),
  /** Secret key used to verify client JWT authentication tokens (must be provided via env) */
  jwtSecret: z.string().min(1, "JWT_SECRET environment variable is required"),
  /** Interval in milliseconds for WebSocket dead-connection heartbeat ping frames */
  heartbeatIntervalMs: z.coerce.number().int().positive().default(30_000),
  /** Maximum duration before an unacknowledged client connection is closed */
  clientTimeoutMs: z.coerce.number().int().positive().default(60_000),
  /** Maximum concurrent open client connections (WebSocket + SSE) */
  maxConnections: z.coerce.number().int().positive().default(10_000),
  /** Maximum permissible incoming WebSocket message payload size in bytes (64KB) */
  maxPayloadBytes: z.coerce.number().int().positive().default(65_536),
  /** Rate limit window: maximum allowed requests/messages per minute per client */
  rateLimitPerMin: z.coerce.number().int().positive().default(120),
  /** Configurable HTTP header key names */
  tenantHeaderName: z.string().default("x-tenant-id"),
  authHeaderName: z.string().default("authorization"),
  requestIdHeaderName: z.string().default("x-request-id"),
});

export type RealtimeConfig = z.infer<typeof RealtimeConfigSchema>;

/**
 * Loads and validates realtime server configuration from environment variables.
 *
 * @param env - Raw environment record (defaults to process.env)
 * @returns Fully validated and typed RealtimeConfig
 */
export function loadRealtimeConfig(
  env: Record<string, string | undefined> = process.env,
): RealtimeConfig {
  return RealtimeConfigSchema.parse({
    port: env.PORT ?? env.REALTIME_PORT ?? 4002,
    host: env.HOST ?? "0.0.0.0",
    nodeEnv: env.NODE_ENV ?? "development",
    redisUrl: env.REDIS_URL ?? "redis://localhost:6379",
    corsOrigins: env.CORS_ORIGINS ?? "http://localhost:3001,http://localhost:3000",
    jwtSecret: env.JWT_SECRET,
    heartbeatIntervalMs: env.HEARTBEAT_INTERVAL_MS ?? 30_000,
    clientTimeoutMs: env.CLIENT_TIMEOUT_MS ?? 60_000,
    maxConnections: env.MAX_CONNECTIONS ?? 10_000,
    maxPayloadBytes: env.MAX_PAYLOAD_BYTES ?? 65_536,
    rateLimitPerMin: env.RATE_LIMIT_PER_MIN ?? 120,
    tenantHeaderName: env.TENANT_HEADER_NAME ?? "x-tenant-id",
    authHeaderName: env.AUTH_HEADER_NAME ?? "authorization",
    requestIdHeaderName: env.REQUEST_ID_HEADER_NAME ?? "x-request-id",
  });
}
