/**
 * @file packages/database/src/seeds/seed-cognitive-policies.ts
 * @description Database seeder for cognitive policies and dynamic thinking guidelines.
 * Adheres strictly to the Anthropic dynamic cognition standard with zero hardcoding.
 * @module @orchestrai/database/seeds
 */

import type { PrismaClient } from "@prisma/client";
import { CognitivePolicySlug } from "@orchestrai/shared-types";

export interface CognitivePolicyBlueprint {
  slug: CognitivePolicySlug;
  name: string;
  description: string;
  enableThinking: boolean;
  thinkingBudgetTokens: number;
  maxExecutionSteps: number;
  temperature: number;
  timeoutMs: number;
  thinkingGuidelines: string;
  isDefault: boolean;
}

export const SEED_COGNITIVE_POLICIES: readonly CognitivePolicyBlueprint[] = [
  {
    slug: CognitivePolicySlug.DEEP_REASONING,
    name: "Deep Extended Reasoning",
    description: "Multi-turn thinking and exhaustive edge-case analysis (Anthropic standard)",
    enableThinking: true,
    thinkingBudgetTokens: 16384,
    maxExecutionSteps: 30,
    temperature: 1.0,
    timeoutMs: 600000,
    thinkingGuidelines:
      "Reason thoroughly before acting. Deconstruct user objectives, consider edge cases, simulate execution, and verify invariant safety.",
    isDefault: false,
  },
  {
    slug: CognitivePolicySlug.AUTONOMOUS_ACT,
    name: "Autonomous Action Loop",
    description: "Low-variance tool execution with deliberate pre-action safety validation",
    enableThinking: true,
    thinkingBudgetTokens: 8192,
    maxExecutionSteps: 25,
    temperature: 0.2,
    timeoutMs: 300000,
    thinkingGuidelines:
      "Formulate precise tool calls. Inspect outputs rigorously before proceeding to subsequent steps.",
    isDefault: true,
  },
  {
    slug: CognitivePolicySlug.FAST_CHAT,
    name: "Conversational Response",
    description: "Direct response without extended thinking token budget for high-speed dialogue",
    enableThinking: false,
    thinkingBudgetTokens: 0,
    maxExecutionSteps: 10,
    temperature: 0.7,
    timeoutMs: 60000,
    thinkingGuidelines: "Respond directly, concisely, and clearly.",
    isDefault: false,
  },
];

/**
 * Seeds cognitive policies idempotently into PostgreSQL.
 * Uses update: {} to preserve existing user customizations without data loss.
 *
 * @param prisma - PrismaClient instance
 */
export async function seedCognitivePolicies(prisma: PrismaClient): Promise<void> {
  for (const policy of SEED_COGNITIVE_POLICIES) {
    await prisma.cognitivePolicy.upsert({
      where: { slug: policy.slug },
      update: {},
      create: {
        slug: policy.slug,
        name: policy.name,
        description: policy.description,
        enableThinking: policy.enableThinking,
        thinkingBudgetTokens: policy.thinkingBudgetTokens,
        maxExecutionSteps: policy.maxExecutionSteps,
        temperature: policy.temperature,
        timeoutMs: policy.timeoutMs,
        thinkingGuidelines: policy.thinkingGuidelines,
        isDefault: policy.isDefault,
      },
    });
  }
}
