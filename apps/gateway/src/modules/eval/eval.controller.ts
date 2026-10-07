/**
 * @file apps/gateway/src/controllers/eval.controller.ts
 * @description HTTP controller for triggering agent benchmark evaluations.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { evalService } from "@/modules/eval/eval.service";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("EvalController"));

/**
 * Controller mediating evaluation endpoints and benchmark runs.
 */
export class EvalController {
  /**
   * Lists available benchmark datasets for evaluation.
   *
   * @param _req - Inbound gateway HTTP request.
   * @param res - Outbound gateway HTTP response sending dataset catalog items.
   */
  public listDatasets(_req: GatewayRequest, res: GatewayResponse): void {
    logger.info("listDatasets: listing evaluation benchmark datasets");
    // Fetch registered benchmark test suites
    const datasets = evalService.getAvailableDatasets();
    sendJson(res, 200, { items: datasets, total: datasets.length });
  }

  /**
   * Triggers an evaluation benchmark run across specified models.
   *
   * @param req - Inbound gateway HTTP request containing dataset and model options.
   * @param res - Outbound gateway HTTP response delivering benchmark score outcome.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async runBenchmark(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const body = (req.body || {}) as { datasetName?: string; modelName?: string };
    logger.info("runBenchmark: starting evaluation benchmark run", {
      datasetName: body.datasetName,
      modelName: body.modelName,
    });

    // Execute benchmark test suite and calculate scores
    const result = await evalService.runBenchmark(body.datasetName, body.modelName);
    sendJson(res, 200, result);
  }
}
