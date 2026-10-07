/**
 * @file apps/admin/src/services/platform-tool.service.ts
 * @description Operator Control Plane service managing registered execution tools.
 * @module apps/admin/services
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { getPrismaClient, type PrismaClient, type PlatformTool } from "@orchestrai/database";
import { ToolPermissionLevel } from "@orchestrai/shared-types";

/**
 * Platform tool catalog entity record.
 */
export interface PlatformToolRecord {
  readonly toolId: string;
  readonly name: string;
  readonly slug: string;
  readonly category: string;
  readonly description?: string;
  readonly permissionLevel: string;
  readonly sandbox?: string;
  readonly isEnabled: boolean;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Payload interface for registering or modifying a platform tool.
 */
export interface UpsertToolDto {
  name: string;
  slug: string;
  category?: string;
  description?: string;
  permissionLevel?: string;
  sandbox?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}

/** Default tool category when none is specified by the operator */
const DEFAULT_TOOL_CATEGORY = "General";

/**
 * Admin service managing platform tool catalog definitions.
 */
export class PlatformToolAdminService {
  private readonly logger = loggerWithConfig(new Logger("PlatformToolAdminService"));

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Retrieves all registered platform tools.
   */
  public async listTools(): Promise<PlatformToolRecord[]> {
    this.logger.info("listTools: querying registered platform tools");

    // Fetch tool catalog ordered by priority and name
    const tools = await this.db.platformTool.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return tools.map((t: PlatformTool) => ({
      toolId: t.toolId,
      name: t.name,
      slug: t.slug,
      category: t.category,
      description: t.description ?? undefined,
      permissionLevel: t.permissionLevel,
      sandbox: t.sandbox ?? undefined,
      isEnabled: t.isEnabled,
      sortOrder: t.sortOrder,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  }

  /**
   * Registers a new platform tool.
   */
  public async createTool(dto: UpsertToolDto): Promise<PlatformToolRecord> {
    this.logger.info("createTool: registering new platform tool", { slug: dto.slug });

    // Insert new tool definition with safe permission defaults
    const t = await this.db.platformTool.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        category: dto.category || DEFAULT_TOOL_CATEGORY,
        description: dto.description,
        permissionLevel: dto.permissionLevel || ToolPermissionLevel.READ_ONLY,
        sandbox: dto.sandbox || ToolPermissionLevel.READ_ONLY,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      toolId: t.toolId,
      name: t.name,
      slug: t.slug,
      category: t.category,
      description: t.description ?? undefined,
      permissionLevel: t.permissionLevel,
      sandbox: t.sandbox ?? undefined,
      isEnabled: t.isEnabled,
      sortOrder: t.sortOrder,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing platform tool.
   */
  public async updateTool(
    toolId: string,
    dto: Partial<UpsertToolDto>,
  ): Promise<PlatformToolRecord> {
    this.logger.info("updateTool: updating platform tool", { toolId, slug: dto.slug });

    // Conditionally patch tool catalog fields
    const t = await this.db.platformTool.update({
      where: { toolId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.permissionLevel !== undefined && {
          permissionLevel: dto.permissionLevel,
        }),
        ...(dto.sandbox !== undefined && { sandbox: dto.sandbox }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    return {
      toolId: t.toolId,
      name: t.name,
      slug: t.slug,
      category: t.category,
      description: t.description ?? undefined,
      permissionLevel: t.permissionLevel,
      sandbox: t.sandbox ?? undefined,
      isEnabled: t.isEnabled,
      sortOrder: t.sortOrder,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  /**
   * Removes a tool from the catalog.
   */
  public async deleteTool(toolId: string): Promise<void> {
    this.logger.info("deleteTool: removing platform tool from catalog", { toolId });
    // Cascade delete tool entry
    await this.db.platformTool.delete({ where: { toolId } });
  }
}
