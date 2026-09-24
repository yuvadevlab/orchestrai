/**
 * @file api-client.ts
 * @description Singleton SDK client connecting Console UI to Gateway REST/SSE endpoints.
 * @module apps/console/lib
 */

import { createOrchestrAIClient, type OrchestrAIClient } from "@orchestrai/sdk";
import { getStoredSession } from "./auth";

/** Gateway base URL configured from environment variable or default local port 4001 */
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4001";

/** Cached client instance keyed by active token + tenant */
let clientInstance: OrchestrAIClient | null = null;
let currentTokenKey: string | null = null;

/**
 * Returns singleton OrchestrAI SDK Client configured for Gateway communication with active user auth.
 *
 * @returns Configured OrchestrAIClient instance.
 */
export function getApiClient(): OrchestrAIClient {
  const session = getStoredSession();
  const token = session?.token;
  const tenantId = session?.user?.tenantId;
  const tokenKey = `${token || ""}:${tenantId || ""}`;

  // If session changed or client instance not initialized, recreate client
  if (!clientInstance || currentTokenKey !== tokenKey) {
    currentTokenKey = tokenKey;
    clientInstance = createOrchestrAIClient({
      baseUrl: GATEWAY_URL,
      realtimeUrl: GATEWAY_URL,
      apiKey: token ? undefined : process.env.NEXT_PUBLIC_GATEWAY_API_KEY,
      token: token || undefined,
      tenantId,
      timeoutMs: 15_000,
    });
  }
  return clientInstance;
}
