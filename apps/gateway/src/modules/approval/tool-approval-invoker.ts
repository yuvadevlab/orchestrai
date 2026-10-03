/**
 * @file apps/gateway/src/services/tool-approval-invoker.ts
 * @description Manages tool invocation safety gates, approval interception, and access audit logging.
 * @module apps/gateway/services
 */

import path from "node:path";
import {
  ExecutionStatus,
  PermissionLevel,
  SseStreamEvent,
  WorkspaceTool,
} from "@orchestrai/shared-types";
import {
  executeWorkspaceTool,
  resolveMonorepoRoot,
} from "@/modules/streaming/autonomous-agent-runner";
import {
  permissionPolicyManager,
  resourceRegistryService,
  resourceAccessLogger,
} from "@/modules/permission";
import { harnessSkillRegistry } from "@/modules/harness";
import type { ExecutionStreamState } from "@/modules/streaming/live-execution-broadcaster";

/**
 * Handles a single tool execution with HITL approval gate check and audit trail logging.
 *
 * @param executionId - Active execution identifier
 * @param sessionId - Active conversation/session identifier
 * @param toolCall - Tool name and arguments to execute
 * @param state - Current stream state
 * @param emitEvent - Event emitter callback
 * @returns Execution output or error message
 */
export async function handleToolInvocationWithApproval(
  executionId: string,
  sessionId: string,
  toolCall: { tool: WorkspaceTool; args: Record<string, unknown> },
  state: ExecutionStreamState,
  emitEvent: (event: string, data: unknown) => void,
): Promise<{ output: unknown; isError: boolean }> {
  const workspaceRoot = harnessSkillRegistry.getWorkspaceRoot() || resolveMonorepoRoot();
  const perm = permissionPolicyManager.checkPermission(toolCall.tool, toolCall.args, sessionId);
  const canonical = resourceRegistryService.canonicalizeTarget(
    String(toolCall.args.path || toolCall.args.command || ""),
    toolCall.tool,
    workspaceRoot,
  );

  // 1. Direct execution if tool action is pre-authorized
  if (perm.allowed) {
    void resourceAccessLogger.logAccess({
      agentId: executionId,
      conversationId: sessionId,
      executionId,
      resourceUri: canonical.uri,
      toolSlug: toolCall.tool,
      action: "execute",
      permissionLevel:
        toolCall.tool === WorkspaceTool.BASH ? PermissionLevel.EXECUTE : PermissionLevel.READ,
      decision: "allowed",
    });

    return executeWorkspaceTool(
      toolCall.tool,
      toolCall.args,
      perm.effectiveRoot,
      perm.effectiveRoots,
    );
  }

  // 2. Halt execution step and wait for human clearance
  state.status = ExecutionStatus.WAITING_FOR_APPROVAL;
  const { request, promise } = permissionPolicyManager.createApprovalRequest(
    executionId,
    toolCall.tool,
    perm.target || "",
    perm.reason || "Clearance required",
    perm.suggestedPrefix,
    perm.isSensitive,
    perm.riskLevel,
    sessionId,
  );
  state.pendingApproval = request;
  emitEvent(SseStreamEvent.APPROVAL_REQUEST, request);

  const decision = await promise;
  state.pendingApproval = undefined;
  state.status = ExecutionStatus.RUNNING;

  if (!decision.granted) {
    void resourceAccessLogger.logAccess({
      agentId: executionId,
      conversationId: sessionId,
      executionId,
      resourceUri: canonical.uri,
      toolSlug: toolCall.tool,
      action: "execute",
      permissionLevel:
        toolCall.tool === WorkspaceTool.BASH ? PermissionLevel.EXECUTE : PermissionLevel.READ,
      decision: "denied",
      reason: `Denied by user for: ${perm.target}`,
    });

    return { output: `Permission Denied by user for: ${perm.target}`, isError: true };
  }

  const updatedPerm = permissionPolicyManager.checkPermission(
    toolCall.tool,
    toolCall.args,
    sessionId,
  );

  void resourceAccessLogger.logAccess({
    agentId: executionId,
    conversationId: sessionId,
    executionId,
    resourceUri: canonical.uri,
    toolSlug: toolCall.tool,
    action: "execute",
    permissionLevel:
      toolCall.tool === WorkspaceTool.BASH ? PermissionLevel.EXECUTE : PermissionLevel.READ,
    decision: "allowed",
    reason: `Cleared by operator (scope: ${decision.scope})`,
  });

  const targetRoot = updatedPerm.effectiveRoot || perm.suggestedPrefix || perm.effectiveRoot;
  const combinedRoots = Array.from(
    new Set([
      workspaceRoot,
      ...(updatedPerm.effectiveRoots || []),
      targetRoot,
      perm.suggestedPrefix,
      perm.effectiveRoot,
      perm.target ? path.dirname(perm.target) : undefined,
    ]),
  ).filter((r): r is string => typeof r === "string" && r.length > 0);

  return executeWorkspaceTool(
    toolCall.tool,
    toolCall.args,
    targetRoot || workspaceRoot,
    combinedRoots,
  );
}
