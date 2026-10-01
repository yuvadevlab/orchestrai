/**
 * @file apps/gateway/src/modules/execution/index.ts
 * @description Execution module barrel — exports route registration and execution services.
 * @module apps/gateway/modules/execution
 */
export { registerExecutionRoutes } from "./controllers/execution.route";
export { ExecutionController } from "./controllers/execution.controller";
export { ExecutionService } from "./services/execution.service";
export { ExecutionQueryService } from "./services/execution-query.service";
export { ExecutionDispatcher } from "./services/execution-dispatcher";
export { toPrismaStatus, toSharedStatus } from "./repositories/execution-status.mapper";
export { PostgresExecutionRepository } from "./repositories/execution.repository";
export * from "./commands/cancel-execution.handler";
export * from "./commands/create-execution.handler";
