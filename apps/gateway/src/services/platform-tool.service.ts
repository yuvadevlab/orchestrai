/**
 * @file apps/gateway/src/services/platform-tool.service.ts
 * @description Domain service for managing execution tools from the database.
 * Handles CRUD for the platform_tools table.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient, type PlatformTool } from "@orchestrai/database";

/** DTO for registering or updating an execution tool. */
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

/**
 * PlatformToolService manages runtime tools stored in the database.
 */
export class PlatformToolService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Returns all platform execution tools ordered by sort_order.
   */
  public async listTools(): Promise<PlatformTool[]> {
    return this.db.platformTool.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Creates a new execution tool definition in the database.
   *
   * @param dto - Tool registration payload
   */
  public async createTool(dto: UpsertToolDto): Promise<PlatformTool> {
    return this.db.platformTool.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        category: dto.category || "General",
        description: dto.description,
        permissionLevel: dto.permissionLevel || "read_only",
        sandbox: dto.sandbox || "read_only",
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * Updates an existing tool definition by UUID.
   *
   * @param toolId - UUID of the tool record
   * @param dto - Partial update payload
   */
  public async updateTool(toolId: string, dto: Partial<UpsertToolDto>): Promise<PlatformTool> {
    return this.db.platformTool.update({
      where: { toolId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.permissionLevel !== undefined && { permissionLevel: dto.permissionLevel }),
        ...(dto.sandbox !== undefined && { sandbox: dto.sandbox }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  /**
   * Deletes a tool definition by UUID.
   *
   * @param toolId - UUID of the tool record
   */
  public async deleteTool(toolId: string): Promise<void> {
    await this.db.platformTool.delete({ where: { toolId } });
  }
}
