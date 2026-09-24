/**
 * @file packages/sdk/src/resources/agents.ts
 * @description Agent resource managing definition registration and execution dispatch.
 */

import type { Agent, Execution, PaginatedList } from "@/types";
import { ResourceBase } from "./resource-base";
import { ExecutionHandle } from "./execution-handle";
import type { CostBudgetOptions } from "@/types";

export interface CreateAgentParams {
  name: string;
  description?: string;
  mode?: string;
  systemPrompt: string;
  modelConfig?: {
    provider: string;
    modelName: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
  enabledTools?: string[];
  maxSteps?: number;
}

export interface RunAgentParams {
  agent: string;
  mode?: string;
  input: string;
  conversationId?: string;
  history?: Array<{ role: string; content: string }>;
  variables?: Record<string, unknown>;
  budget?: CostBudgetOptions;
}

/**
 * Resource client for querying, registering, and running agents.
 */
export class AgentsResource extends ResourceBase {
  /**
   * Lists registered agents.
   */
  public async list(filter?: { limit?: number; cursor?: string }): Promise<PaginatedList<Agent>> {
    return this.http.request<PaginatedList<Agent>>("/api/v1/agents", { params: filter });
  }

  /**
   * Retrieves an agent definition by identifier.
   */
  public async get(agentId: string): Promise<Agent> {
    return this.http.request<Agent>(`/api/v1/agents/${encodeURIComponent(agentId)}`);
  }

  /**
   * Registers a new agent configuration.
   */
  public async create(params: CreateAgentParams): Promise<Agent> {
    return this.http.request<Agent>("/api/v1/agents", {
      method: "POST",
      body: params,
    });
  }

  /**
   * Updates an existing agent configuration.
   */
  public async update(agentId: string, params: Partial<CreateAgentParams>): Promise<Agent> {
    return this.http.request<Agent>(`/api/v1/agents/${encodeURIComponent(agentId)}`, {
      method: "PUT",
      body: params,
    });
  }

  /**
   * Dispatches a new execution run with budget guards and returns a controllable handle.
   */
  public async run(params: RunAgentParams): Promise<ExecutionHandle> {
    const effectiveBudget = {
      ...this.options.defaultBudget,
      ...params.budget,
    };

    const initial = await this.http.request<Execution>("/api/v1/executions", {
      method: "POST",
      body: {
        agentId: params.agent,
        conversationId: params.conversationId,
        mode: params.mode,
        input: params.input,
        history: params.history,
        variables: {
          ...params.variables,
          budget: effectiveBudget,
        },
      },
    });

    return new ExecutionHandle(initial, this.http, this.options.realtimeUrl);
  }
}
