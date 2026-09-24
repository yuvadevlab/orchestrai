/**
 * @file packages/sdk/src/resources/workflows.ts
 * @description Workflow resource managing DAG pipeline graphs and execution triggers.
 */

import { ResourceBase } from "./resource-base";

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  stepsCount: number;
  triggerType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowParams {
  name: string;
  description?: string;
  triggerType?: string;
  nodes?: unknown[];
  edges?: unknown[];
}

/**
 * Resource client for managing workflow DAG pipeline definitions.
 */
export class WorkflowsResource extends ResourceBase {
  /**
   * Lists configured workflow DAG pipelines.
   */
  public async list(): Promise<{ items: Workflow[] }> {
    return this.http.request<{ items: Workflow[] }>("/api/v1/workflows");
  }

  /**
   * Retrieves a workflow definition by identifier.
   */
  public async get(workflowId: string): Promise<Workflow> {
    return this.http.request<Workflow>(`/api/v1/workflows/${encodeURIComponent(workflowId)}`);
  }

  /**
   * Creates a new workflow DAG pipeline configuration.
   */
  public async create(params: CreateWorkflowParams): Promise<Workflow> {
    return this.http.request<Workflow>("/api/v1/workflows", {
      method: "POST",
      body: params,
    });
  }

  /**
   * Updates an existing workflow DAG pipeline.
   */
  public async update(
    workflowId: string,
    params: Partial<CreateWorkflowParams>,
  ): Promise<Workflow> {
    return this.http.request<Workflow>(`/api/v1/workflows/${encodeURIComponent(workflowId)}`, {
      method: "PUT",
      body: params,
    });
  }

  /**
   * Deletes a workflow definition by identifier.
   */
  public async delete(workflowId: string): Promise<{ success: boolean; workflowId: string }> {
    return this.http.request<{ success: boolean; workflowId: string }>(
      `/api/v1/workflows/${encodeURIComponent(workflowId)}`,
      { method: "DELETE" },
    );
  }
}
