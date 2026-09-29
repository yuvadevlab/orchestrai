/**
 * @file apps/gateway/src/modules/permission/index.ts
 * @description Permission/resource-access module barrel.
 * @module apps/gateway/modules/permission
 */
export { registerResourceAccessRoutes } from "./resource-access.route";
export { ResourceAccessController } from "./resource-access.controller";
export { ResourceAccessService } from "./resource-access.service";
