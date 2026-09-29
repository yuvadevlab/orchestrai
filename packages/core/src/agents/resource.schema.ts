/**
 * @file packages/core/src/agents/resource.schema.ts
 * @description Invariant definition schemas and helper functions for generic platform resources.
 */

import { z } from "zod";
import { ResourceType } from "@orchestrai/shared-types";
import { ResourceIdSchema, TenantIdSchema } from "@/identifiers";

/**
 * Regular expression validating standard canonical URIs for platform resources.
 * Supports file://, repo://, db://, api://, service://, tenant:// schemes.
 */
export const CANONICAL_URI_REGEX = /^[a-z][a-z0-9+.-]*:\/\/.+$/i;

/**
 * Validated Canonical Resource URI schema.
 */
export const CanonicalUriSchema = z
  .string()
  .min(4)
  .max(1024)
  .regex(CANONICAL_URI_REGEX, {
    message:
      "Resource URI must follow canonical scheme (e.g. file:///path, repo://org/repo, db://host/db)",
  })
  .describe("Canonical Uniform Resource Identifier for platform assets");

export type CanonicalUri = z.infer<typeof CanonicalUriSchema>;

/**
 * Generic Platform Resource Definition schema.
 * Represents any system asset that agents may target through capability tools.
 */
export const ResourceDefinitionSchema = z
  .object({
    resourceId: ResourceIdSchema,
    tenantId: TenantIdSchema.optional()
      .nullable()
      .describe("Tenant owner, or null for platform-wide resources"),
    type: z.enum(ResourceType).describe("Resource taxonomy classification"),
    name: z.string().min(1).max(255).describe("Human-readable label for the resource"),
    canonicalUri: CanonicalUriSchema,
    externalId: z
      .string()
      .max(255)
      .optional()
      .nullable()
      .describe("External provider or source identifier"),
    description: z.string().max(500).optional().describe("Contextual description of the resource"),
    metadata: z.record(z.string(), z.unknown()).default({}).describe("Arbitrary resource metadata"),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .describe("Canonical identity record for any platform asset");

export type ResourceDefinition = z.infer<typeof ResourceDefinitionSchema>;

/**
 * Checks whether a target child resource URI is contained within a parent resource URI.
 * Implements hierarchical containment for file paths, repos, databases, and APIs.
 *
 * @param parentUri - The authorized root or base URI (e.g. file:///Users/dev/repo)
 * @param childUri - The specific target URI requested (e.g. file:///Users/dev/repo/package.json)
 * @returns True if childUri is equal to or contained within parentUri
 */
export function isResourceContained(parentUri: string, childUri: string): boolean {
  // If exact match, grant applies directly
  if (parentUri === childUri) {
    return true;
  }

  // Ensure trailing slash normalization for path containment
  const normalizedParent = parentUri.endsWith("/") ? parentUri : `${parentUri}/`;
  return childUri.startsWith(normalizedParent);
}
