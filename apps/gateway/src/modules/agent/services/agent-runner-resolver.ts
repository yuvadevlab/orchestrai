/**
 * @file apps/gateway/src/modules/agent/services/agent-runner-resolver.ts
 * @description Resolves an AgentDefinition and instantiated AgentLoop controller directly from a PostgreSQL Agent record.
 * @module apps/gateway/modules/agent
 */

import {
  AgentBuilder,
  AgentLoop,
  AgentStateMachine,
  runAgentUntilHalt,
  type AgentRunResult,
} from "@orchestrai/agent";
import {
  AgentDefinitionSchema,
  AgentStateSchema,
  type AgentDefinition,
  type AIMessage,
} from "@orchestrai/core";
import { ToolRegistry } from "@orchestrai/tools";
import { OllamaAdapter } from "@orchestrai/models";
import { getPrismaClient } from "@orchestrai/database";
import { resolveDbTenantId } from "@/modules/tenant-resolver";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("AgentRunnerResolver"));

/**
 * Encapsulated runner interface returned for an agent execution loop.
 */
export interface ResolvedAgentRunner {
  readonly definition: AgentDefinition;
  readonly loop: AgentLoop;
  readonly run: (
    initialHistory: readonly AIMessage[],
    maxTurns?: number,
  ) => Promise<AgentRunResult>;
}

/**
 * Resolves an agent from PostgreSQL and constructs an instantiated AgentRunner loop.
 *
 * @param agentId - Unique agent identifier UUID
 * @param tenantId - Tenant identifier
 * @param host - Ollama endpoint URL
 * @returns Instantiated ResolvedAgentRunner controller
 */
export async function resolveAgentRunner(
  agentId: string,
  tenantId: string,
  host: string = process.env.OLLAMA_HOST || "http://localhost:11434",
): Promise<ResolvedAgentRunner> {
  const db = getPrismaClient();
  const resolvedTenantId = await resolveDbTenantId(tenantId, db);

  const row = await db.agent.findFirst({
    where: { agentId, tenantId: resolvedTenantId, deletedAt: null },
  });

  if (!row) {
    throw new Error(
      `Agent "${agentId}" not found for tenant "${tenantId}". Please create the agent before running.`,
    );
  }

  // Parse raw model configuration or fall back to empty object
  const modelConfig =
    typeof row.modelConfig === "object" && row.modelConfig !== null
      ? (row.modelConfig as Record<string, unknown>)
      : {};

  // Build strictly-validated AgentDefinition using AgentBuilder
  const builder = new AgentBuilder()
    .withAgentId(row.agentId)
    .withTenantId(resolvedTenantId)
    .withName(row.name)
    .withSystemPrompt(row.systemPrompt || "You are an autonomous agent.")
    .withMode(row.mode as never)
    .withMaxSteps(row.maxSteps);

  if (row.description) {
    builder.withDescription(row.description);
  }

  const enabledTools = Array.isArray(row.enabledTools) ? (row.enabledTools as string[]) : [];
  if (enabledTools.length > 0) {
    builder.withTools(enabledTools);
  }

  const definition = AgentDefinitionSchema.parse({
    agentId: row.agentId,
    tenantId: resolvedTenantId,
    scope: "tenant",
    name: row.name,
    description: row.description ?? undefined,
    mode: row.mode,
    systemPrompt: row.systemPrompt || "You are an autonomous agent.",
    modelConfig: {
      modelName: typeof modelConfig.model === "string" ? modelConfig.model : undefined,
      temperature: typeof modelConfig.temperature === "number" ? modelConfig.temperature : 0.7,
      contextWindow:
        typeof modelConfig.contextWindow === "number" ? modelConfig.contextWindow : 8192,
    },
    capabilities: [],
    enabledTools,
    maxSteps: row.maxSteps,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

  const selectedModel =
    definition.modelConfig.modelName || process.env.DEFAULT_MODEL_NAME || "default";

  const adapter = await OllamaAdapter.create({
    host,
    timeoutMs: 60_000,
    defaultModel: selectedModel,
  });

  const tools = new ToolRegistry();
  const state = new AgentStateMachine(
    AgentStateSchema.parse({
      executionId: crypto.randomUUID(),
      agentId: definition.agentId,
      mode: definition.mode,
      maxSteps: definition.maxSteps,
    }),
  );

  const loop = new AgentLoop({
    definition,
    state,
    adapter,
    tools,
  });

  logger.info("Resolved and instantiated AgentRunner from DB record", {
    agentId: row.agentId,
    name: row.name,
    mode: row.mode,
  });

  return {
    definition,
    loop,
    run: (initialHistory: readonly AIMessage[], maxTurns?: number) =>
      runAgentUntilHalt(loop, initialHistory, maxTurns ?? definition.maxSteps),
  };
}
