/**
 * @file apps/gateway/src/controllers/execution.controller.ts
 * @description HTTP controller mediating execution requests between HTTP and execution service.
 */

import type { GatewayRequest, GatewayResponse } from "@/routes/http-types";
import { sendJson, parseQueryParams } from "@/routes/http-helpers";
import { CreateExecutionSchema, ExecutionFilterSchema, ResumeExecutionSchema } from "@/validation";
import { ExecutionService } from "@/services";

/**
 * Controller managing execution HTTP endpoints.
 */
export class ExecutionController {
  constructor(private readonly service: ExecutionService = new ExecutionService()) {}

  /**
   * Dispatches a new execution run.
   */
  public async createExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const dto = CreateExecutionSchema.parse(req.body);
    const result = await this.service.createExecution(dto, req.context.tenantId);
    sendJson(res, 202, result);
  }

  /**
   * Queries executions with filtering.
   */
  public async listExecutions(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const query = ExecutionFilterSchema.parse(parseQueryParams(req.url));
    const result = await this.service.listExecutions(query, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Retrieves single execution state.
   */
  public async getExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const executionId = req.params.id || "";
    const result = await this.service.getExecutionById(executionId, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Cancels an execution.
   */
  public async cancelExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const executionId = req.params.id || "";
    const result = await this.service.cancelExecution(executionId, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Resumes a paused execution.
   */
  public async resumeExecution(req: GatewayRequest, res: GatewayResponse): Promise<void> {
    const executionId = req.params.id || "";
    const dto = ResumeExecutionSchema.parse(req.body);
    const result = await this.service.resumeExecution(executionId, dto, req.context.tenantId);
    sendJson(res, 200, result);
  }

  /**
   * Streams SSE tokens for an active execution.
   */
  public streamExecution(req: GatewayRequest, res: GatewayResponse): void {
    const params = parseQueryParams(req.url);
    const executionId = req.params.id || params.executionId || "";
    this.service.streamExecution(executionId, res);
  }
}
