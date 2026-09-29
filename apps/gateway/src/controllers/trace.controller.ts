/**
 * @file apps/gateway/src/controllers/trace.controller.ts
 * @description HTTP controller mediating OpenTelemetry execution traces and span inspection.
 * @module apps/gateway/controllers
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson } from "@/routes/http-helpers";
import { traceService } from "@/services/trace.service";

/**
 * Controller managing trace inspection endpoints.
 */
export class TraceController {
  /**
   * Retrieves spans correlated with an execution identifier.
   */
  public getByExecutionId(req: GatewayRequest, res: GatewayResponse): void {
    const executionId = req.params?.executionId;
    if (!executionId) {
      sendJson(res, 400, { error: { message: "Execution ID required" } });
      return;
    }
    const spans = traceService.getSpansForExecution(executionId);
    sendJson(res, 200, { executionId, spans, total: spans.length });
  }

  /**
   * Lists recent execution spans across the system.
   */
  public listRecent(_req: GatewayRequest, res: GatewayResponse): void {
    const spans = traceService.listRecentSpans();
    sendJson(res, 200, { items: spans, total: spans.length });
  }
}
