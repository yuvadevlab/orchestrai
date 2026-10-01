/**
 * @file apps/gateway/src/routes/eval.route.ts
 * @description REST API routes for running model evaluations and retrieving benchmark datasets.
 * @module apps/gateway/routes
 */

import type { RouteGroup } from "@/routes/router";
import { EvalController } from "./eval.controller";

/**
 * Registers evaluation routes onto the gateway router scoped under /eval.
 *
 * @param api - Scoped API v1 route group instance
 * @param controller - Evaluation controller instance
 */
export function registerEvalRoutes(
  api: RouteGroup,
  controller: EvalController = new EvalController(),
): void {
  api.group("/eval", (group) => {
    group.get("/datasets", (req, res) => controller.listDatasets(req, res));
    group.post("/run", (req, res) => controller.runBenchmark(req, res));
  });
}
