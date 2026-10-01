/**
 * @file apps/admin/src/services/platform-permission.service.ts
 * @description Operator Control Plane service managing tool permission tiers and approval policies.
 * @module apps/admin/services
 */

import { getPrismaClient, type PrismaClient, type PlatformPermission } from "@orchestrai/database";

/**
 * Platform permission level representation record.
 */
export interface PlatformPermissionRecord {
  readonly permissionId: string;
  readonly name: string;
  readonly level: string;
  readonly description?: string;
  readonly requiresApproval: boolean;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Payload interface for upserting platform permissions.
 */
export interface UpsertPermissionDto {
  name: string;
  level: string;
  description?: string;
  requiresApproval?: boolean;
  sortOrder?: number;
}

/**
 * Admin service managing platform execution permissions.
 */
export class PlatformPermissionAdminService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Retrieves all platform permission tiers.
   */
  public async listPermissions(): Promise<PlatformPermissionRecord[]> {
    const permissions = await this.db.platformPermission.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return permissions.map((p: PlatformPermission) => ({
      permissionId: p.permissionId,
      name: p.name,
      level: p.level,
      description: p.description ?? undefined,
      requiresApproval: p.requiresApproval,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  /**
   * Creates a new platform permission tier.
   */
  public async createPermission(dto: UpsertPermissionDto): Promise<PlatformPermissionRecord> {
    const p = await this.db.platformPermission.create({
      data: {
        name: dto.name,
        level: dto.level,
        description: dto.description,
        requiresApproval: dto.requiresApproval ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      permissionId: p.permissionId,
      name: p.name,
      level: p.level,
      description: p.description ?? undefined,
      requiresApproval: p.requiresApproval,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing platform permission tier.
   */
  public async updatePermission(
    permissionId: string,
    dto: Partial<UpsertPermissionDto>,
  ): Promise<PlatformPermissionRecord> {
    const p = await this.db.platformPermission.update({
      where: { permissionId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.requiresApproval !== undefined && {
          requiresApproval: dto.requiresApproval,
        }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    return {
      permissionId: p.permissionId,
      name: p.name,
      level: p.level,
      description: p.description ?? undefined,
      requiresApproval: p.requiresApproval,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  /**
   * Deletes a platform permission tier by UUID.
   */
  public async deletePermission(permissionId: string): Promise<void> {
    await this.db.platformPermission.delete({ where: { permissionId } });
  }
}
