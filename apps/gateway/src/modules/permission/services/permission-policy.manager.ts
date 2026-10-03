/**
 * @file apps/gateway/src/services/permission-policy.manager.ts
 * @description Multi-Workspace Trust Engine and Human-in-the-Loop permission manager.
 * @module apps/gateway/services
 */

import path from "node:path";
import { randomUUID } from "node:crypto";
import { resolveMonorepoRoot } from "@/modules/streaming/autonomous-agent-runner";
import { applyGrant, loadPermanentPermissions } from "../storage/permission-storage";
import { evaluateToolPermission } from "./permission-evaluator";
import { resourceRegistryService } from "./resource-registry.service";
import { resourceAccessLogger } from "./resource-access-logger";
import {
  PermissionLevel,
  ApprovalRiskLevel,
  PermissionScope,
  WorkspaceTool,
} from "@orchestrai/shared-types";
import type {
  ApprovalDecision,
  ApprovalRequest,
  PendingApproval,
  PermissionCheckResult,
} from "../storage/permission-types";

export * from "../storage/permission-types";

/**
 * Multi-Workspace Trust Engine managing repository trust lists, session capability grants, and HITL promises.
 */
class PermissionPolicyManager {
  private readonly onceGrants = new Set<string>();
  private readonly sessionGrants = new Map<string, Set<string>>();
  private readonly permanentGrants: Set<string>;
  private readonly pendingApprovals = new Map<string, PendingApproval>();
  private readonly configPath: string;

  constructor() {
    const root = resolveMonorepoRoot();
    this.configPath = path.join(root, ".orchestrai", "permissions.json");
    this.permanentGrants = loadPermanentPermissions(this.configPath);
  }

  /**
   * Checks whether a tool operation is permitted under active trust grants and security policies.
   */
  public checkPermission(
    toolName: string,
    args: Record<string, unknown>,
    sessionId: string = "default",
  ): PermissionCheckResult {
    const workspaceRoot = resolveMonorepoRoot();
    const sessionSet = this.sessionGrants.get(sessionId);

    return evaluateToolPermission({
      toolName,
      args,
      workspaceRoot,
      onceGrants: this.onceGrants,
      sessionSet,
      permanentGrants: this.permanentGrants,
    });
  }

  /**
   * Creates a pending human-in-the-loop approval request for an unauthorized resource action.
   */
  public createApprovalRequest(
    executionId: string,
    tool: string,
    target: string,
    reason: string,
    suggestedPrefix?: string,
    isSensitive?: boolean,
    riskLevel?: ApprovalRiskLevel,
    sessionId?: string,
  ): { request: ApprovalRequest; promise: Promise<ApprovalDecision> } {
    const id = randomUUID();
    const request: ApprovalRequest = {
      id,
      executionId,
      sessionId,
      tool,
      target,
      reason,
      suggestedPrefix,
      isSensitive,
      riskLevel,
      createdAt: new Date().toISOString(),
    };

    const promise = new Promise<ApprovalDecision>((resolve, reject) => {
      this.pendingApprovals.set(id, { request, resolve, reject });
    });

    return { request, promise };
  }

  /**
   * Retrieves all pending approval requests.
   */
  public getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.pendingApprovals.values()).map((p) => p.request);
  }

  /**
   * Resolves a pending human-in-the-loop clearance request and updates in-memory and database grants.
   */
  public resolveApproval(
    approvalId: string,
    scope: PermissionScope,
    sessionId: string = "default",
    decidedBy?: string,
  ): boolean {
    const pending = this.pendingApprovals.get(approvalId);
    if (!pending) return false;

    const granted = scope !== PermissionScope.DENY;
    const target = pending.request.target;
    const prefix = pending.request.suggestedPrefix || target;
    const isBash = pending.request.tool === WorkspaceTool.BASH;

    const sessionKeys = Array.from(
      new Set(
        [sessionId, pending.request.sessionId, pending.request.executionId, "default"].filter(
          (s): s is string => typeof s === "string" && s.length > 0,
        ),
      ),
    );

    if (granted) {
      applyGrant(
        scope,
        isBash,
        target,
        prefix,
        sessionKeys,
        this.onceGrants,
        this.sessionGrants,
        this.permanentGrants,
        this.configPath,
      );

      // Asynchronously mirror grant in database registry and resource logs
      const workspaceRoot = resolveMonorepoRoot();
      const canonical = resourceRegistryService.canonicalizeTarget(
        target,
        pending.request.tool,
        workspaceRoot,
      );
      void resourceRegistryService.getOrCreateResource(
        canonical.uri,
        canonical.type,
        canonical.name,
      );
      void resourceAccessLogger.logAccess({
        agentId: pending.request.executionId,
        conversationId: pending.request.sessionId || sessionId,
        executionId: pending.request.executionId,
        resourceUri: canonical.uri,
        toolSlug: pending.request.tool,
        action: "approval_decision",
        permissionLevel: isBash ? PermissionLevel.EXECUTE : PermissionLevel.READ,
        decision: "allowed",
        reason: `Granted via HITL with scope: ${scope}`,
      });
    }

    pending.resolve({ scope, granted, decidedBy });
    this.pendingApprovals.delete(approvalId);
    return true;
  }
}

export const permissionPolicyManager = new PermissionPolicyManager();
