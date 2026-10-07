/**
 * @file packages/database/src/seeds/seed-roles.ts
 * @description Database seeder for platform roles.
 * Idempotent upsert preserving existing user customizations.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient } from "@prisma/client";
import { AgentRoleSlug } from "@orchestrai/shared-types";

export const SEED_ROLES = [
  {
    roleId: "772ae875-489c-47c7-ac64-1c6cde76651a",
    name: "Strategy & Architecture",
    slug: AgentRoleSlug.STRATEGY,
    description: "High-level architectural planning, roadmap decomposition, and system design",
    isEnabled: true,
    sortOrder: 0,
  },
  {
    roleId: "9e3a38f2-7e93-4c51-b8f0-dce46d73ae6c",
    name: "Research & Synthesis",
    slug: AgentRoleSlug.RESEARCH,
    description: "Deep web exploration, documentation synthesis, and literature analysis",
    isEnabled: true,
    sortOrder: 1,
  },
  {
    roleId: "29411167-c510-4da4-a30a-08d8410eef7f",
    name: "Technical Writing & Docs",
    slug: AgentRoleSlug.WRITING,
    description: "PRD drafting, specifications, and architecture documentation",
    isEnabled: true,
    sortOrder: 2,
  },
  {
    roleId: "73f63f6b-f0e3-4f0a-9e6d-4534c8911a6f",
    name: "Software Engineering",
    slug: AgentRoleSlug.ENGINEERING,
    description: "Fullstack software development, debugging, and code generation",
    isEnabled: true,
    sortOrder: 3,
  },
  {
    roleId: "111eb685-58fd-4749-83a5-f2b40a46be94",
    name: "Data Analysis & SQL",
    slug: AgentRoleSlug.DATA,
    description: "Data exploration, SQL authoring, metric aggregation, and ETL",
    isEnabled: true,
    sortOrder: 4,
  },
  {
    roleId: "70d7759b-093d-41ed-b9a0-0c0b6aebe950",
    name: "Workflow Automation",
    slug: AgentRoleSlug.AUTOMATION,
    description: "Background task scheduling, webhook handling, and repetitive chaining",
    isEnabled: true,
    sortOrder: 5,
  },
  {
    roleId: "f7aa7fda-b928-4b36-9d42-8357536954ac",
    name: "Custom Specialist",
    slug: AgentRoleSlug.SPECIALIST,
    description: "Tailored specialist configured with custom runtime instructions",
    isEnabled: true,
    sortOrder: 6,
  },
];

/**
 * Seeds platform roles idempotently into PostgreSQL.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedRoles(prisma: PrismaClient): Promise<void> {
  for (const role of SEED_ROLES) {
    await prisma.platformRole.upsert({
      where: { roleId: role.roleId },
      update: {}, // Preserve existing data
      create: role,
    });
  }
}
