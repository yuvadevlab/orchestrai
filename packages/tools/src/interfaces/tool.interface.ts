/**
 * @file packages/tools/src/interfaces/tool.interface.ts
 * @description Master interface and execution context for OrchestrAI tools.
 *
 * ─── Why Tools Matter to an AI Engineer ────────────────────────────
 * An LLM by itself is a "brain in a jar" — it has deep reasoning and language
 * capabilities, but zero direct access to the outside world.
 *
 * Tools bridge that gap:
 * 1. The model sees tool descriptions and parameters formatted as JSON Schema.
 * 2. When the model decides to use a tool, it outputs a `tool_call` token sequence.
 * 3. The orchestrator intercepts that call, validates the arguments with Zod,
 *    and invokes the actual TypeScript implementation (`execute()`).
 * 4. The orchestrator feeds the output back to the model as a `tool_result` message.
 *
 * `ITool` defines the standard contract that EVERY executable tool must implement.
 * ───────────────────────────────────────────────────────────────────
 */

import type { z } from "zod";
import type { ToolDefinition } from "@orchestrai/core";

/**
 * Environmental context provided to a tool during its execution run.
 * Contains execution tracing metadata, cancellation handles, and workspace sandbox paths.
 */
export interface ToolExecutionContext {
  /** Unique ID of the executing workflow run */
  readonly executionId?: string;

  /** Unique ID of the agent that dispatched this tool call */
  readonly agentId?: string;

  /**
   * Root directory of the permitted workspace sandbox.
   * File-accessing tools MUST verify operations do not escape this path.
   */
  readonly workspaceRoot?: string;

  /**
   * Cooperative cancellation signal passed from the runner or timeout timer.
   * Long-running tools should check `signal.aborted` or pass it to fetch/fs.
   */
  readonly abortSignal?: AbortSignal;

  /**
   * Structured key-value metadata for telemetry, logging, and audit tracking.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Universal interface for all executable tools in the OrchestrAI platform.
 *
 * Generic over:
 * - `TInput`: Type of the parsed, validated arguments object.
 * - `TOutput`: Type of the result value produced by the tool.
 *
 * @example
 * ```ts
 * export class CalculatorTool implements ITool<{ a: number; b: number }, number> {
 *   public readonly definition: ToolDefinition = { ... };
 *   public readonly inputSchema = z.object({ a: z.number(), b: z.number() });
 *   async execute({ a, b }: { a: number; b: number }): Promise<number> {
 *     return a + b;
 *   }
 * }
 * ```
 */
export interface ITool<TInput = Record<string, unknown>, TOutput = unknown> {
  /**
   * Declarative metadata describing name, description, permission tier,
   * timeout, and JSON Schema parameters consumed by the LLM.
   */
  readonly definition: ToolDefinition;

  /**
   * Zod schema used by the runner to strictly validate arguments
   * before invoking `execute()`. Guards against LLM hallucinated parameters.
   * Accepts any raw input type (such as undefined fields with defaults)
   * that parses to TInput.
   */
  readonly inputSchema: z.ZodType<TInput, z.ZodTypeDef, unknown>;

  /**
   * Executes the tool logic within the given execution context.
   *
   * @param args - Validated arguments matching `inputSchema`.
   * @param context - Execution environment containing sandbox path and abort signals.
   * @returns Promise resolving to the tool output payload.
   * @throws Error on tool runtime failure. The runner catches this and creates a ToolResult.
   */
  execute(args: TInput, context: ToolExecutionContext): Promise<TOutput>;
}
