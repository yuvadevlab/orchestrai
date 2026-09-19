/**
 * @file packages/runtime/src/engine/runtime-context.ts
 * @description Configuration context and dependencies for the OrchestrAIRuntime engine.
 */

import type { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ICheckpointer, IPersistentCheckpointer } from "@/checkpoint";
import type { RuntimeGraphState } from "@/nodes";

/**
 * Top-level configuration options for the OrchestrAIRuntime engine.
 */
export interface RuntimeEngineConfig {
  /** Checkpointer used for durable state snapshots and resumption */
  readonly checkpointer?:
    IPersistentCheckpointer<RuntimeGraphState> | ICheckpointer<RuntimeGraphState>;

  /** Default tool permission clearance level (defaults to READ_ONLY) */
  readonly defaultClearance?: ToolPermissionLevel;

  /** Permitted sandbox filesystem boundary directory */
  readonly workspaceRoot?: string;
}
