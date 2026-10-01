/**
 * @file apps/gateway/src/services/platform-permission.service.ts
 * @description Domain service for managing tool permission tiers from the database.
 * Handles CRUD for the platform_permissions table.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient, type PlatformPermission } from "@orchestrai/database";

/** DTO for creating or updating a platform permission tier. */
export interface UpsertPermissionDto {
  name: string;
  level: string;
  description?: string;
  requiresApproval?: boolean;
  sortOrder?: number;
}

/**
 * PlatformPermissionService manages tool permission policies directly in the database.
 */
export class PlatformPermissionService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Returns all platform permission levels ordered by sort_order.
   */
  public async listPermissions(): Promise<PlatformPermission[]> {
    return this.db.platformPermission.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Creates a new platform permission tier.
   *
   * @param dto - Permission payload
   */
  public async createPermission(dto: UpsertPermissionDto): Promise<PlatformPermission> {
    return this.db.platformPermission.create({
      data: {
        name: dto.name,
        level: dto.level,
        description: dto.description,
        requiresApproval: dto.requiresApproval ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * Updates an existing permission tier by UUID.
   *
   * @param permissionId - UUID of the permission record
   * @param dto - Partial update payload
   */
  public async updatePermission(
    permissionId: string,
    dto: Partial<UpsertPermissionDto>,
  ): Promise<PlatformPermission> {
    return this.db.platformPermission.update({
      where: { permissionId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.requiresApproval !== undefined && { requiresApproval: dto.requiresApproval }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  /**
   * Deletes a permission tier by UUID.
   *
   * @param permissionId - UUID of the permission record
   */
  public async deletePermission(permissionId: string): Promise<void> {
    await this.db.platformPermission.delete({ where: { permissionId } });
  }
}
