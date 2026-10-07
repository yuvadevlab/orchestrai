/**
 * @file apps/admin/src/services/platform-role.service.ts
 * @description Operator Control Plane service managing functional agent roles and specialties.
 * @module apps/admin/services
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { getPrismaClient, type PrismaClient, type PlatformRole } from "@orchestrai/database";

/**
 * Platform role representation record.
 */
export interface PlatformRoleRecord {
  readonly roleId: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly isEnabled: boolean;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Payload interface for upserting platform roles.
 */
export interface UpsertRoleDto {
  name: string;
  slug: string;
  description?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}

/**
 * Admin service managing functional agent role definitions.
 */
export class PlatformRoleAdminService {
  private readonly logger = loggerWithConfig(new Logger("PlatformRoleAdminService"));

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Retrieves all registered platform roles.
   */
  public async listRoles(): Promise<PlatformRoleRecord[]> {
    this.logger.info("listRoles: querying all platform agent roles");

    // Fetch roles ordered by priority and name
    const roles = await this.db.platformRole.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return roles.map((r: PlatformRole) => ({
      roleId: r.roleId,
      name: r.name,
      slug: r.slug,
      description: r.description ?? undefined,
      isEnabled: r.isEnabled,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /**
   * Creates a new platform role.
   */
  public async createRole(dto: UpsertRoleDto): Promise<PlatformRoleRecord> {
    this.logger.info("createRole: creating new platform role", { slug: dto.slug });

    // Insert new agent role definition
    const r = await this.db.platformRole.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      roleId: r.roleId,
      name: r.name,
      slug: r.slug,
      description: r.description ?? undefined,
      isEnabled: r.isEnabled,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing platform role.
   */
  public async updateRole(
    roleId: string,
    dto: Partial<UpsertRoleDto>,
  ): Promise<PlatformRoleRecord> {
    this.logger.info("updateRole: updating platform role", { roleId, slug: dto.slug });

    // Patch role fields conditionally
    const r = await this.db.platformRole.update({
      where: { roleId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    return {
      roleId: r.roleId,
      name: r.name,
      slug: r.slug,
      description: r.description ?? undefined,
      isEnabled: r.isEnabled,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  /**
   * Deletes a platform role by UUID.
   */
  public async deleteRole(roleId: string): Promise<void> {
    this.logger.info("deleteRole: removing platform role", { roleId });
    // Cascade delete role definition
    await this.db.platformRole.delete({ where: { roleId } });
  }
}
