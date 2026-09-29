/**
 * @file apps/gateway/src/services/platform-mode.service.ts
 * @description Domain service for managing platform execution modes.
 * Handles CRUD for the platform_modes table. First-boot seeds Chat/Plan/Act/Auto.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import type { PlatformMode, Prisma } from "@orchestrai/database";

/** DTO for creating or updating a platform mode. */
export interface UpsertModeDto {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  isDefault?: boolean;
  isEnabled?: boolean;
  enforceApproval?: boolean;
  config?: Record<string, unknown>;
  sortOrder?: number;
}

/**
 * PlatformModeService manages the execution mode registry.
 * All mutations are admin-gated at the controller layer.
 */
export class PlatformModeService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Returns all platform modes ordered by sort_order.
   * Triggers first-boot seeding if the table is empty.
   */
  public async listModes(): Promise<PlatformMode[]> {
    await this.seedIfEmpty();
    return this.db.platformMode.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Creates a new platform execution mode.
   *
   * @param dto - Mode creation payload
   * @returns The newly created mode record
   */
  public async createMode(dto: UpsertModeDto): Promise<PlatformMode> {
    return this.db.platformMode.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        isDefault: dto.isDefault ?? false,
        isEnabled: dto.isEnabled ?? true,
        enforceApproval: dto.enforceApproval ?? false,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * Updates an existing platform mode by its UUID.
   *
   * @param modeId - UUID of the mode to update
   * @param dto - Partial update payload
   * @returns Updated mode record
   */
  public async updateMode(modeId: string, dto: Partial<UpsertModeDto>): Promise<PlatformMode> {
    return this.db.platformMode.update({
      where: { modeId },
      data: {
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.enforceApproval !== undefined && {
          enforceApproval: dto.enforceApproval,
        }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.config !== undefined && {
          config: dto.config as Prisma.InputJsonValue,
        }),
      },
    });
  }

  /**
   * Deletes a platform mode by UUID.
   *
   * @param modeId - UUID of the mode to delete
   */
  public async deleteMode(modeId: string): Promise<void> {
    await this.db.platformMode.delete({ where: { modeId } });
  }

  /**
   * Seeds the four canonical execution modes when the table is empty.
   * Guard: checks row count before inserting — never overwrites existing data.
   */
  private async seedIfEmpty(): Promise<void> {
    const count = await this.db.platformMode.count();
    if (count > 0) return;

    await this.db.platformMode.createMany({
      data: [
        {
          slug: "chat",
          name: "Chat",
          description:
            "Pure conversational mode. Responds immediately without dispatching background tasks.",
          icon: "MessageSquare",
          isDefault: false,
          isEnabled: true,
          enforceApproval: false,
          sortOrder: 0,
        },
        {
          slug: "plan",
          name: "Plan",
          description: "Decomposes objectives into phased milestones and implementation specs.",
          icon: "ClipboardList",
          isDefault: false,
          isEnabled: true,
          enforceApproval: true,
          sortOrder: 1,
        },
        {
          slug: "act",
          name: "Act",
          description: "Invokes permitted toolchains and file system mutations with policy checks.",
          icon: "Zap",
          isDefault: false,
          isEnabled: true,
          enforceApproval: true,
          sortOrder: 2,
        },
        {
          slug: "auto",
          name: "Auto",
          description:
            "Adaptive mode — chats for simple queries, plans and acts for complex tasks.",
          icon: "Wand2",
          isDefault: true,
          isEnabled: true,
          enforceApproval: false,
          sortOrder: 3,
        },
      ],
    });
  }
}
