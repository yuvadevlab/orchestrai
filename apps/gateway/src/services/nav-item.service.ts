/**
 * @file apps/gateway/src/services/nav-item.service.ts
 * @description Domain service for managing platform navigation items.
 * Handles CRUD for the nav_items table. First-boot seeds the default sidebar nav.
 * @module apps/gateway/services
 */

import { getPrismaClient, type PrismaClient } from "@orchestrai/database";
import type { NavItem } from "@orchestrai/database";

/** DTO for creating or updating a navigation item. */
export interface UpsertNavItemDto {
  label: string;
  icon?: string;
  href: string;
  roles?: string[];
  section?: string;
  isVisible?: boolean;
  isEnabled?: boolean;
  sortOrder?: number;
}

/**
 * NavItemService manages the dynamic platform navigation registry.
 * All mutations are admin-gated at the controller layer.
 */
export class NavItemService {
  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Returns all nav items ordered by section then sort_order.
   * Triggers first-boot seeding if the table is empty.
   */
  public async listNavItems(): Promise<NavItem[]> {
    await this.seedIfEmpty();
    return this.db.navItem.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });
  }

  /**
   * Creates a new navigation item.
   *
   * @param dto - Nav item creation payload
   * @returns The newly created nav item record
   */
  public async createNavItem(dto: UpsertNavItemDto): Promise<NavItem> {
    return this.db.navItem.create({
      data: {
        label: dto.label,
        icon: dto.icon,
        href: dto.href,
        roles: dto.roles ?? [],
        section: dto.section ?? "main",
        isVisible: dto.isVisible ?? true,
        isEnabled: dto.isEnabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  /**
   * Updates an existing nav item by its UUID.
   *
   * @param navItemId - UUID of the nav item to update
   * @param dto - Partial update payload
   * @returns Updated nav item record
   */
  public async updateNavItem(navItemId: string, dto: Partial<UpsertNavItemDto>): Promise<NavItem> {
    return this.db.navItem.update({
      where: { navItemId },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.href !== undefined && { href: dto.href }),
        ...(dto.roles !== undefined && { roles: dto.roles }),
        ...(dto.section !== undefined && { section: dto.section }),
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  /**
   * Deletes a nav item by UUID.
   *
   * @param navItemId - UUID of the nav item to delete
   */
  public async deleteNavItem(navItemId: string): Promise<void> {
    await this.db.navItem.delete({ where: { navItemId } });
  }

  /**
   * Seeds the default navigation set when the table is completely empty.
   * Guard: checks row count — never overwrites existing nav items.
   */
  private async seedIfEmpty(): Promise<void> {
    const count = await this.db.navItem.count();
    if (count > 0) return;

    await this.db.navItem.createMany({
      data: [
        {
          label: "Studio",
          icon: "Sparkles",
          href: "/",
          roles: [],
          section: "main",
          isVisible: true,
          isEnabled: true,
          sortOrder: 0,
        },
        {
          label: "Agents",
          icon: "Bot",
          href: "/agents",
          roles: [],
          section: "main",
          isVisible: true,
          isEnabled: true,
          sortOrder: 1,
        },
        {
          label: "Models",
          icon: "Cpu",
          href: "/models",
          roles: [],
          section: "main",
          isVisible: true,
          isEnabled: true,
          sortOrder: 2,
        },
        {
          label: "Executions",
          icon: "Play",
          href: "/executions",
          roles: [],
          section: "main",
          isVisible: true,
          isEnabled: true,
          sortOrder: 3,
        },
        {
          label: "Tools",
          icon: "Wrench",
          href: "/tools",
          roles: [],
          section: "main",
          isVisible: true,
          isEnabled: true,
          sortOrder: 4,
        },
        {
          label: "Settings",
          icon: "Settings",
          href: "/settings",
          roles: [],
          section: "bottom",
          isVisible: true,
          isEnabled: true,
          sortOrder: 0,
        },
        {
          label: "Admin",
          icon: "Shield",
          href: "/admin",
          /* Admin section is role-restricted to admin and super_admin */
          roles: ["admin", "super_admin"],
          section: "bottom",
          isVisible: true,
          isEnabled: true,
          sortOrder: 1,
        },
      ],
    });
  }
}
