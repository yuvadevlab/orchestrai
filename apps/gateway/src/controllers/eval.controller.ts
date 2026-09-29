/**
 * @file apps/gateway/src/controllers/eval.controller.ts
 * @description HTTP controller for triggering agent benchmark evaluations.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { evalService } from "@/services/eval.service";

/**
 * Controller mediating evaluation endpoints.
 */
export class EvalController {
  /**
   * Lists available benchmark datasets.
   */
  public listDatasets(_req: GatewayRequest, res: GatewayResponse): void {
    const datasets = evalService.getAvailableDatasets();
    sendJson(res, 200, { items: datasets, total: datasets.length });
  }

  /**
   * Triggers an evaluation benchmark run.
   */
  public async runBenchmark(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const body = (req.body || {}) as { datasetName?: string; modelName?: string };
    const result = await evalService.runBenchmark(body.datasetName, body.modelName);
    sendJson(res, 200, result);
  }
}
