/**
 * @file apps/gateway/src/modules/execution/index.ts
 * @description Execution module barrel — exports route registration and execution services.
 * @module apps/gateway/modules/execution
 */
export { registerExecutionRoutes } from "./execution.route";
export { ExecutionController } from "./execution.controller";
export { ExecutionService } from "./execution.service";
export { ExecutionQueryService } from "./execution-query.service";
export { toPrismaStatus, toSharedStatus } from "./execution-status.mapper";
