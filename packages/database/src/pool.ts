/**
 * @file packages/database/src/pool.ts
 * @description Native PostgreSQL connection pool manager with automatic environment discovery and lifecycle control.
 * @module @orchestrai/database
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { DatabaseConfig } from "./types";

const logger = loggerWithConfig(new Logger("DatabasePool"));

let activePool: Pool | null = null;

/**
 * Discovers and loads candidate .env files if DATABASE_URL is not yet defined in process.env.
 */
function ensureEnvironmentLoaded(): void {
  // If already loaded in environment, no action needed
  if (process.env.DATABASE_URL) {
    return;
  }

  const candidatePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), "apps/gateway/.env"),
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
      if (process.env.DATABASE_URL) {
        break;
      }
    }
  }
}

/**
 * Initializes or retrieves the singleton PostgreSQL connection pool.
 *
 * @param config - Optional configuration overrides
 * @returns Initialized pg.Pool instance
 */
export function getOrCreatePool(config: DatabaseConfig = {}): Pool {
  // Return existing pool instance if already created
  if (activePool) {
    return activePool;
  }

  ensureEnvironmentLoaded();

  const connectionString = config.connectionString || process.env.DATABASE_URL;

  // Invariant: Pool requires DATABASE_URL to be defined in .env or config
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL connection string. Please configure DATABASE_URL in your .env file.",
    );
  }

  activePool = new Pool({
    connectionString,
    max: config.maxPoolSize || 20,
    idleTimeoutMillis: config.idleTimeoutMillis || 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
  });

  // Guard against unhandled idle client errors terminating the process
  activePool.on("error", (err) => {
    logger.error("[DatabasePool] Unexpected client error on idle connection", {
      error: err.message,
    });
  });

  logger.info("[DatabasePool] PostgreSQL pool initialized successfully", {
    url: connectionString.replace(/:[^:@]+@/, ":****@"),
  });

  return activePool;
}

/**
 * Gracefully ends all pool connections and drains active queries.
 */
export async function closePool(): Promise<void> {
  // Check if active pool exists before calling end
  if (activePool) {
    logger.info("[DatabasePool] Draining connection pool");
    await activePool.end();
    activePool = null;
  }
}
