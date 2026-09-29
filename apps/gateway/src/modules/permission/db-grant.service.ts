/**
 * @file apps/gateway/src/services/db-grant.service.ts
 * @description Database-backed service managing Access Grants, Clearance Requests, and Revocations.
 * @module apps/gateway/services
 */

import { getPrismaClient, type AccessGrant, type PermissionRequest } from "@orchestrai/database";
import {
  PermissionLevel,
  PermissionScope,
  RequestStatus,
  GrantStatus,
  ApprovalRiskLevel,
} from "@orchestrai/shared-types";
import { isResourceContained } from "@orchestrai/core";

/**
 * Service orchestrating persistent database access grants and permission clearance requests.
 */
export class DbGrantService {
  /**
   * Evaluates whether an active AccessGrant covers the target resource URI.
   *
   * @param targetUri - Canonical target URI
   * @param agentId - Requesting agent ID
   * @param userId - Principal user ID
   * @param requiredLevel - Minimum permission tier required
   * @returns Matching AccessGrant or null if unauthorized
   */
  public async findActiveGrant(
    targetUri: string,
    agentId?: string,
    userId?: string,
    requiredLevel: PermissionLevel = PermissionLevel.READ,
  ): Promise<AccessGrant | null> {
    const prisma = getPrismaClient();
    const now = new Date();

    // Query all active grants for the user or agent
    const grants = await prisma.accessGrant.findMany({
      where: {
        status: GrantStatus.ACTIVE,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        AND: [userId ? { userId } : {}, agentId ? { OR: [{ agentId }, { agentId: null }] } : {}],
      },
    });

    // Check hierarchical URI containment and permission level
    for (const grant of grants) {
      if (isResourceContained(grant.resourceUri, targetUri)) {
        // Verify permission tier sufficiency
        if (this.isLevelSufficient(grant.permissionLevel as PermissionLevel, requiredLevel)) {
          return grant;
        }
      }
    }

    return null;
  }

  /**
   * Persists a clearance request awaiting human approval.
   */
  public async createPermissionRequest(data: {
    agentId: string;
    userId: string;
    tenantId?: string;
    conversationId?: string;
    executionId?: string;
    resourceUri: string;
    toolSlug: string;
    reason: string;
    requestedLevel?: PermissionLevel;
    scopeType?: PermissionScope;
    riskLevel?: ApprovalRiskLevel;
  }): Promise<PermissionRequest> {
    const prisma = getPrismaClient();
    return prisma.permissionRequest.create({
      data: {
        agentId: data.agentId,
        userId: data.userId,
        tenantId: data.tenantId ?? null,
        conversationId: data.conversationId ?? null,
        executionId: data.executionId ?? null,
        resourceUri: data.resourceUri,
        toolSlug: data.toolSlug,
        reason: data.reason,
        requestedLevel: data.requestedLevel ?? PermissionLevel.READ,
        scopeType:
          data.scopeType === PermissionScope.ONCE
            ? PermissionScope.ONCE
            : data.scopeType === PermissionScope.PERMANENT
              ? PermissionScope.PERMANENT
              : PermissionScope.SESSION,
        riskLevel: data.riskLevel ?? ApprovalRiskLevel.CAUTION,
        status: RequestStatus.PENDING,
      },
    });
  }

  /**
   * Records human decision on a clearance request and persists an AccessGrant if approved.
   */
  public async resolvePermissionRequest(
    requestId: string,
    decidedBy: string,
    granted: boolean,
    scope: PermissionScope = PermissionScope.SESSION,
  ): Promise<{ request: PermissionRequest; grant?: AccessGrant }> {
    const prisma = getPrismaClient();
    const now = new Date();

    const request = await prisma.permissionRequest.update({
      where: { requestId },
      data: {
        status: granted ? RequestStatus.APPROVED : RequestStatus.REJECTED,
        decidedBy,
        decidedAt: now,
      },
    });

    if (!granted) {
      return { request };
    }

    // Single-turn requests expire in 5 minutes; session grants expire in 24 hours; permanent grants have no expiry
    const expiresAt =
      scope === PermissionScope.ONCE
        ? new Date(Date.now() + 5 * 60 * 1000)
        : scope === PermissionScope.SESSION
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null;

    const grant = await prisma.accessGrant.create({
      data: {
        requestId: request.requestId,
        agentId: request.agentId,
        userId: request.userId,
        tenantId: request.tenantId,
        conversationId: request.conversationId,
        resourceUri: request.resourceUri,
        toolId: request.toolId,
        permissionLevel: request.requestedLevel,
        scopeType:
          scope === PermissionScope.ONCE
            ? PermissionScope.ONCE
            : scope === PermissionScope.PERMANENT
              ? PermissionScope.PERMANENT
              : PermissionScope.SESSION,
        status: GrantStatus.ACTIVE,
        grantedBy: decidedBy,
        expiresAt,
      },
    });

    return { request, grant };
  }

  /**
   * Revokes an existing active grant immediately.
   */
  public async revokeGrant(grantId: string, revokedBy: string): Promise<AccessGrant> {
    const prisma = getPrismaClient();
    return prisma.accessGrant.update({
      where: { grantId },
      data: {
        status: GrantStatus.REVOKED,
        revokedBy,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Verifies if a granted permission level satisfies the requested level requirement.
   */
  private isLevelSufficient(granted: PermissionLevel, required: PermissionLevel): boolean {
    const hierarchy: Record<PermissionLevel, number> = {
      [PermissionLevel.READ]: 1,
      [PermissionLevel.WRITE]: 2,
      [PermissionLevel.EXECUTE]: 3,
      [PermissionLevel.ADMIN]: 4,
    };
    return (hierarchy[granted] ?? 0) >= (hierarchy[required] ?? 0);
  }
}

export const dbGrantService = new DbGrantService();
