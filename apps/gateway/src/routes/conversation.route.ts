/**
 * @file apps/gateway/src/routes/conversation.route.ts
 * @description REST API routes for multi-turn conversations and message threads.
 */

import type { Router } from "./router";
import { ConversationController } from "@/controllers";

/**
 * Registers conversation and messaging routes onto the gateway router.
 *
 * @param router - Gateway router instance
 * @param controller - Conversation controller instance
 */
export function registerConversationRoutes(
  router: Router,
  controller: ConversationController = new ConversationController(),
): void {
  router.post("/api/v1/conversations", (req, res) => controller.createConversation(req, res));
  router.get("/api/v1/conversations/:id/messages", (req, res) => controller.getMessages(req, res));
  router.post("/api/v1/conversations/:id/messages", (req, res) => controller.addMessage(req, res));
}
