/**
 * @file packages/database/src/client.ts
 * @description Lazy-initialized singleton PrismaClient manager with PostgreSQL driver adapter and connection pooling.
 * @module @orchestrai/database
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getOrCreatePool } from "./pool";

declare global {
  var orchestraiPrisma: PrismaClient | undefined;
}

/**
 * Creates or retrieves the singleton PrismaClient instance connected via pg.Pool driver adapter.
 *
 * @returns Configured PrismaClient instance
 */
export function getPrismaClient(): PrismaClient {
  if (globalThis.orchestraiPrisma) {
    return globalThis.orchestraiPrisma;
  }

  const pool = getOrCreatePool();
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({ adapter });

  // Cache client on global object in non-production environments to avoid hot-reload connection exhaustion
  if (process.env.NODE_ENV !== "production") {
    globalThis.orchestraiPrisma = client;
  }

  return client;
}

/**
 * Lazy proxy wrapping singleton PrismaClient instance.
 * Defers connection pool creation until the first database operation is invoked.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export * from "@prisma/client";
export { PrismaClient };
