/**
 * @file apps/gateway/src/services/resource-access-logger.ts
 * @description Immutable audit logger tracking tool invocations, permissions, and resource accesses.
 * @module apps/gateway/services
 */

import { getPrismaClient, type Prisma } from "@orchestrai/database";
import { PermissionLevel } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("ResourceAccessLogger"));

/**
 * Parameters for logging a resource evaluation or tool execution audit event.
 */
export interface LogAccessParams {
  agentId: string;
  userId?: string;
  tenantId?: string;
  conversationId?: string;
  executionId?: string;
  toolCallId?: string;
  resourceId?: string;
  resourceUri: string;
  toolSlug: string;
  action: string;
  permissionLevel: PermissionLevel;
  grantId?: string;
  decision: "allowed" | "denied";
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service managing immutable audit log persistence for resource and tool evaluations.
 */
export class ResourceAccessLogger {
  /**
   * Asynchronously persists an audit record to the resource_access_logs table.
   *
   * @param params - Access audit parameters
   */
  public async logAccess(params: LogAccessParams): Promise<void> {
    try {
      const prisma = getPrismaClient();
      let resolvedAgentId = params.agentId;

      if (params.executionId) {
        const exec = await prisma.execution.findUnique({
          where: { executionId: params.executionId },
          select: { agentId: true },
        });
        if (exec?.agentId) {
          resolvedAgentId = exec.agentId;
        }
      }

      await prisma.resourceAccessLog.create({
        data: {
          agentId: resolvedAgentId,
          userId: params.userId ?? null,
          tenantId: params.tenantId ?? null,
          conversationId: params.conversationId ?? null,
          executionId: params.executionId ?? null,
          toolCallId: params.toolCallId ?? null,
          resourceId: params.resourceId ?? null,
          resourceUri: params.resourceUri,
          toolSlug: params.toolSlug,
          action: params.action,
          permissionLevel: params.permissionLevel,
          grantId: params.grantId ?? null,
          decision: params.decision,
          reason: params.reason ?? null,
          metadata: (params.metadata as Prisma.InputJsonValue) ?? {},
        },
      });
    } catch (err) {
      // Do not abort execution on audit log failure, but record warning
      logger.warn(
        { err, resourceUri: params.resourceUri, action: params.action },
        "Failed to write to resource_access_logs",
      );
    }
  }
}

export const resourceAccessLogger = new ResourceAccessLogger();
