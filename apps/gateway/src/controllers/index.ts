/**
 * @file apps/gateway/src/controllers/index.ts
 * @description Backward-compatible barrel re-exporting all HTTP controllers from their new feature module locations.
 * @module apps/gateway/controllers
 * @deprecated Use direct module imports (e.g. `@/modules/execution/execution.controller`) instead.
 */

export * from "@/modules/health/health.controller";
export * from "@/modules/execution/execution.controller";
export * from "@/modules/session/session.controller";
export * from "@/modules/agent/agent.controller";
export * from "@/modules/rag/rag.controller";
export * from "@/modules/approval/approval.controller";
export * from "@/modules/auth/auth.controller";
export * from "@/modules/platform/llm-provider.controller";
export * from "@/modules/platform/llm-model.controller";
export * from "@/modules/platform/platform-mode.controller";
export * from "@/modules/nav/nav-item.controller";
export * from "@/modules/platform/platform-role.controller";
export * from "@/modules/platform/platform-permission.controller";
export * from "@/modules/platform/platform-tool.controller";
export * from "@/modules/eval/eval.controller";
export * from "@/modules/memory/memory.controller";
export * from "@/modules/trace/trace.controller";
export * from "@/modules/permission/resource-access.controller";
