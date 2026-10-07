/**
 * @file apps/gateway/src/controllers/execution.controller.ts
 * @description HTTP controller mediating execution requests between HTTP and execution service.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { CreateExecutionSchema, ExecutionFilterSchema, ResumeExecutionSchema } from "@/validation";
import { ExecutionService } from "../services/execution.service";
import { ErrorCode, ROUTE_PARAMS, QUERY_PARAMS } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("ExecutionController"));

/**
 * Controller managing execution HTTP endpoints with strict tenant scoping.
 */
export class ExecutionController {
  constructor(private readonly service: ExecutionService = new ExecutionService()) {}

  /**
   * Dispatches a new execution run asynchronously.
   *
   * @param req - Inbound gateway HTTP request containing execution options payload.
   * @param res - Outbound gateway HTTP response sending accepted execution entity (202 Accepted).
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async createExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Validate request body against schema
    const dto = CreateExecutionSchema.parse(req.body);
    logger.info("createExecution: dispatching new execution run", {
      tenantId: req.context.tenantId,
      agentId: dto.agentId,
      mode: dto.mode,
      conversationId: dto.conversationId,
    });

    // Delegate dispatch to execution domain service
    const result = await this.service.createExecution(dto, req.context.tenantId);
    sendJson(res, 202, result);
  }

  /**
   * Queries executions with status and pagination filtering.
   *
   * @param req - Inbound gateway HTTP request containing filtering query params.
   * @param res - Outbound gateway HTTP response sending execution list.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async listExecutions(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    // Parse query params for filters (status, limit, cursor)
    const query = ExecutionFilterSchema.parse(parseQueryParams(req.url));
    logger.info("listExecutions: querying tenant executions", {
      tenantId: req.context.tenantId,
      status: query.status,
      limit: query.limit,
    });

    // Fetch executions scoped to authenticated tenant
    const result = await this.service.listExecutions(query, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Retrieves single execution state by identifier.
   *
   * @param req - Inbound gateway HTTP request containing executionId param.
   * @param res - Outbound gateway HTTP response sending execution record or 404 error.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async getExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const executionId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("getExecution: fetching execution state", {
      executionId,
      tenantId: req.context.tenantId,
    });

    // Fetch execution record from repository
    const result = await this.service.getExecutionById(executionId, req.context.tenantId);

    // Guard: Return 404 if execution does not exist or belongs to another tenant
    if (!result) {
      logger.warn("getExecution: execution not found", {
        executionId,
        tenantId: req.context.tenantId,
      });
      sendJson(res, 404, {
        error: { code: ErrorCode.NOT_FOUND, message: `Execution ${executionId} not found` },
      });
      return;
    }

    sendJson(res, 200, result);
  }

  /**
   * Cancels an active or pending execution.
   *
   * @param req - Inbound gateway HTTP request containing execution ID param.
   * @param res - Outbound gateway HTTP response confirming cancellation.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async cancelExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const executionId = req.params[ROUTE_PARAMS.ID] || "";
    logger.info("cancelExecution: cancelling execution run", {
      executionId,
      tenantId: req.context.tenantId,
    });

    // Send cancellation signal to worker / dispatcher
    const result = await this.service.cancelExecution(executionId, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Resumes a paused execution after human review or approval.
   *
   * @param req - Inbound gateway HTTP request containing execution ID and resumption payload.
   * @param res - Outbound gateway HTTP response delivering resumed execution entity.
   * @returns Promise resolving when HTTP response has been sent.
   */
  public async resumeExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const executionId = req.params[ROUTE_PARAMS.ID] || "";
    // Validate resume parameters
    const dto = ResumeExecutionSchema.parse(req.body);
    logger.info("resumeExecution: resuming execution run", {
      executionId,
      tenantId: req.context.tenantId,
    });

    // Dispatch resumption signal
    const result = await this.service.resumeExecution(executionId, dto, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Streams Server-Sent Events (SSE) tokens for an active execution.
   *
   * @param req - Inbound gateway HTTP request specifying executionId in params or query.
   * @param res - Outbound gateway HTTP response configured for text/event-stream.
   */
  public streamExecution(req: GatewayRequest, res: GatewayResponse): void {
    const params = parseQueryParams(req.url);
    const executionId = req.params[ROUTE_PARAMS.ID] || params[QUERY_PARAMS.EXECUTION_ID] || "";
    logger.info("streamExecution: opening SSE token stream", {
      executionId,
      tenantId: req.context.tenantId,
    });

    // Delegate stream management to service
    this.service.streamExecution(executionId, res);
  }
}
