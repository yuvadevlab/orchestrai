/**
 * @file packages/agent/src/loop/step-tool-executor.ts
 * @description Evaluates and dispatches tool calls with mode constraints, loop guards, and HITL gates.
 */

import crypto from "node:crypto";
import {
  ToolResultStatus,
  type AgentMode,
  type ToolPermissionLevel,
} from "@orchestrai/shared-types";
import {
  requiresHumanApproval,
  type ToolCallContentBlock,
  type ToolResult,
} from "@orchestrai/core";
import { executeTool, type ToolRegistry } from "@orchestrai/tools";
import type { AgentStateMachine } from "@/state";
import type { ModeConstraintEnforcer } from "@/modes";
import type { PendingApprovalInfo } from "./step-result.types";

/**
 * Options required to execute a batch of tool calls within an agent step.
 */
export interface StepToolExecutionParams {
  readonly calls: readonly ToolCallContentBlock[];
  readonly tools: ToolRegistry;
  readonly state: AgentStateMachine;
  readonly activeMode: AgentMode;
  readonly modeEnforcer: ModeConstraintEnforcer;
  readonly clearance: ToolPermissionLevel;
  readonly workspaceRoot?: string;
}

/**
 * Outcome of executing tool calls in a step.
 */
export interface StepToolExecutionOutcome {
  readonly toolResults: ToolResult[];
  readonly pendingApproval?: PendingApprovalInfo;
  readonly error?: string;
  readonly halted?: boolean;
}

/**
 * Iterates through proposed tool calls, verifying mode constraints, registries, and approvals.
 */
export async function executeStepToolCalls(
  params: StepToolExecutionParams,
): Promise<StepToolExecutionOutcome> {
  const toolResults: ToolResult[] = [];

  for (const call of params.calls) {
    // 1. Loop detection: Guard against infinite repeated identical invocations
    const isLoop = params.state.recordAction(call.toolName, call.arguments);
    if (isLoop) {
      return {
        toolResults,
        halted: true,
        error: `Infinite loop detected: agent invoked "${call.toolName}" repeatedly with identical arguments`,
      };
    }

    // 2. Registry verification: Tool must exist in current registry
    const tool = params.tools.get(call.toolName);
    if (!tool) {
      toolResults.push({
        callId: call.callId,
        toolName: call.toolName,
        status: ToolResultStatus.ERROR,
        error: `Tool "${call.toolName}" is not registered or available`,
        durationMs: 0,
        timestamp: new Date(),
      });
      continue;
    }

    // 3. Mode constraint enforcement: Validate tool clearance in active mode
    const modeCheck = params.modeEnforcer.evaluate(params.activeMode, tool);
    if (!modeCheck.allowed) {
      toolResults.push({
        callId: call.callId,
        toolName: call.toolName,
        status: ToolResultStatus.ERROR,
        error: modeCheck.rejectionReason ?? `Tool forbidden in ${params.activeMode} mode`,
        durationMs: 0,
        timestamp: new Date(),
      });
      continue;
    }

    // 4. Human-in-the-Loop gate: Check if tool requires clearance approval
    if (requiresHumanApproval(tool.definition.permissionLevel)) {
      const approvalId = crypto.randomUUID();
      params.state.setPendingApproval(approvalId);

      return {
        toolResults,
        pendingApproval: {
          approvalId,
          toolName: call.toolName,
          arguments: call.arguments,
          riskLevel: tool.definition.permissionLevel,
        },
      };
    }

    // 5. Sandboxed execution
    const result = await executeTool(tool, call.callId, call.arguments, {
      agentClearance: params.clearance,
      context: {
        executionId: params.state.snapshot().executionId,
        agentId: params.state.snapshot().agentId,
        workspaceRoot: params.workspaceRoot,
      },
    });

    toolResults.push(result);
  }

  return { toolResults };
}
