/**
 * @file apps/gateway/src/controllers/trace.controller.ts
 * @description HTTP controller mediating OpenTelemetry execution traces and span inspection.
 * @module apps/gateway/controllers
 */

import { sendJson, type GatewayRequest, type GatewayResponse } from "@/routes";
import { traceService } from "./trace.service";
import { ErrorCode, ROUTE_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("TraceController"));

/**
 * Controller mediating OpenTelemetry execution traces and span inspection.
 */
export class TraceController {
  /**
   * Retrieves spans correlated with an execution identifier.
   *
   * @param req - Inbound gateway HTTP request containing executionId param.
   * @param res - Outbound gateway HTTP response sending matched span array.
   */
  public getByExecutionId(req: GatewayRequest, res: GatewayResponse): void {
    const executionId = req.params?.[ROUTE_PARAMS.EXECUTION_ID];

    // Guard: Verify executionId parameter presence
    if (!executionId) {
      logger.warn("getByExecutionId: missing execution ID parameter");
      sendJson(res, 400, {
        error: { code: ErrorCode.BAD_REQUEST, message: "Execution ID required" },
      });
      return;
    }

    logger.info("getByExecutionId: fetching execution trace spans", { executionId });

    // Retrieve correlated telemetry spans from OpenTelemetry buffer
    const spans = traceService.getSpansForExecution(executionId);
    sendJson(res, 200, { executionId, spans, total: spans.length });
  }

  /**
   * Lists recent execution spans across the system.
   *
   * @param _req - Inbound gateway HTTP request.
   * @param res - Outbound gateway HTTP response sending recent span records.
   */
  public listRecent(_req: GatewayRequest, res: GatewayResponse): void {
    logger.info("listRecent: listing recent execution trace spans");
    // Fetch recent span telemetry
    const spans = traceService.listRecentSpans();
    sendJson(res, 200, { items: spans, total: spans.length });
  }
}
