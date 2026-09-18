/**
 * @file packages/core/src/messages/chat-message.schema.ts
 * @description Canonical chat message data contracts across all model adapters and storage layers.
 */

import { z } from "zod";
import { UuidSchema } from "@/identifiers";
import { MessageRoleSchema } from "./message-role.schema";
import { ContentBlockSchema } from "./content-block.schema";

/**
 * Universal AIMessage contract capable of holding string content or heterogeneous blocks.
 */
export const AIMessageSchema = z
  .object({
    id: UuidSchema.default(() => {
      // Generate standard random UUID when not explicitly provided
      return typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "00000000-0000-0000-0000-000000000000";
    }),
    role: MessageRoleSchema,
    content: z
      .union([z.string(), z.array(ContentBlockSchema)])
      .describe("Message body as simple text or an array of multimodal/structured content blocks"),
    name: z.string().optional().describe("Optional author or tool identifier"),
    tokenCount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe("Token count estimate for this message"),
    metadata: z
      .record(z.string(), z.unknown())
      .default({})
      .describe("Additional message metadata (latency, finishReason)"),
    createdAt: z.date().default(() => new Date()),
  })
  .describe("Canonical message representation in OrchestrAI threads");

export type AIMessage = z.infer<typeof AIMessageSchema>;

/**
 * Extracts plain text content from a message regardless of whether it uses raw string or content blocks.
 *
 * @param message - The AIMessage instance.
 * @returns Concatenated plain text representation.
 */
export function extractMessageText(message: AIMessage): string {
  // If content is already a plain string, return it immediately
  if (typeof message.content === "string") {
    return message.content;
  }

  // Concatenate all text blocks into a single string
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("\n");
}
