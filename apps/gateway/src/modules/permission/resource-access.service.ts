/**
 * @file apps/gateway/src/services/resource-access.service.ts
 * @description Service for querying resources, active grants, clearance requests, and capabilities.
 * @module apps/gateway/services
 */

import {
  getPrismaClient,
  type Resource,
  type AccessGrant,
  type PermissionRequest,
  type Capability,
} from "@orchestrai/database";
import { GrantStatus, PermissionScope } from "@orchestrai/shared-types";
import { permissionPolicyManager } from "@/modules/permission/permission-policy.manager";
import { dbGrantService } from "@/modules/permission/db-grant.service";

/**
 * Service providing query and resolution access for resources, grants, and capabilities.
 */
export class ResourceAccessService {
  /**
   * Retrieves all registered platform resources, optionally filtered by type or tenant.
   */
  public async listResources(tenantId?: string): Promise<Resource[]> {
    const prisma = getPrismaClient();
    return prisma.resource.findMany({
      where: tenantId ? { OR: [{ tenantId }, { tenantId: null }] } : {},
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves active access grants for a user or tenant.
   */
  public async listGrants(userId?: string, tenantId?: string): Promise<AccessGrant[]> {
    const prisma = getPrismaClient();
    return prisma.accessGrant.findMany({
      where: {
        status: GrantStatus.ACTIVE,
        AND: [userId ? { userId } : {}, tenantId ? { OR: [{ tenantId }, { tenantId: null }] } : {}],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Revokes an active grant by ID.
   */
  public async revokeGrant(grantId: string, revokedBy: string): Promise<AccessGrant> {
    return dbGrantService.revokeGrant(grantId, revokedBy);
  }

  /**
   * Retrieves permission clearance requests.
   */
  public async listRequests(userId?: string, tenantId?: string): Promise<PermissionRequest[]> {
    const prisma = getPrismaClient();
    return prisma.permissionRequest.findMany({
      where: {
        AND: [userId ? { userId } : {}, tenantId ? { OR: [{ tenantId }, { tenantId: null }] } : {}],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  /**
   * Decides a pending permission request (approved/rejected).
   */
  public async decideRequest(params: {
    requestId: string;
    decidedBy: string;
    granted: boolean;
    scope?: PermissionScope;
    sessionId?: string;
  }): Promise<{ request: PermissionRequest; grant?: AccessGrant }> {
    // 1. Resolve in-memory HITL promise first if execution is waiting
    permissionPolicyManager.resolveApproval(
      params.requestId,
      params.granted ? (params.scope ?? PermissionScope.SESSION) : PermissionScope.DENY,
      params.sessionId ?? "default",
      params.decidedBy,
    );

    // 2. Persist decision in database
    return dbGrantService.resolvePermissionRequest(
      params.requestId,
      params.decidedBy,
      params.granted,
      params.scope ?? PermissionScope.SESSION,
    );
  }

  /**
   * Retrieves all platform capabilities.
   */
  public async listCapabilities(): Promise<Capability[]> {
    const prisma = getPrismaClient();
    return prisma.capability.findMany({
      include: {
        tools: {
          include: {
            tool: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }
}

export const resourceAccessService = new ResourceAccessService();
