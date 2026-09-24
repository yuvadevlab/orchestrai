/**
 * @file apps/gateway/src/routes/conversation.route.ts
 * @description REST API routes for multi-turn conversations and message threads.
 */

import type { RouteGroup } from "./router";
import { ConversationController } from "@/controllers";

/**
 * Registers conversation and messaging routes onto the gateway router scoped under /conversations.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Conversation controller instance
 */
export function registerConversationRoutes(
  api: RouteGroup,
  controller: ConversationController = new ConversationController(),
): void {
  api.group("/conversations", (group) => {
    group.post("/", (req, res) => controller.createConversation(req, res));
    group.get("/:id/messages", (req, res) => controller.getMessages(req, res));
    group.post("/:id/messages", (req, res) => controller.addMessage(req, res));
  });
}
