/**
 * @file packages/sdk/src/resources/executions.ts
 * @description Execution resource querying and controlling agent execution instances.
 */

import type { Execution, PaginatedList, StreamEvent } from "@/types";
import { ResourceBase } from "./resource-base";
import { StreamIterator } from "@/streaming";
import { ExecutionStatus } from "@orchestrai/shared-types";

export interface ExecutionFilter {
  agentId?: string;
  conversationId?: string;
  status?: ExecutionStatus;
  limit?: number;
  cursor?: string;
}

/**
 * Resource client for inspecting, cancelling, and resuming executions.
 */
export class ExecutionsResource extends ResourceBase {
  /**
   * Retrieves single execution state.
   */
  public async get(executionId: string): Promise<Execution> {
    return this.http.request<Execution>(`/api/v1/executions/${encodeURIComponent(executionId)}`);
  }

  /**
   * Lists executions matching optional query criteria.
   */
  public async list(filter?: ExecutionFilter): Promise<PaginatedList<Execution>> {
    return this.http.request<PaginatedList<Execution>>("/api/v1/executions", {
      params: filter as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Cancels an active or pending execution run.
   */
  public async cancel(executionId: string): Promise<Execution> {
    return this.http.request<Execution>(
      `/api/v1/executions/${encodeURIComponent(executionId)}/cancel`,
      {
        method: "POST",
      },
    );
  }

  /**
   * Resumes a paused execution run.
   */
  public async resume(
    executionId: string,
    options: { action?: "RESUME" | "RETRY"; feedback?: string } = {},
  ): Promise<Execution> {
    return this.http.request<Execution>(
      `/api/v1/executions/${encodeURIComponent(executionId)}/resume`,
      {
        method: "POST",
        body: options,
      },
    );
  }

  /**
   * Connects to SSE streaming endpoint for an execution run.
   */
  public async stream(executionId: string): Promise<StreamIterator<StreamEvent>> {
    const rawStream = await this.http.requestStream(
      `/api/v1/stream?executionId=${encodeURIComponent(executionId)}`,
    );
    return new StreamIterator(rawStream);
  }
}
