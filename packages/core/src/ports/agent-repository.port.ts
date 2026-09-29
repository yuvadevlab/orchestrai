/**
 * @file packages/core/src/ports/agent-repository.port.ts
 * @description Abstract storage port for agent specialist definitions, capabilities, and system instructions.
 * @module @orchestrai/core/ports
 */

import type { PaginatedResult } from "@orchestrai/shared-types";

/**
 * Domain entity representing an autonomous specialist agent.
 */
export interface AgentEntity {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly defaultModel?: string;
  readonly defaultMode?: string;
  readonly tenantId?: string;
  readonly capabilities: readonly string[];
  readonly toolBindings: readonly string[];
  readonly isEnabled: boolean;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Input DTO for registering a new agent definition.
 */
export interface CreateAgentEntityData {
  readonly id?: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly defaultModel?: string;
  readonly defaultMode?: string;
  readonly tenantId?: string;
  readonly capabilities?: readonly string[];
  readonly toolBindings?: readonly string[];
  readonly isEnabled?: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Filter criteria for querying agent definitions.
 */
export interface ListAgentsFilter {
  readonly tenantId?: string;
  readonly isEnabled?: boolean;
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Abstract repository port isolating agent catalogue persistence.
 */
export interface IAgentRepository {
  /**
   * Retrieves an agent by unique ID.
   */
  findById(id: string, tenantId?: string): Promise<AgentEntity | null>;

  /**
   * Retrieves an agent by its unique URL slug.
   */
  findBySlug(slug: string, tenantId?: string): Promise<AgentEntity | null>;

  /**
   * Queries paginated agents.
   */
  list(filter: ListAgentsFilter): Promise<PaginatedResult<AgentEntity>>;

  /**
   * Persists a new agent configuration.
   */
  create(data: CreateAgentEntityData): Promise<AgentEntity>;

  /**
   * Updates an existing agent.
   */
  update(id: string, patch: Partial<CreateAgentEntityData>): Promise<AgentEntity>;

  /**
   * Deletes or disables an agent definition.
   */
  delete(id: string): Promise<boolean>;
}
