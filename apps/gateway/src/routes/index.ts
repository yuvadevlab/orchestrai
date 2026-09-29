/**
 * @file apps/gateway/src/routes/index.ts
 * @description Central barrel export re-exporting all route registration functions from feature modules,
 * plus shared HTTP infrastructure (types, helpers, router).
 * @module apps/gateway/routes
 */

export * from "./http-types";
export * from "./http-helpers";
export * from "./router";

// ─── Feature module route exports ───────────────────────────────────────────

export { registerHealthRoutes } from "@/modules/health/health.route";
export { registerAuthRoutes } from "@/modules/auth/auth.route";
export { registerExecutionRoutes } from "@/modules/execution/execution.route";
export { registerConversationRoutes } from "@/modules/session/session.route";
export { registerAgentRoutes } from "@/modules/agent/agent.route";
export { registerRagRoutes } from "@/modules/rag/rag.route";
export { registerApprovalRoutes } from "@/modules/approval/approval.route";
export { registerMemoryRoutes } from "@/modules/memory/memory.route";
export { registerEvalRoutes } from "@/modules/eval/eval.route";
export { registerNavItemRoutes } from "@/modules/nav/nav-item.route";
export { registerTraceRoutes } from "@/modules/trace/trace.route";
export { registerResourceAccessRoutes } from "@/modules/permission/resource-access.route";
export { registerLlmProviderRoutes } from "@/modules/platform/llm-provider.route";
export { registerLlmModelRoutes } from "@/modules/platform/llm-model.route";
export { registerPlatformModeRoutes } from "@/modules/platform/platform-mode.route";
export { registerPlatformRoleRoutes } from "@/modules/platform/platform-role.route";
export { registerPlatformPermissionRoutes } from "@/modules/platform/platform-permission.route";
export { registerPlatformToolRoutes } from "@/modules/platform/platform-tool.route";
