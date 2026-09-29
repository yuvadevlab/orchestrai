/**
 * @file apps/gateway/src/modules/session/index.ts
 * @description Session (conversation) module barrel.
 * @module apps/gateway/modules/session
 */
export { registerConversationRoutes } from "./session.route";
export { ConversationController } from "./session.controller";
export { ConversationService } from "./session.service";
