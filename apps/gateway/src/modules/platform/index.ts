/**
 * @file apps/gateway/src/modules/platform/index.ts
 * @description Platform admin module barrel — models, providers, roles, tools, modes.
 * @module apps/gateway/modules/platform
 */
export { registerLlmModelRoutes } from "./llm-model.route";
export { registerLlmProviderRoutes } from "./llm-provider.route";
export { registerPlatformModeRoutes } from "./platform-mode.route";
export { registerPlatformRoleRoutes } from "./platform-role.route";
export { registerPlatformPermissionRoutes } from "./platform-permission.route";
export { registerPlatformToolRoutes } from "./platform-tool.route";
