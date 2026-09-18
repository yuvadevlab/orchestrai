/**
 * @file packages/agent/src/builder/agent-builder.ts
 * @description Fluent builder for constructing and validating AgentDefinition instances.
 *
 * ─── The Builder Pattern in AI Agent Systems (Learning note) ───────
 * `AgentDefinition` has many interrelated configuration fields:
 * - Model provider and hyper-parameters
 * - Operating mode (CHAT, PLAN, ACT, AUTO)
 * - Tool permissions and authorizations
 * - Max execution steps and system personas
 *
 * `AgentBuilder` provides a fluent, ergonomic API that ensures all values
 * are validated against `AgentDefinitionSchema` before the agent is registered.
 * ───────────────────────────────────────────────────────────────────
 */

import crypto from "node:crypto";
import { AgentMode, ModelProvider } from "@orchestrai/shared-types";
import {
  AgentDefinitionSchema,
  type AgentDefinition,
  type AgentModelConfig,
} from "@orchestrai/core";

/**
 * Fluent builder for creating strictly-validated AgentDefinition records.
 */
export class AgentBuilder {
  private agentId: string = crypto.randomUUID();
  private tenantId: string = crypto.randomUUID();
  private name = "Default Agent";
  private description?: string;
  private mode: AgentMode = AgentMode.AUTO;
  private systemPrompt = "You are a helpful and precise AI agent.";
  private modelConfig: AgentModelConfig = {
    provider: ModelProvider.OLLAMA,
    modelName: "qwen2.5:7b",
    temperature: 0.7,
  };
  private enabledTools: string[] = [];
  private maxSteps = 25;

  /**
   * Sets the agent's unique UUID.
   */
  public withAgentId(agentId: string): this {
    this.agentId = agentId;
    return this;
  }

  /**
   * Sets the tenant identifier.
   */
  public withTenantId(tenantId: string): this {
    this.tenantId = tenantId;
    return this;
  }

  /**
   * Sets the human-readable display name.
   */
  public withName(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Sets an optional functional description.
   */
  public withDescription(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * Sets the operating mode strategy.
   */
  public withMode(mode: AgentMode): this {
    this.mode = mode;
    return this;
  }

  /**
   * Sets the foundational system prompt persona.
   */
  public withSystemPrompt(prompt: string): this {
    this.systemPrompt = prompt;
    return this;
  }

  /**
   * Sets the model selection and sampling parameters.
   */
  public withModel(
    config: Partial<AgentModelConfig> & { provider: ModelProvider; modelName: string },
  ): this {
    this.modelConfig = {
      temperature: 0.7,
      ...config,
    };
    return this;
  }

  /**
   * Sets the list of authorized tool names.
   */
  public withTools(toolNames: string[]): this {
    this.enabledTools = [...toolNames];
    return this;
  }

  /**
   * Appends an authorized tool name to the agent.
   */
  public addTool(toolName: string): this {
    if (!this.enabledTools.includes(toolName)) {
      this.enabledTools.push(toolName);
    }
    return this;
  }

  /**
   * Sets maximum step cycles before forced termination.
   */
  public withMaxSteps(maxSteps: number): this {
    this.maxSteps = maxSteps;
    return this;
  }

  /**
   * Validates and returns the completed AgentDefinition.
   *
   * @throws {z.ZodError} if any field violates schema constraints.
   */
  public build(): AgentDefinition {
    return AgentDefinitionSchema.parse({
      agentId: this.agentId,
      tenantId: this.tenantId,
      name: this.name,
      description: this.description,
      mode: this.mode,
      systemPrompt: this.systemPrompt,
      modelConfig: this.modelConfig,
      enabledTools: this.enabledTools,
      maxSteps: this.maxSteps,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
