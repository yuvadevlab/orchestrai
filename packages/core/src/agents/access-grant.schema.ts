/**
 * @file packages/core/src/agents/access-grant.schema.ts
 * @description Invariant definition schemas for Permission Requests, Access Grants, and Audit Logs.
 */

import { z } from "zod";
import {
  PermissionLevel,
  PermissionScope,
  RequestStatus,
  GrantStatus,
  ApprovalRiskLevel,
} from "@orchestrai/shared-types";
import {
  AgentIdSchema,
  GrantIdSchema,
  PermissionRequestIdSchema,
  ResourceIdSchema,
  TenantIdSchema,
  ExecutionIdSchema,
  UuidSchema,
} from "@/identifiers";
import { CanonicalUriSchema } from "./resource.schema";

/**
 * Clearance request emitted when an agent attempts an unauthorized resource action.
 */
export const PermissionRequestSchema = z
  .object({
    requestId: PermissionRequestIdSchema,
    agentId: AgentIdSchema,
    userId: UuidSchema.describe("Requesting operator user identifier"),
    tenantId: TenantIdSchema.optional().nullable(),
    conversationId: UuidSchema.optional().nullable(),
    executionId: ExecutionIdSchema.optional().nullable(),
    resourceId: ResourceIdSchema.optional().nullable(),
    resourceUri: CanonicalUriSchema,
    capabilityId: UuidSchema.optional().nullable(),
    toolId: UuidSchema.optional().nullable(),
    toolSlug: z.string().optional().nullable(),
    requestedLevel: z.enum(PermissionLevel).default(PermissionLevel.READ),
    scopeType: z.enum(PermissionScope).default(PermissionScope.SESSION),
    reason: z.string().min(1).max(1024),
    riskLevel: z.enum(ApprovalRiskLevel).default(ApprovalRiskLevel.CAUTION),
    status: z.enum(RequestStatus).default(RequestStatus.PENDING),
    decidedBy: UuidSchema.optional().nullable(),
    decidedAt: z.date().optional().nullable(),
    expiresAt: z.date().optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .describe("Formal clearance request awaiting human approval");

export type PermissionRequest = z.infer<typeof PermissionRequestSchema>;

/**
 * Access Grant authorized by a human operator, conferring resource access.
 */
export const AccessGrantSchema = z
  .object({
    grantId: GrantIdSchema,
    requestId: PermissionRequestIdSchema.optional().nullable(),
    agentId: AgentIdSchema.optional()
      .nullable()
      .describe("Agent granted access, or null for user-wide grant"),
    userId: UuidSchema.describe("Principal user authorizing access"),
    tenantId: TenantIdSchema.optional().nullable(),
    conversationId: UuidSchema.optional().nullable(),
    resourceId: ResourceIdSchema.optional().nullable(),
    resourceUri: CanonicalUriSchema,
    capabilityId: UuidSchema.optional().nullable(),
    toolId: UuidSchema.optional().nullable(),
    permissionLevel: z.enum(PermissionLevel).default(PermissionLevel.READ),
    scopeType: z.enum(PermissionScope).default(PermissionScope.SESSION),
    status: z.enum(GrantStatus).default(GrantStatus.ACTIVE),
    grantedBy: UuidSchema.describe("Operator who approved the grant"),
    revokedBy: UuidSchema.optional().nullable(),
    revokedAt: z.date().optional().nullable(),
    expiresAt: z.date().optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .describe("Persisted access grant token governing agent resource actions");

export type AccessGrant = z.infer<typeof AccessGrantSchema>;

/**
 * Tamper-proof security audit log entry of an evaluated tool and resource operation.
 */
export const ResourceAccessLogSchema = z
  .object({
    logId: UuidSchema,
    agentId: AgentIdSchema,
    userId: UuidSchema.optional().nullable(),
    tenantId: TenantIdSchema.optional().nullable(),
    conversationId: UuidSchema.optional().nullable(),
    executionId: ExecutionIdSchema.optional().nullable(),
    toolCallId: z.string().optional().nullable(),
    resourceId: ResourceIdSchema.optional().nullable(),
    resourceUri: CanonicalUriSchema,
    toolSlug: z.string(),
    action: z.string().max(64),
    permissionLevel: z.enum(PermissionLevel),
    grantId: GrantIdSchema.optional().nullable(),
    decision: z.enum(["allowed", "denied"]),
    reason: z.string().max(500).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    createdAt: z.date().default(() => new Date()),
  })
  .describe("Immutable audit trail event for agent resource execution");

export type ResourceAccessLog = z.infer<typeof ResourceAccessLogSchema>;
