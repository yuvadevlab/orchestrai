/**
 * @file apps/gateway/src/services/eval.service.ts
 * @description Domain evaluation service running capability benchmarks against model adapters.
 * @module apps/gateway/services
 */

import { randomUUID } from "node:crypto";
import {
  EvaluationRunner,
  EvaluationDatasetSchema,
  type EvaluationDataset,
  type BenchmarkResult,
} from "@orchestrai/eval";
import { OllamaAdapter } from "@orchestrai/models";
import { MessageRole, BenchmarkDatasetName } from "@orchestrai/shared-types";
import { extractToolCall } from "@/modules/streaming/autonomous-agent-runner";

/**
 * Built-in benchmark test suites validated against EvaluationDatasetSchema.
 */
const BUILTIN_BENCHMARK_DATASETS: readonly EvaluationDataset[] = [
  EvaluationDatasetSchema.parse({
    name: BenchmarkDatasetName.AUTONOMOUS_TOOL_CALLING,
    description:
      "Evaluates model capability to correctly parse instructions and emit structured tool_call JSON blocks",
    items: [
      {
        id: randomUUID(),
        prompt: "Please inspect package.json to see what dependencies are installed.",
        expectedTools: ["read_file"],
        expectedOutputSubstring: "package.json",
        maxSteps: 3,
      },
      {
        id: randomUUID(),
        prompt: "List the files and directories inside the current repository root.",
        expectedTools: ["list_dir"],
        maxSteps: 3,
      },
    ],
  }),
];

/**
 * Service orchestrating capability benchmark evaluation suites.
 */
export class EvalService {
  private readonly runner = new EvaluationRunner();

  /**
   * Retrieves registered benchmark datasets.
   */
  public getAvailableDatasets(): readonly EvaluationDataset[] {
    return BUILTIN_BENCHMARK_DATASETS;
  }

  /**
   * Executes a benchmark suite against a target model.
   *
   * @param datasetName - Benchmark dataset identifier
   * @param modelName - Target model name
   * @returns Benchmark scoring metrics
   */
  public async runBenchmark(
    datasetName: string = BenchmarkDatasetName.AUTONOMOUS_TOOL_CALLING,
    modelName?: string,
  ): Promise<BenchmarkResult> {
    const dataset =
      BUILTIN_BENCHMARK_DATASETS.find((d) => d.name === datasetName) ??
      BUILTIN_BENCHMARK_DATASETS[0]!;

    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const selectedModel =
      modelName ||
      process.env.DEFAULT_MODEL_NAME ||
      (() => {
        throw new Error("No model specified and DEFAULT_MODEL_NAME is not configured");
      })();

    const adapter = await OllamaAdapter.create({
      host,
      timeoutMs: 60000,
      defaultModel: selectedModel,
    });

    return this.runner.runEvaluation(dataset, async (prompt: string) => {
      const start = Date.now();
      const executedTools: string[] = [];

      const stream = adapter.stream({
        model: selectedModel,
        messages: [
          {
            id: randomUUID(),
            role: MessageRole.USER,
            content: prompt,
            metadata: {},
            createdAt: new Date(),
          },
        ],
        temperature: 0.1,
        stream: true,
      });

      let fullOutput = "";
      for await (const chunk of stream) {
        if (chunk.delta) {
          fullOutput += chunk.delta;
        }
      }

      const toolCall = extractToolCall(fullOutput);
      if (toolCall) {
        executedTools.push(toolCall.tool);
      }

      return {
        outputText: fullOutput,
        executedTools,
        durationMs: Date.now() - start,
      };
    });
  }
}

export const evalService = new EvalService();
