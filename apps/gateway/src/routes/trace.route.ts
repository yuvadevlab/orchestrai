/**
 * @file apps/gateway/src/routes/trace.route.ts
 * @description REST API routes for inspecting execution traces and OpenTelemetry spans.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "./router";
import { TraceController } from "@/controllers/trace.controller";

/**
 * Registers trace routes onto the gateway router scoped under /traces.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Trace controller instance
 */
export function registerTraceRoutes(
  api: RouteGroup,
  controller: TraceController = new TraceController(),
): void {
  api.group("/traces", (group) => {
    group.get("/", (req, res) => controller.listRecent(req, res));
    group.get("/:executionId", (req, res) => controller.getByExecutionId(req, res));
  });
}
