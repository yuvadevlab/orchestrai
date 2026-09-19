/**
 * @file packages/agent/src/modes/enforcement/mode-constraint-enforcer.ts
 * @description Intercepts proposed tool calls and enforces agent mode capability bounds.
 *
 * ─── Core Invariant ─────────────────────────────────────────────────
 * "The LLM proposes behavior; the application enforces permissions and mode constraints."
 * Mode is not a security boundary by itself; authorization remains authoritative.
 * However, the application guarantees that an agent cannot exceed the operational
 * scope dictated by its mode (e.g. executing destructive mutations in CHAT or PLAN).
 * ───────────────────────────────────────────────────────────────────
 */

import { AgentMode, ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ITool } from "@orchestrai/tools";
import type { ModeCheckResult, ModeEnforcerOptions } from "./mode-constraint.types";

/**
 * Enforces operational bounds and tool filtering according to active agent mode.
 */
export class ModeConstraintEnforcer {
  private readonly strictChatNoTools: boolean;

  constructor(options?: ModeEnforcerOptions) {
    this.strictChatNoTools = options?.strictChatNoTools ?? true;
  }

  /**
   * Evaluates whether a proposed tool execution is permitted under the specified mode.
   *
   * @param mode - The currently active operational AgentMode.
   * @param tool - The tool instance proposed by the LLM.
   * @returns ModeCheckResult detailing whether execution is allowed and why.
   */
  public evaluate(mode: AgentMode, tool: ITool): ModeCheckResult {
    const perm = tool.definition.permissionLevel;
    const toolName = tool.definition.name;

    switch (mode) {
      case AgentMode.CHAT: {
        // Guard: In strict CHAT mode, no tool execution is permitted (pure dialogue)
        if (this.strictChatNoTools) {
          return {
            allowed: false,
            mode,
            toolName,
            toolPermissionLevel: perm,
            rejectionReason: `Tool execution forbidden: CHAT mode permits no side-effects or external tool calls.`,
          };
        }

        // Non-strict CHAT: only allow READ_ONLY tools (zero external side-effects)
        if (perm !== ToolPermissionLevel.READ_ONLY) {
          return {
            allowed: false,
            mode,
            toolName,
            toolPermissionLevel: perm,
            rejectionReason: `Tool execution forbidden: CHAT mode only permits READ_ONLY tools, but "${toolName}" requires ${perm}.`,
          };
        }

        return { allowed: true, mode, toolName, toolPermissionLevel: perm };
      }

      case AgentMode.PLAN: {
        // Guard: PLAN mode allows reconnaissance/inspection, but forbids mutations
        if (perm !== ToolPermissionLevel.READ_ONLY) {
          return {
            allowed: false,
            mode,
            toolName,
            toolPermissionLevel: perm,
            rejectionReason: `Tool execution forbidden: PLAN mode is restricted to READ_ONLY exploration. "${toolName}" requires ${perm}. Defer mutations to ACT mode.`,
          };
        }

        return { allowed: true, mode, toolName, toolPermissionLevel: perm };
      }

      case AgentMode.ACT: {
        // ACT mode permits mutations; authorization gates (HITL/sandbox) handle clearance
        return { allowed: true, mode, toolName, toolPermissionLevel: perm };
      }

      case AgentMode.AUTO: {
        // In AUTO mode without an explicit sub-mode, default to permitting tools
        // while relying on downstream authorization and HITL gates
        return { allowed: true, mode, toolName, toolPermissionLevel: perm };
      }

      default: {
        return {
          allowed: false,
          mode,
          toolName,
          toolPermissionLevel: perm,
          rejectionReason: `Unrecognized agent mode: ${mode as string}`,
        };
      }
    }
  }
}
