/**
 * @file apps/gateway/src/services/index.ts
 * @description Backward-compatible barrel re-exporting all domain services from their new feature module locations.
 * This file will be removed once all internal imports are updated to reference modules directly.
 * @module apps/gateway/services
 * @deprecated Use direct module imports (e.g. `@/modules/execution/execution.service`) instead.
 */

export * from "@/modules/execution/execution.service";
export * from "@/modules/session/session.service";
export * from "@/modules/session/session-query.service";
export * from "@/modules/session/session-message.service";
export * from "@/modules/agent/agent.service";
export * from "@/modules/rag/rag.service";
export * from "@/modules/memory/memory.service";
export * from "@/modules/approval/approval.service";
export * from "@/modules/auth/auth.service";
export * from "@/modules/platform/llm-provider.service";
export * from "@/modules/platform/llm-model.service";
export * from "@/modules/platform/platform-mode.service";
export * from "@/modules/nav/nav-item.service";
export * from "@/modules/platform/platform-role.service";
export * from "@/modules/platform/platform-permission.service";
export * from "@/modules/platform/platform-tool.service";
