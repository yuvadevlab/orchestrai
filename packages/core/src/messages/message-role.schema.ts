/**
 * @file packages/core/src/messages/message-role.schema.ts
 * @description Standard message author roles across LLM communication protocols.
 */

import { z } from "zod";
import { MessageRole } from "@orchestrai/shared-types";

/**
 * Standard message roles supported by model adapters backed by MessageRole enum.
 */
export const MessageRoleSchema = z
  .nativeEnum(MessageRole)
  .describe("Origin role of a chat message in the conversation thread");
