/**
 * @file packages/runtime/src/nodes/node.types.ts
 * @description State schema and dependencies for runtime graph execution nodes.
 */

import type {
  AIMessage,
  AgentDefinition,
  ToolCallContentBlock,
  ToolResult,
} from "@orchestrai/core";
import type { ILlmAdapter } from "@orchestrai/models";
import type { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ToolRegistry } from "@orchestrai/tools";

/**
 * Mutable state payload flowing through the runtime DAG nodes.
 */
export interface RuntimeGraphState extends Record<string, unknown> {
  /** Execution run identifier */
  readonly executionId: string;

  /** Full configuration of the executing agent */
  readonly agent: AgentDefinition;

  /** Complete conversation history (user, assistant, tool results) */
  readonly history: readonly AIMessage[];

  /** Ephemeral context variables dictionary */
  readonly contextVariables: Readonly<Record<string, unknown>>;

  /** In-flight tool calls extracted from the latest model response */
  readonly pendingToolCalls?: readonly ToolCallContentBlock[];

  /** Outcomes of tools executed during the most recent step */
  readonly lastToolResults?: readonly ToolResult[];

  /** Active approval request ID blocking execution if HITL is triggered */
  readonly pendingApprovalId?: string;

  /** Whether the workflow has reached completion or forced termination */
  readonly isTerminated?: boolean;

  /** Diagnostic error message if a node failed */
  readonly error?: string;
}

import type { IApprovalStorage, ApprovalPolicyEngine } from "@/hitl";

/**
 * Injected dependencies provided to runtime node factories.
 */
export interface RuntimeNodeDependencies {
  readonly adapter: ILlmAdapter;
  readonly tools: ToolRegistry;
  readonly clearance?: ToolPermissionLevel;
  readonly workspaceRoot?: string;
  readonly approvalStorage?: IApprovalStorage;
  readonly approvalPolicy?: ApprovalPolicyEngine;
}
