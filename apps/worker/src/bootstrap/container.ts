/**
 * @file apps/worker/src/bootstrap/container.ts
 * @description Dependency injection container wiring Redis, runtime engine, tools, and workers.
 */

import type { Redis } from "ioredis";
import { createRedisConnection, closeRedisConnection } from "@orchestrai/queue";
import { OrchestrAIRuntime } from "@orchestrai/runtime";
import { ToolRegistry, ReadFileTool } from "@orchestrai/tools";
import { ModelRegistry, createAdapter } from "@orchestrai/models";
import { AgentMode, ModelProvider } from "@orchestrai/shared-types";
import type { AgentDefinition, AgentId, TenantId } from "@orchestrai/core";
import type { WorkerConfig } from "./config";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import {
  AgentExecutionWorker,
  ToolExecutionWorker,
  DeadLetterWorker,
  WorkerManager,
  type BaseWorker,
} from "@/workers";

/**
 * Encapsulated worker runtime container with managed services and workers.
 */
export interface WorkerContainer {
  readonly config: WorkerConfig;
  readonly redis: Redis;
  readonly runtime: OrchestrAIRuntime;
  readonly toolRegistry: ToolRegistry;
  readonly modelRegistry: ModelRegistry;
  readonly workerManager: WorkerManager;
  readonly shutdown: () => Promise<void>;
}

/**
 * Initializes and wires all service dependencies for the background worker daemon.
 *
 * @param config - Validated worker environment configuration.
 * @returns Fully assembled WorkerContainer.
 */
export async function createWorkerContainer(config: WorkerConfig): Promise<WorkerContainer> {
  // 1. Establish dedicated Redis client connection for BullMQ workers
  const redis = createRedisConnection({
    url: config.redisUrl,
    host: config.redisHost,
    port: config.redisPort,
    password: config.redisPassword,
    db: config.redisDb,
  });

  // 2. Initialize tool registry with core builtin tools
  const toolRegistry = new ToolRegistry();
  toolRegistry.register(new ReadFileTool());

  // 3. Initialize model registry and default local adapter
  const modelRegistry = new ModelRegistry();
  const logger = loggerWithConfig(new Logger("WorkerContainer"));
  try {
    const provider = (config.defaultModelProvider?.toLowerCase() ||
      ModelProvider.OLLAMA) as ModelProvider;
    const defaultAdapter = await createAdapter(provider, {
      host: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || "",
      defaultModel: config.defaultModelName,
    });

    modelRegistry.register({
      identifier: {
        provider,
        modelName: config.defaultModelName,
        contextWindow: config.defaultContextWindow,
      },
      capabilities: {
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false,
        supportsThinking: false,
        supportsJsonMode: true,
        maxOutputTokens: config.defaultMaxOutputTokens,
      },
      adapter: defaultAdapter,
    });
  } catch (error) {
    // If provider is not configured/running locally, register warning but don't halt bootstrap
    logger.warn(
      "[WorkerContainer] Warning: Failed to pre-warm default model adapter",
      error instanceof Error ? error.message : String(error),
    );
  }

  // 4. Instantiate DAG execution runtime
  const runtime = new OrchestrAIRuntime();

  // 5. Default agent definition resolver
  const resolveAgentDefinition = async (
    agentId: string,
    tenantId: string,
  ): Promise<AgentDefinition> => {
    return {
      agentId: agentId as AgentId,
      tenantId: tenantId as TenantId,
      name: `Agent-${agentId}`,
      description: "Asynchronous task agent",
      mode: AgentMode.ACT,
      systemPrompt: "You are an AI assistant orchestrating background tasks.",
      modelConfig: {
        temperature: config.defaultAgentTemperature,
      },
      enabledTools: ["read_file"],
      maxSteps: config.defaultMaxSteps,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  // 6. Wire agent execution worker
  const agentWorker = new AgentExecutionWorker({
    connection: redis,
    concurrency: config.agentConcurrency,
    dependencies: {
      runtime,
      toolRegistry,
      resolveModelAdapter: (provider?: ModelProvider, modelName?: string) => {
        const entry = modelRegistry.resolve(provider, modelName);
        return entry.adapter;
      },
      resolveAgentDefinition,
    },
  });

  // 7. Wire tool execution worker
  const toolWorker = new ToolExecutionWorker({
    connection: redis,
    toolRegistry,
    concurrency: config.toolConcurrency,
  });

  // 8. Wire dead letter worker
  const deadLetterWorker = new DeadLetterWorker({
    connection: redis,
    concurrency: config.maintenanceConcurrency,
  });

  // 9. Coordinate all workers in WorkerManager
  const workerManager = new WorkerManager();
  workerManager
    .register(agentWorker as unknown as BaseWorker<unknown, unknown>)
    .register(toolWorker as unknown as BaseWorker<unknown, unknown>)
    .register(deadLetterWorker as unknown as BaseWorker<unknown, unknown>);

  // 10. Clean shutdown hook
  const shutdown = async (): Promise<void> => {
    await workerManager.stopAll();
    await closeRedisConnection(redis);
  };

  return {
    config,
    redis,
    runtime,
    toolRegistry,
    modelRegistry,
    workerManager,
    shutdown,
  };
}
