/**
 * @file apps/gateway/src/commands/index.ts
 * @description Master barrel export for Gateway CQRS command handlers — sourced from feature modules.
 * @module apps/gateway/commands
 * @deprecated Reference module commands directly (e.g. `@/modules/execution/commands/create-execution.handler`).
 */

export * from "@/modules/execution/commands/create-execution.handler";
export * from "@/modules/execution/commands/cancel-execution.handler";
export * from "@/modules/approval/commands/resolve-approval.handler";
export * from "@/modules/session/commands/session.handlers";
