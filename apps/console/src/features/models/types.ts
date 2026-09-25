/**
 * @file apps/console/src/features/models/types.ts
 * @description Type definitions for LLM providers, models, and routing catalog.
 * Uses shared-types as the single source of truth.
 * @module apps/console/features/models
 */

import type { LlmModelRecord, LlmProviderRecord } from "@orchestrai/shared-types";

export type LlmProvider = LlmProviderRecord;
export type LlmModel = LlmModelRecord;

/** Model health status state. */
export type ModelStatus = "ONLINE" | "DEGRADED" | "OFFLINE";

/** Model routing definition entity. */
export interface ModelDefinition {
  id: string;
  provider: string;
  status: ModelStatus;
  cost: string;
  latency: string;
  contextWindow?: string;
  isDefault?: boolean;
}
