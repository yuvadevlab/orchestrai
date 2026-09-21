/**
 * @file packages/sdk/src/types/client-options.ts
 * @description Client initialization configuration options and defaults.
 */

import type { CostBudgetOptions } from "./security.types";

/**
 * Configuration options required to instantiate an OrchestrAIClient.
 */
export interface OrchestrAIClientOptions {
  /**
   * Root URL of the OrchestrAI Gateway.
   * @default "http://localhost:8000"
   */
  baseUrl?: string;

  /**
   * Root URL of the OrchestrAI Realtime streaming server.
   * @default "http://localhost:8001"
   */
  realtimeUrl?: string;

  /**
   * Multi-tenant partition identifier.
   * @default "default-tenant"
   */
  tenantId?: string;

  /**
   * Enterprise Client ID for HMAC authentication.
   */
  clientId?: string;

  /**
   * Enterprise Client Secret for HMAC request signing.
   */
  clientSecret?: string;

  /**
   * Static API Key for single-key authentication.
   */
  apiKey?: string;

  /**
   * Bearer token for JWT authentication.
   */
  token?: string;

  /**
   * Default execution budget guards applied to all agent dispatches.
   */
  defaultBudget?: CostBudgetOptions;

  /**
   * Request timeout in milliseconds.
   * @default 30000 (30 seconds)
   */
  timeoutMs?: number;

  /**
   * Maximum automated retry attempts for transient errors (429, 503, 504).
   * @default 3
   */
  maxRetries?: number;

  /**
   * Additional HTTP headers included in every outbound request.
   */
  customHeaders?: Record<string, string>;
}
