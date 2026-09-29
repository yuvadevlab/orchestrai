/**
 * @file packages/sdk/src/resources/admin.ts
 * @description Operator Control Plane resource client for platform models, providers, and budgets.
 * @module @orchestrai/sdk/resources
 */

import type { LlmProviderRecord, LlmModelRecord, TenantBudgetInfo } from "@orchestrai/shared-types";
import { ResourceBase } from "./resource-base";

export type { TenantBudgetInfo };

/**
 * Control Plane management resource for platform operators and cluster administration.
 */
export class AdminResource extends ResourceBase {
  /**
   * Base path prefix for control-plane endpoints.
   */
  private readonly adminPrefix = "/platform";

  /**
   * Lists all configured LLM providers across the cluster.
   */
  public async listProviders(): Promise<LlmProviderRecord[]> {
    return this.http.request<LlmProviderRecord[]>(`${this.adminPrefix}/llm-provider`);
  }

  /**
   * Registers or updates an LLM provider configuration.
   */
  public async saveProvider(data: Partial<LlmProviderRecord>): Promise<LlmProviderRecord> {
    return this.http.request<LlmProviderRecord>(`${this.adminPrefix}/llm-provider`, {
      method: "POST",
      body: data,
    });
  }

  /**
   * Lists all LLM models registered under a provider or across all providers.
   */
  public async listModels(providerId?: string): Promise<LlmModelRecord[]> {
    return this.http.request<LlmModelRecord[]>(`${this.adminPrefix}/llm-model`, {
      params: providerId ? { providerId } : undefined,
    });
  }

  /**
   * Registers a new model deployment in the cluster catalog.
   */
  public async saveModel(data: Partial<LlmModelRecord>): Promise<LlmModelRecord> {
    return this.http.request<LlmModelRecord>(`${this.adminPrefix}/llm-model`, {
      method: "POST",
      body: data,
    });
  }

  /**
   * Queries real-time token spend and quota status for a tenant partition.
   */
  public async getTenantBudget(tenantId: string): Promise<TenantBudgetInfo> {
    return this.http.request<TenantBudgetInfo>(
      `${this.adminPrefix}/budgets/${encodeURIComponent(tenantId)}`,
    );
  }

  /**
   * Updates maximum spending limits for a tenant.
   */
  public async updateTenantBudget(
    tenantId: string,
    patch: { maxMonthlySpendUsd: number },
  ): Promise<TenantBudgetInfo> {
    return this.http.request<TenantBudgetInfo>(
      `${this.adminPrefix}/budgets/${encodeURIComponent(tenantId)}`,
      {
        method: "PUT",
        body: patch,
      },
    );
  }
}
