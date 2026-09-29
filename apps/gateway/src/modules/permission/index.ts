/**
 * @file apps/gateway/src/modules/permission/index.ts
 * @description Permission/resource-access module barrel.
 * @module apps/gateway/modules/permission
 */
export { registerResourceAccessRoutes } from "./controllers/resource-access.route";
export { ResourceAccessController } from "./controllers/resource-access.controller";
export { ResourceAccessService } from "./services/resource-access.service";
export { dbGrantService } from "./services/db-grant.service";
export { resourceRegistryService } from "./services/resource-registry.service";
export { permissionPolicyManager } from "./services/permission-policy.manager";
export { resourceAccessLogger } from "./services/resource-access-logger";
export * from "./storage/permission-types";
