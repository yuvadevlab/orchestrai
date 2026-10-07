/**
 * @file apps/admin/src/services/platform-mode.service.ts
 * @description Operator Control Plane service managing execution autonomy modes.
 * @module apps/admin/services
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import {
  getPrismaClient,
  type PrismaClient,
  type PlatformMode,
  type Prisma,
} from "@orchestrai/database";
import type { PlatformModeRecord } from "@orchestrai/shared-types";

/**
 * Payload interface for registering or modifying an execution mode.
 */
export interface UpsertModeDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isDefault?: boolean;
  isEnabled?: boolean;
  enforceApproval?: boolean;
  config?: Record<string, unknown>;
  sortOrder?: number;
}

/**
 * Admin service managing platform execution modes.
 */
export class PlatformModeAdminService {
  private readonly logger = loggerWithConfig(new Logger("PlatformModeAdminService"));

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Lists all execution modes ordered by sort order.
   */
  public async listModes(): Promise<PlatformModeRecord[]> {
    this.logger.info("listModes: querying platform modes");

    // Fetch execution autonomy modes ordered by sort priority
    const modes = await this.db.platformMode.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return modes.map((m: PlatformMode) => ({
      modeId: m.modeId,
      name: m.name,
      slug: m.slug,
      description: m.description ?? undefined,
      icon: m.icon ?? undefined,
      isDefault: m.isDefault,
      isEnabled: m.isEnabled,
      enforceApproval: m.enforceApproval,
      config: (m.config ?? {}) as Record<string, unknown>,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  }

  /**
   * Registers a new platform execution mode.
   */
  public async createMode(dto: UpsertModeDto): Promise<PlatformModeRecord> {
    this.logger.info("createMode: registering new platform mode", { slug: dto.slug });

    // Insert new execution mode record
    const m = await this.db.platformMode.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        isDefault: dto.isDefault ?? false,
        isEnabled: dto.isEnabled ?? true,
        enforceApproval: dto.enforceApproval ?? false,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      modeId: m.modeId,
      name: m.name,
      slug: m.slug,
      description: m.description ?? undefined,
      icon: m.icon ?? undefined,
      isDefault: m.isDefault,
      isEnabled: m.isEnabled,
      enforceApproval: m.enforceApproval,
      config: (m.config ?? {}) as Record<string, unknown>,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing execution mode.
   */
  public async updateMode(
    modeId: string,
    dto: Partial<UpsertModeDto>,
  ): Promise<PlatformModeRecord> {
    this.logger.info("updateMode: updating platform mode", { modeId, slug: dto.slug });

    // Update mode attributes conditionally
    const m = await this.db.platformMode.update({
      where: { modeId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.enforceApproval !== undefined && { enforceApproval: dto.enforceApproval }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
      },
    });

    return {
      modeId: m.modeId,
      name: m.name,
      slug: m.slug,
      description: m.description ?? undefined,
      icon: m.icon ?? undefined,
      isDefault: m.isDefault,
      isEnabled: m.isEnabled,
      enforceApproval: m.enforceApproval,
      config: (m.config ?? {}) as Record<string, unknown>,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }

  /**
   * Removes an execution mode from the catalog.
   */
  public async deleteMode(modeId: string): Promise<void> {
    this.logger.info("deleteMode: removing platform mode", { modeId });
    // Cascade delete platform mode
    await this.db.platformMode.delete({ where: { modeId } });
  }
}
