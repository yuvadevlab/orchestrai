/**
 * @file packages/sdk/src/resources/tools.ts
 * @description Tool resource managing runtime tool plugins and sandbox registrations.
 */

import { ResourceBase } from "./resource-base";

export interface ToolDefinition {
  name: string;
  description: string;
  category: string;
  author: string;
  isCustom?: boolean;
}

export interface CreateToolParams {
  name: string;
  description: string;
  category?: string;
  code?: string;
}

/**
 * Resource client for registering and managing custom execution tools.
 */
export class ToolsResource extends ResourceBase {
  /**
   * Lists registered tool plugins in the runtime environment.
   */
  public async list(): Promise<{ items: ToolDefinition[] }> {
    return this.http.request<{ items: ToolDefinition[] }>("/api/v1/tools");
  }

  /**
   * Retrieves a tool registration by name.
   */
  public async get(name: string): Promise<ToolDefinition> {
    return this.http.request<ToolDefinition>(`/api/v1/tools/${encodeURIComponent(name)}`);
  }

  /**
   * Registers a new custom execution tool.
   */
  public async create(params: CreateToolParams): Promise<ToolDefinition> {
    return this.http.request<ToolDefinition>("/api/v1/tools", {
      method: "POST",
      body: params,
    });
  }

  /**
   * Unregisters a tool definition by name.
   */
  public async delete(name: string): Promise<{ success: boolean; name: string }> {
    return this.http.request<{ success: boolean; name: string }>(
      `/api/v1/tools/${encodeURIComponent(name)}`,
      { method: "DELETE" },
    );
  }
}
