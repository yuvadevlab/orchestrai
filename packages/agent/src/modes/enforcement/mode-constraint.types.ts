/**
 * @file packages/agent/src/modes/enforcement/mode-constraint.types.ts
 * @description Types and contracts for mode capability validation and constraint checking.
 */

import type { AgentMode, ToolPermissionLevel } from "@orchestrai/shared-types";

/**
 * Result of evaluating a proposed tool call against the active agent mode.
 */
export interface ModeCheckResult {
  /** Whether the tool execution is permitted in the current mode */
  readonly allowed: boolean;
  /** Active agent mode that evaluated the constraint */
  readonly mode: AgentMode;
  /** Name of the tool subject to evaluation */
  readonly toolName: string;
  /** Assessed permission level of the proposed tool */
  readonly toolPermissionLevel: ToolPermissionLevel;
  /** Rejection reason explaining why the mode forbids this tool call */
  readonly rejectionReason?: string;
}

/**
 * Configuration options governing mode constraint enforcement.
 */
export interface ModeEnforcerOptions {
  /**
   * When true, completely forbids ALL tool calls in CHAT mode,
   * even READ_ONLY tools. Defaults to true.
   */
  readonly strictChatNoTools?: boolean;
}
