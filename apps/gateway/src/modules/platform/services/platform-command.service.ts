/**
 * @file apps/gateway/src/modules/platform/services/platform-command.service.ts
 * @description Service for managing platform slash commands from database platform_configs.
 * Purely database-driven with zero hardcoded commands.
 * @module apps/gateway/modules/platform/services
 */

import { getPrismaClient, type PrismaClient, type Prisma } from "@orchestrai/database";
import { ConfigNamespace, ConfigKey, type PlatformCommandRecord } from "@orchestrai/shared-types";

/** DTO for creating or updating a slash command. */
export interface UpsertCommandDto {
  command: string;
  title: string;
  description: string;
  icon: string;
  targetMode?: string;
  action?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}

/**
 * Service managing platform slash commands via database platform_configs.
 */
export class PlatformCommandService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Lists platform slash commands from the database.
   *
   * @param includeDisabled - If true, returns disabled commands
   */
  public async listCommands(includeDisabled: boolean = false): Promise<PlatformCommandRecord[]> {
    try {
      const config = await this.db.platformConfig.findUnique({
        where: {
          namespace_key: {
            namespace: ConfigNamespace.COMMANDS,
            key: ConfigKey.SLASH_COMMANDS,
          },
        },
      });

      const commands = (config?.value as unknown as PlatformCommandRecord[]) ?? [];
      const filtered = includeDisabled ? commands : commands.filter((c) => c.isEnabled);
      return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      // In case of initial connection or migration boundary, return empty array
      return [];
    }
  }

  /**
   * Retrieves a single command by ID.
   *
   * @param commandId - Command identifier
   */
  public async getCommand(commandId: string): Promise<PlatformCommandRecord | null> {
    const all = await this.listCommands(true);
    return all.find((c) => c.commandId === commandId) ?? null;
  }

  /**
   * Creates a new slash command in the database.
   *
   * @param dto - Command creation payload
   */
  public async createCommand(dto: UpsertCommandDto): Promise<PlatformCommandRecord> {
    const all = await this.listCommands(true);
    const id = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newRecord: PlatformCommandRecord = {
      commandId: id,
      command: dto.command.startsWith("/") ? dto.command : `/${dto.command}`,
      title: dto.title,
      description: dto.description,
      icon: dto.icon || "Sparkles",
      targetMode: dto.targetMode,
      action: dto.action,
      isEnabled: dto.isEnabled ?? true,
      sortOrder: dto.sortOrder ?? all.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(newRecord);

    await this.db.platformConfig.upsert({
      where: {
        namespace_key: {
          namespace: ConfigNamespace.COMMANDS,
          key: ConfigKey.SLASH_COMMANDS,
        },
      },
      update: {
        value: all as unknown as Prisma.InputJsonValue,
      },
      create: {
        namespace: ConfigNamespace.COMMANDS,
        key: ConfigKey.SLASH_COMMANDS,
        value: all as unknown as Prisma.InputJsonValue,
        description: "Studio slash commands",
      },
    });

    return newRecord;
  }

  /**
   * Updates an existing slash command in the database.
   *
   * @param commandId - Command identifier
   * @param patch - Fields to update
   */
  public async updateCommand(
    commandId: string,
    patch: Partial<UpsertCommandDto>,
  ): Promise<PlatformCommandRecord | null> {
    const all = await this.listCommands(true);
    const index = all.findIndex((c) => c.commandId === commandId);
    if (index === -1) return null;

    const updated: PlatformCommandRecord = {
      ...all[index]!,
      ...patch,
      commandId: all[index]!.commandId,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;

    await this.db.platformConfig.update({
      where: {
        namespace_key: {
          namespace: ConfigNamespace.COMMANDS,
          key: ConfigKey.SLASH_COMMANDS,
        },
      },
      data: {
        value: all as unknown as Prisma.InputJsonValue,
      },
    });

    return updated;
  }

  /**
   * Deletes a slash command by ID from the database.
   *
   * @param commandId - Command identifier
   */
  public async deleteCommand(commandId: string): Promise<boolean> {
    const all = await this.listCommands(true);
    const filtered = all.filter((c) => c.commandId !== commandId);
    if (filtered.length === all.length) return false;

    await this.db.platformConfig.update({
      where: {
        namespace_key: {
          namespace: ConfigNamespace.COMMANDS,
          key: ConfigKey.SLASH_COMMANDS,
        },
      },
      data: {
        value: filtered as unknown as Prisma.InputJsonValue,
      },
    });

    return true;
  }
}

export const platformCommandService = new PlatformCommandService();
