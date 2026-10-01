/**
 * @file apps/gateway/src/services/platform-role.service.ts
 * @description Domain service for managing agent roles from the database.
 * Handles CRUD for the platform_roles table.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient, type PlatformRole } from "@orchestrai/database";

/** DTO for creating or updating a platform role. */
export interface UpsertRoleDto {
  name: string;
  slug: string;
  description?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}

/**
 * PlatformRoleService manages agent functional roles/domains configured in the database.
 */
export class PlatformRoleService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Returns all active platform roles ordered by sort_order.
   */
  public async listRoles(): Promise<PlatformRole[]> {
    return this.db.platformRole.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Creates a new platform role in the database.
   *
   * @param dto - Role creation payload
   * @returns The newly created role record
   */
  public async createRole(dto: UpsertRoleDto): Promise<PlatformRole> {
    return this.db.platformRole.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * Updates an existing platform role by UUID.
   *
   * @param roleId - UUID of the role
   * @param dto - Partial update payload
   */
  public async updateRole(roleId: string, dto: Partial<UpsertRoleDto>): Promise<PlatformRole> {
    return this.db.platformRole.update({
      where: { roleId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  /**
   * Deletes a platform role by UUID.
   *
   * @param roleId - UUID of the role to delete
   */
  public async deleteRole(roleId: string): Promise<void> {
    await this.db.platformRole.delete({ where: { roleId } });
  }
}
