/**
 * @file packages/tools/src/runner/tool-runner.ts
 * @description Safe sandboxed execution boundary for invoking OrchestrAI tools.
 *
 * ─── The Tool Sandbox Pattern (Learning note for AI Engineers) ───────
 * In production AI systems, LLMs will occasionally hallucinate invalid parameters,
 * tools will experience network timeouts, and APIs will throw unexpected errors.
 *
 * The ToolRunner enforces 4 critical safety guarantees:
 * 1. Input Validation: Parses raw arguments with Zod before running code.
 *    If invalid, returns a descriptive error that the LLM can use to self-correct.
 * 2. Permission Clearance: Checks agent clearance and blocks unauthorized actions.
 * 3. Timeout Containment: Kills operations that exceed `timeoutMs`.
 * 4. Error Containment: NEVER allows an uncaught exception to crash the worker process.
 *    Always captures diagnostics into a clean, structured `ToolResult`.
 * ───────────────────────────────────────────────────────────────────
 */

import { performance } from "node:perf_hooks";
import { ToolResultStatus, ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ToolCallId, ToolResult } from "@orchestrai/core";
import type { ITool, ToolExecutionContext } from "@/interfaces";
import { evaluateToolPermission } from "@/security";

/**
 * Options configuring the safe execution of a tool.
 */
export interface ToolRunnerOptions {
  /** Execution context metadata (sandbox root, executionId, etc.) */
  readonly context?: ToolExecutionContext;

  /**
   * Clearance level granted to the executing agent.
   * Defaults to ToolPermissionLevel.READ_ONLY for maximum safety.
   */
  readonly agentClearance?: ToolPermissionLevel;

  /**
   * Optional custom timeout override in milliseconds.
   * If omitted, the tool's `definition.timeoutMs` is used.
   */
  readonly timeoutMs?: number;
}

/**
 * Invokes an ITool within a sandboxed safety boundary.
 *
 * Catches all validation errors, timeouts, and runtime exceptions,
 * returning a guaranteed `ToolResult` without throwing.
 *
 * @param tool - The registered ITool instance to execute.
 * @param callId - Unique UUID of the model's tool call invocation.
 * @param rawArgs - Raw arguments object emitted by the model.
 * @param options - Runner configuration options (clearance, context, timeout).
 * @returns Promise resolving to a standardized ToolResult.
 */
export async function executeTool(
  tool: ITool,
  callId: ToolCallId,
  rawArgs: Record<string, unknown>,
  options: ToolRunnerOptions = {},
): Promise<ToolResult> {
  const startTime = performance.now();
  const toolName = tool.definition.name;
  const clearance = options.agentClearance ?? ToolPermissionLevel.READ_ONLY;

  // ─── 1. Permission Gate Check ───────────────────────────────────────
  const permCheck = evaluateToolPermission(tool.definition.permissionLevel, clearance);
  if (!permCheck.isAllowed) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      callId,
      toolName,
      status: ToolResultStatus.ERROR,
      error: `Policy violation: ${permCheck.denialReason}`,
      durationMs,
      timestamp: new Date(),
    };
  }

  // ─── 2. Input Argument Validation ───────────────────────────────────
  const parsedArgs = tool.inputSchema.safeParse(rawArgs);
  if (!parsedArgs.success) {
    const durationMs = Math.round(performance.now() - startTime);
    const issues = parsedArgs.error.issues
      .map((i) => `Path "${i.path.join(".")}": ${i.message}`)
      .join("; ");

    return {
      callId,
      toolName,
      status: ToolResultStatus.ERROR,
      error: `Invalid tool arguments for "${toolName}": ${issues}`,
      durationMs,
      timestamp: new Date(),
    };
  }

  // ─── 3. Timeout and Execution Boundary ──────────────────────────────
  const timeoutMs = options.timeoutMs ?? tool.definition.timeoutMs;
  const abortController = new AbortController();

  // If caller provided an external abort signal, chain it
  if (options.context?.abortSignal) {
    options.context.abortSignal.addEventListener("abort", () => {
      abortController.abort(options.context?.abortSignal?.reason);
    });
  }

  const timeoutId = setTimeout(() => {
    abortController.abort(new Error(`Tool execution timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  const mergedContext: ToolExecutionContext = {
    ...options.context,
    abortSignal: abortController.signal,
  };

  try {
    const output = await Promise.race([
      tool.execute(parsedArgs.data, mergedContext),
      new Promise<never>((_, reject) => {
        abortController.signal.addEventListener("abort", () => {
          reject(abortController.signal.reason);
        });
      }),
    ]);

    const durationMs = Math.round(performance.now() - startTime);
    return {
      callId,
      toolName,
      status: ToolResultStatus.SUCCESS,
      output,
      durationMs,
      timestamp: new Date(),
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = err instanceof Error ? err.message : String(err);

    return {
      callId,
      toolName,
      status: ToolResultStatus.ERROR,
      error: errorMessage,
      durationMs,
      timestamp: new Date(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
