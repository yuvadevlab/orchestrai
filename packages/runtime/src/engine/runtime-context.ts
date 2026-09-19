/**
 * @file packages/runtime/src/engine/runtime-context.ts
 * @description Configuration context and dependencies for the OrchestrAIRuntime engine.
 */

import type { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ICheckpointer, IPersistentCheckpointer } from "@/checkpoint";
import type { IApprovalStorage, ApprovalPolicyEngine } from "@/hitl";
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

  /** Storage adapter managing HITL approval tickets and state */
  readonly approvalStorage?: IApprovalStorage;

  /** Policy engine governing human approval risk tiers and timeouts */
  readonly approvalPolicy?: ApprovalPolicyEngine;
}
