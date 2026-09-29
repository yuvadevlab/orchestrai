/**
 * @file packages/core/src/agents/capability.schema.ts
 * @description Invariant definition schemas for agent capabilities and tool associations.
 */

import { z } from "zod";
import { CapabilityIdSchema, AgentIdSchema } from "@/identifiers";

/**
 * Functional scope of a capability (system-wide platform default vs. tenant-specific).
 */
export const CapabilityScopeSchema = z
  .enum(["platform", "tenant"])
  .default("platform")
  .describe("Operational scope of capability configuration");

export type CapabilityScope = z.infer<typeof CapabilityScopeSchema>;

/**
 * Capability Definition schema representing a coarse functional permission domain.
 * Groups one or more tools under an intelligible operator-facing capability (e.g. Filesystem Access).
 */
export const CapabilityDefinitionSchema = z
  .object({
    capabilityId: CapabilityIdSchema,
    name: z.string().min(1).max(100).describe("Human-readable display name for the capability"),
    slug: z.string().min(1).max(64).describe("Unique machine slug (e.g. 'filesystem_access')"),
    description: z
      .string()
      .max(500)
      .optional()
      .describe("Description of tools and resources governed"),
    category: z.string().default("General").describe("Domain categorization for UI grouping"),
    scope: CapabilityScopeSchema,
    isEnabled: z
      .boolean()
      .default(true)
      .describe("Whether the capability is enabled platform-wide"),
    sortOrder: z.number().int().default(0).describe("Display ordering for capability settings"),
    tools: z.array(z.string()).default([]).describe("Tool slugs bound to this capability"),
    metadata: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Extensible metadata key-values"),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .describe("System-wide capability definition grouping concrete execution tools");

export type CapabilityDefinition = z.infer<typeof CapabilityDefinitionSchema>;

/**
 * Association schema linking an Agent to a Capability with optional overrides.
 */
export const AgentCapabilityBindingSchema = z
  .object({
    agentId: AgentIdSchema,
    capabilityId: CapabilityIdSchema,
    isDefault: z.boolean().default(true).describe("Whether this capability is auto-activated"),
    config: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Agent-specific overrides for this capability"),
  })
  .describe("Binding association between a system agent and an allowed capability");

export type AgentCapabilityBinding = z.infer<typeof AgentCapabilityBindingSchema>;
