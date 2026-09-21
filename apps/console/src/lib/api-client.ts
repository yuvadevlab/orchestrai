/**
 * @file api-client.ts
 * @description Singleton SDK client connecting Console UI to Gateway REST/SSE endpoints.
 * @module apps/console/lib
 */

import { createOrchestrAIClient, type OrchestrAIClient } from "@orchestrai/sdk";

/** Gateway base URL configured from environment variable or default local port 8000 */
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8000";

/** Singleton client instance */
let clientInstance: OrchestrAIClient | null = null;

/**
 * Returns singleton OrchestrAI SDK Client configured for Gateway communication.
 *
 * @returns Configured OrchestrAIClient instance.
 */
export function getApiClient(): OrchestrAIClient {
  if (!clientInstance) {
    clientInstance = createOrchestrAIClient({
      baseUrl: GATEWAY_URL,
      apiKey: process.env.NEXT_PUBLIC_GATEWAY_API_KEY || "dev-key",
      timeoutMs: 15_000,
    });
  }
  return clientInstance;
}
