/**
 * @file apps/gateway/src/repositories/session-entity.mapper.ts
 * @description Domain mapper transforming raw Prisma Conversation and Message records into ISessionRepository domain entities.
 * @module apps/gateway/repositories
 */

import { MessageRole } from "@orchestrai/shared-types";
import type { SessionEntity, SessionMessageEntity } from "@orchestrai/core";

/**
 * Maps arbitrary role string values from database columns to canonical MessageRole enums.
 *
 * @param role - Raw string representation of the message role
 * @returns Standardized domain MessageRole enum
 */
export function toDomainRole(role: string): MessageRole {
  const lower = role.toLowerCase();
  // Check for assistant role originating from LLM generations
  if (lower === "assistant") return MessageRole.ASSISTANT;
  // Check for system instructions and bootstrap prompts
  if (lower === "system") return MessageRole.SYSTEM;
  // Check for tool execution outputs and function returns
  if (lower === "tool") return MessageRole.TOOL;
  // Default fallback to user author for conversational safety
  return MessageRole.USER;
}

/**
 * Maps a Prisma Conversation database record to an immutable domain SessionEntity.
 *
 * @param record - Raw database row from the conversations table
 * @returns Clean domain SessionEntity
 */
export function mapConversationToSessionEntity(record: {
  conversationId: string;
  tenantId: string;
  title: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}): SessionEntity {
  // Extract and normalize metadata object safely from JSON column
  const meta = (record.metadata as Record<string, unknown>) || {};

  return {
    id: record.conversationId,
    tenantId: record.tenantId,
    title: record.title,
    specialistId: (meta.specialistId as string) || undefined,
    model: (meta.model as string) || undefined,
    mode: (meta.mode as string) || undefined,
    metadata: meta,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/**
 * Maps a Prisma Message database record to an immutable domain SessionMessageEntity.
 *
 * @param record - Raw database row from the messages table
 * @param fallbackSessionId - Conversation ID fallback if conversationId relation is unlinked
 * @returns Clean domain SessionMessageEntity
 */
export function mapMessageToSessionMessageEntity(
  record: {
    messageId: string;
    conversationId: string | null;
    role: string;
    content: unknown;
    metadata: unknown;
    createdAt: Date;
  },
  fallbackSessionId: string,
): SessionMessageEntity {
  // Extract custom telemetry and specialist attribution from message metadata
  const meta = (record.metadata as Record<string, unknown>) || {};

  // Ensure content payload is always exposed as string for domain consumers
  const content =
    typeof record.content === "string" ? record.content : JSON.stringify(record.content);

  return {
    id: record.messageId,
    sessionId: record.conversationId || fallbackSessionId,
    role: toDomainRole(record.role),
    content,
    specialistName: (meta.specialistName as string) || undefined,
    model: (meta.model as string) || undefined,
    metadata: meta,
    createdAt: record.createdAt,
  };
}
