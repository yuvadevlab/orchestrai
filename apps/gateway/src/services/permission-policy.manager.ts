/**
 * @file apps/gateway/src/services/permission-policy.manager.ts
 * @description Multi-Workspace Trust Engine and Human-in-the-Loop permission manager.
 * @module apps/gateway/services
 */

import path from "node:path";
import { randomUUID } from "node:crypto";
import { resolveMonorepoRoot } from "./autonomous-agent-runner";
import {
  findNearestProjectRoot,
  loadPermanentPermissions,
  savePermanentPermissions,
} from "./permission-storage";

export type PermissionScope = "once" | "session" | "permanent" | "deny";

export interface PermissionCheckResult {
  allowed: boolean;
  target?: string;
  reason?: string;
  suggestedPrefix?: string;
  effectiveRoot?: string;
}

export interface ApprovalRequest {
  id: string;
  executionId: string;
  tool: string;
  target: string;
  reason: string;
  suggestedPrefix?: string;
  createdAt: string;
}

export interface ApprovalDecision {
  scope: PermissionScope;
  granted: boolean;
  decidedBy?: string;
}

interface PendingApproval {
  request: ApprovalRequest;
  resolve: (decision: ApprovalDecision) => void;
  reject: (err: Error) => void;
}

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
   * Checks whether a tool operation is permitted under active trust grants.
   */
  public checkPermission(
    toolName: string,
    args: Record<string, unknown>,
    sessionId: string = "default",
  ): PermissionCheckResult {
    const workspaceRoot = resolveMonorepoRoot();

    if (toolName === "bash") {
      const commandStr = String(args.command || "command");
      const sessionSet = this.sessionGrants.get(sessionId);
      const isAllowed =
        this.onceGrants.has("tool:bash") ||
        this.onceGrants.has(commandStr) ||
        Boolean(sessionSet?.has("tool:bash")) ||
        Boolean(sessionSet?.has(commandStr)) ||
        this.permanentGrants.has("tool:bash") ||
        this.permanentGrants.has(commandStr);

      if (this.onceGrants.has("tool:bash")) this.onceGrants.delete("tool:bash");
      if (this.onceGrants.has(commandStr)) this.onceGrants.delete(commandStr);

      let effectiveRoot = workspaceRoot;
      for (const perm of this.permanentGrants) {
        if (commandStr.includes(perm)) {
          effectiveRoot = perm;
          break;
        }
      }
      if (sessionSet && effectiveRoot === workspaceRoot) {
        for (const sess of sessionSet) {
          if (commandStr.includes(sess)) {
            effectiveRoot = sess;
            break;
          }
        }
      }

      if (!isAllowed) {
        return {
          allowed: false,
          target: commandStr,
          reason: "Shell command execution requires operator clearance.",
          suggestedPrefix: effectiveRoot,
        };
      }
      return { allowed: true, effectiveRoot };
    }

    const targetPath = String(args.path || "");
    if (!targetPath) return { allowed: true, effectiveRoot: workspaceRoot };

    const resolved = path.isAbsolute(targetPath)
      ? path.resolve(targetPath)
      : path.resolve(workspaceRoot, targetPath);

    // 1. Primary workspace containment
    if (resolved.startsWith(workspaceRoot)) {
      return { allowed: true, effectiveRoot: workspaceRoot };
    }

    // 2. Single-turn temporary clearance
    if (this.onceGrants.has(resolved)) {
      this.onceGrants.delete(resolved);
      return { allowed: true, effectiveRoot: findNearestProjectRoot(resolved) };
    }

    // 3. Permanent trusted workspace roots
    for (const perm of this.permanentGrants) {
      if (resolved.startsWith(perm)) {
        return { allowed: true, effectiveRoot: perm };
      }
    }

    // 4. Session trusted workspace roots
    const sessionSet = this.sessionGrants.get(sessionId);
    if (sessionSet) {
      for (const sess of sessionSet) {
        if (resolved.startsWith(sess)) {
          return { allowed: true, effectiveRoot: sess };
        }
      }
    }

    const suggestedPrefix = findNearestProjectRoot(resolved);
    return {
      allowed: false,
      target: resolved,
      suggestedPrefix,
      reason: `Path is outside trusted workspaces. Nearest project: ${path.basename(suggestedPrefix)}`,
    };
  }

  public createApprovalRequest(
    executionId: string,
    tool: string,
    target: string,
    reason: string,
    suggestedPrefix?: string,
  ): { request: ApprovalRequest; promise: Promise<ApprovalDecision> } {
    const id = randomUUID();
    const request: ApprovalRequest = {
      id,
      executionId,
      tool,
      target,
      reason,
      suggestedPrefix,
      createdAt: new Date().toISOString(),
    };

    const promise = new Promise<ApprovalDecision>((resolve, reject) => {
      this.pendingApprovals.set(id, { request, resolve, reject });
    });

    return { request, promise };
  }

  public resolveApproval(
    approvalId: string,
    scope: PermissionScope,
    sessionId: string = "default",
    decidedBy?: string,
  ): boolean {
    const pending = this.pendingApprovals.get(approvalId);
    if (!pending) return false;

    const granted = scope !== "deny";
    const target = pending.request.target;
    const prefix = pending.request.suggestedPrefix || target;
    const isBash = pending.request.tool === "bash";

    const targetSession = sessionId !== "default" ? sessionId : pending.request.executionId;
    if (granted) {
      if (isBash) {
        if (scope === "once") {
          this.onceGrants.add("tool:bash");
          this.onceGrants.add(target);
        } else if (scope === "session") {
          for (const s of [sessionId, targetSession, pending.request.executionId]) {
            if (!this.sessionGrants.has(s)) this.sessionGrants.set(s, new Set());
            this.sessionGrants.get(s)?.add("tool:bash");
            this.sessionGrants.get(s)?.add(target);
          }
        } else if (scope === "permanent") {
          this.permanentGrants.add("tool:bash");
          this.permanentGrants.add(target);
          savePermanentPermissions(this.configPath, this.permanentGrants);
        }
      } else {
        if (scope === "once") {
          this.onceGrants.add(target);
        } else if (scope === "session") {
          for (const s of [sessionId, targetSession, pending.request.executionId]) {
            if (!this.sessionGrants.has(s)) this.sessionGrants.set(s, new Set());
            this.sessionGrants.get(s)?.add(prefix);
          }
        } else if (scope === "permanent") {
          this.permanentGrants.add(prefix);
          savePermanentPermissions(this.configPath, this.permanentGrants);
        }
      }
    }

    pending.resolve({ scope, granted, decidedBy });
    this.pendingApprovals.delete(approvalId);
    return true;
  }
}

export const permissionPolicyManager = new PermissionPolicyManager();
