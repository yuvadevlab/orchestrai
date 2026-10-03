/**
 * @file packages/database/src/seeds/seed-modes-nav.ts
 * @description Idempotent seeder for platform execution modes and navigation items.
 * Preserves existing database data with zero deletion or truncation.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient, Prisma } from "@prisma/client";

export const SEED_MODES = [
  {
    modeId: "126d1983-b46b-4fa7-bee1-c5cb7947a365",
    slug: "chat",
    name: "Chat",
    description:
      "Pure conversational mode. Responds immediately without dispatching background tasks.",
    icon: "MessageSquare",
    isDefault: false,
    isEnabled: true,
    enforceApproval: false,
    config: {},
    sortOrder: 0,
  },
  {
    modeId: "b7a3e82e-b465-48b3-8f09-63afdeb7b3ee",
    slug: "plan",
    name: "Plan",
    description: "Decomposes objectives into phased milestones and implementation specs.",
    icon: "ClipboardList",
    isDefault: false,
    isEnabled: true,
    enforceApproval: true,
    config: {},
    sortOrder: 1,
  },
  {
    modeId: "0f3e6da0-5020-408f-b53a-1133cf6f3700",
    slug: "act",
    name: "Act",
    description: "Invokes permitted toolchains and file system mutations with policy checks.",
    icon: "Zap",
    isDefault: false,
    isEnabled: true,
    enforceApproval: true,
    config: {},
    sortOrder: 2,
  },
  {
    modeId: "dc0926ed-5d94-40a6-b172-79de755ae22d",
    slug: "auto",
    name: "Auto",
    description: "Adaptive mode — chats for simple queries, plans and acts for complex tasks.",
    icon: "Wand2",
    isDefault: true,
    isEnabled: true,
    enforceApproval: false,
    config: {},
    sortOrder: 3,
  },
];

export const SEED_NAV_ITEMS = [
  {
    navItemId: "d0de2963-2792-4632-b79a-6429095adbe3",
    label: "Cowork Studio",
    icon: "Sparkles",
    href: "/",
    roles: [],
    section: "main",
    isVisible: true,
    isEnabled: true,
    sortOrder: 0,
  },
  {
    navItemId: "ec38dad2-88f1-442a-83be-1a1f5a2a412e",
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
    navItemId: "bf0a451c-70e5-44f7-a784-6ed301d6c1b2",
    label: "Context Hub",
    icon: "Layers",
    href: "/context",
    roles: [],
    section: "main",
    isVisible: true,
    isEnabled: true,
    sortOrder: 2,
  },
  {
    navItemId: "c9974549-206c-4a23-9931-78c5772f687b",
    label: "Tools",
    icon: "Wrench",
    href: "/tools",
    roles: [],
    section: "main",
    isVisible: true,
    isEnabled: true,
    sortOrder: 3,
  },
  {
    navItemId: "0ae68c8a-3d51-486b-a19f-5713a0a9d55d",
    label: "Executions",
    icon: "Play",
    href: "/executions",
    roles: [],
    section: "main",
    isVisible: true,
    isEnabled: true,
    sortOrder: 4,
  },
  {
    navItemId: "2c2725d0-71a6-4c54-b39a-1a7bd5dc8b28",
    label: "Models",
    icon: "Cpu",
    href: "/models",
    roles: [],
    section: "main",
    isVisible: true,
    isEnabled: true,
    sortOrder: 5,
  },
  {
    navItemId: "cea068e0-979b-4c4a-b348-a7aa5c51e861",
    label: "Evaluations",
    icon: "BarChart2",
    href: "/evaluations",
    roles: [],
    section: "main",
    isVisible: true,
    isEnabled: true,
    sortOrder: 6,
  },
  {
    navItemId: "ad11f199-ba06-4803-8640-41df94a2cb49",
    label: "Settings",
    icon: "Settings",
    href: "/settings",
    roles: [],
    section: "bottom",
    isVisible: true,
    isEnabled: true,
    sortOrder: 0,
  },
];

/**
 * Seeds default platform modes and navigation items if not present.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedModesAndNav(prisma: PrismaClient): Promise<void> {
  for (const mode of SEED_MODES) {
    await prisma.platformMode.upsert({
      where: { modeId: mode.modeId },
      update: {}, // Preserve existing data
      create: {
        modeId: mode.modeId,
        slug: mode.slug,
        name: mode.name,
        description: mode.description,
        icon: mode.icon,
        isDefault: mode.isDefault,
        isEnabled: mode.isEnabled,
        enforceApproval: mode.enforceApproval,
        config: mode.config as Prisma.InputJsonValue,
        sortOrder: mode.sortOrder,
      },
    });
  }

  for (const item of SEED_NAV_ITEMS) {
    await prisma.navItem.upsert({
      where: { navItemId: item.navItemId },
      update: {}, // Preserve existing data
      create: {
        navItemId: item.navItemId,
        label: item.label,
        icon: item.icon,
        href: item.href,
        roles: item.roles as Prisma.InputJsonValue,
        section: item.section,
        isVisible: item.isVisible,
        isEnabled: item.isEnabled,
        sortOrder: item.sortOrder,
      },
    });
  }
}
