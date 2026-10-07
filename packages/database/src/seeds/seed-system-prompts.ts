/**
 * @file packages/database/src/seeds/seed-system-prompts.ts
 * @description Database seeder for system prompt templates and living constitutional rules.
 * All operational prompts are database-driven with zero hardcoded prompt strings.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient } from "@prisma/client";
import { SystemPromptSlug } from "@orchestrai/shared-types";

export interface SystemPromptBlueprint {
  slug: SystemPromptSlug;
  name: string;
  description: string;
  content: string;
}

export const SEED_SYSTEM_PROMPTS: readonly SystemPromptBlueprint[] = [
  {
    slug: SystemPromptSlug.MODE_PLAN,
    name: "Plan Mode System Prompt",
    description: "Instructions for structural task planning and interactive checklists",
    content:
      "You are operating in PLAN MODE. Deconstruct the objective into an interactive markdown checklist with concrete dependencies and milestones. Do not execute tools directly without user approval.",
  },
  {
    slug: SystemPromptSlug.MODE_ACT,
    name: "Act Mode System Prompt",
    description: "Autonomous execution instructions with sandbox filesystem and shell access",
    content:
      "You are operating in ACT MODE. Execute tasks autonomously using available tools. Validate each step's output before continuing.",
  },
  {
    slug: SystemPromptSlug.MODE_CHAT,
    name: "Chat Mode System Prompt",
    description: "Conversational brainstorming instructions without tool invocation",
    content:
      "You are operating in CHAT MODE. Engage in conversational reasoning, explanation, and design without executing tools.",
  },
  {
    slug: SystemPromptSlug.PLATFORM_RULES,
    name: "Platform Invariant Rules",
    description: "Universal security, filesystem boundary, and coding standards",
    content:
      "Adhere strictly to platform invariants: zero hardcoding, strict validation, safe tool clearance, and inward monorepo boundaries.",
  },
];

/**
 * Seeds living system prompt templates idempotently into PostgreSQL.
 * Uses update: {} to preserve existing user customizations without data loss.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedSystemPrompts(prisma: PrismaClient): Promise<void> {
  for (const prompt of SEED_SYSTEM_PROMPTS) {
    await prisma.systemPromptTemplate.upsert({
      where: { slug: prompt.slug },
      update: {},
      create: {
        slug: prompt.slug,
        name: prompt.name,
        description: prompt.description,
        content: prompt.content,
      },
    });
  }
}
