/**
 * @file apps/gateway/src/validation/conversation.schema.ts
 * @description Inbound request validation schemas for conversations and messages.
 */

import { z } from "zod";
import { MessageRole } from "@orchestrai/shared-types";

/**
 * Validates payload for initiating a new multi-turn conversation session.
 */
export const CreateConversationSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .default("New Conversation")
    .describe("Conversation session title"),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .default({})
    .describe("Custom session metadata"),
});

export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;

/**
 * Validates payload for appending a message to an active conversation.
 */
export const AddMessageSchema = z.object({
  role: z.nativeEnum(MessageRole).default(MessageRole.USER).describe("Message author role"),
  content: z.string().min(1, "Message content cannot be empty").describe("Textual message payload"),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .default({})
    .describe("Additional message context"),
});

export type AddMessageDto = z.infer<typeof AddMessageSchema>;

/**
 * Validates query parameters for fetching messages in a conversation.
 */
export const MessageQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Maximum messages to retrieve"),
  cursor: z.string().optional().describe("Opaque cursor for pagination"),
});

export type MessageQueryDto = z.infer<typeof MessageQuerySchema>;

/**
 * Validates query parameters for listing conversations for the tenant.
 */
export const ConversationQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Maximum conversations to retrieve"),
  cursor: z.string().optional().describe("Opaque cursor for pagination"),
});

export type ConversationQueryDto = z.infer<typeof ConversationQuerySchema>;

/**
 * Validates payload for modifying an existing conversation.
 */
export const UpdateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional().describe("Updated conversation title"),
  metadata: z.record(z.string(), z.unknown()).optional().describe("Updated session metadata"),
});

export type UpdateConversationDto = z.infer<typeof UpdateConversationSchema>;
