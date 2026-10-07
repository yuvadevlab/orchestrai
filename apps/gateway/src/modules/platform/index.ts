/**
 * @file apps/gateway/src/modules/platform/index.ts
 * @description Platform admin module barrel — models, providers, roles, tools, modes.
 * @module apps/gateway/modules/platform
 */
export { registerLlmModelRoutes } from "./controllers/llm-model.route";
export { registerLlmProviderRoutes } from "./controllers/llm-provider.route";
export { registerPlatformModeRoutes } from "./controllers/platform-mode.route";
export { registerPlatformCommandRoutes } from "./controllers/platform-command.route";
export { registerPlatformConfigRoutes } from "./controllers/platform-config.route";
export { registerPlatformRoleRoutes } from "./controllers/platform-role.route";
export { registerPlatformPermissionRoutes } from "./controllers/platform-permission.route";
export { registerPlatformToolRoutes } from "./controllers/platform-tool.route";

export { LlmModelController } from "./controllers/llm-model.controller";
export { LlmProviderController } from "./controllers/llm-provider.controller";
export { PlatformModeController } from "./controllers/platform-mode.controller";
export { PlatformCommandController } from "./controllers/platform-command.controller";
export { PlatformConfigController } from "./controllers/platform-config.controller";
export { PlatformRoleController } from "./controllers/platform-role.controller";
export { PlatformPermissionController } from "./controllers/platform-permission.controller";
export { PlatformToolController } from "./controllers/platform-tool.controller";

export { LlmModelService } from "./services/llm-model.service";
export { LlmProviderService } from "./services/llm-provider.service";
export { PlatformModeService } from "./services/platform-mode.service";
export {
  PlatformCommandService,
  platformCommandService,
  type UpsertCommandDto,
} from "./services/platform-command.service";
export {
  PlatformConfigService,
  platformConfigService,
  type SemanticCacheConfig,
  type CompactionConfig,
  type ExecutionConfig,
} from "./services/platform-config.service";
export { PlatformRoleService } from "./services/platform-role.service";
export { PlatformPermissionService } from "./services/platform-permission.service";
export { PlatformToolService } from "./services/platform-tool.service";
