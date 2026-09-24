/**
 * @file packages/sdk/src/resources/models.ts
 * @description Model resource managing LLM providers, endpoints, and fallback cascades.
 */

import { ResourceBase } from "./resource-base";

export interface ModelProvider {
  id: string;
  name: string;
  provider: string;
  endpoint?: string;
  status: string;
  latency: string;
}

export interface CreateModelParams {
  name: string;
  provider: string;
  endpoint?: string;
  apiKey?: string;
}

/**
 * Resource client for configuring LLM model providers and routing rules.
 */
export class ModelsResource extends ResourceBase {
  /**
   * Lists configured LLM model providers.
   */
  public async list(): Promise<{ items: ModelProvider[] }> {
    return this.http.request<{ items: ModelProvider[] }>("/api/v1/models");
  }

  /**
   * Retrieves a model provider configuration by identifier.
   */
  public async get(modelId: string): Promise<ModelProvider> {
    return this.http.request<ModelProvider>(`/api/v1/models/${encodeURIComponent(modelId)}`);
  }

  /**
   * Registers a new LLM model provider endpoint.
   */
  public async create(params: CreateModelParams): Promise<ModelProvider> {
    return this.http.request<ModelProvider>("/api/v1/models", {
      method: "POST",
      body: params,
    });
  }

  /**
   * Removes a model provider endpoint by identifier.
   */
  public async delete(modelId: string): Promise<{ success: boolean; modelId: string }> {
    return this.http.request<{ success: boolean; modelId: string }>(
      `/api/v1/models/${encodeURIComponent(modelId)}`,
      { method: "DELETE" },
    );
  }
}
