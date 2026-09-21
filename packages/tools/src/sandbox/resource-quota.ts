/**
 * @file packages/tools/src/sandbox/resource-quota.ts
 * @description Per-execution resource quota tracker preventing runaway agents.
 *
 * ─── Why Resource Quotas? (Design Note) ──────────────────────────────
 * An autonomous agent in ACT or AUTO mode can loop indefinitely, calling
 * hundreds of tools and writing gigabytes of output if left unchecked.
 * The ResourceQuota enforces hard caps per execution:
 *   - maxToolCalls: prevents infinite tool loops
 *   - maxOutputBytes: prevents disk/memory exhaustion from tool outputs
 *   - maxElapsedMs: prevents zombie executions stalling the worker pool
 * ─────────────────────────────────────────────────────────────────────
 */

import { OrchestrAIError } from "@orchestrai/core";

/**
 * Configuration for hard resource caps on an agent execution.
 */
export interface ResourceQuotaOptions {
  /** Maximum number of tool calls permitted in this execution window */
  readonly maxToolCalls: number;
  /** Maximum total output bytes accumulated across all tool results */
  readonly maxOutputBytes: number;
  /** Maximum total elapsed wall-clock time in milliseconds */
  readonly maxElapsedMs: number;
}

/**
 * Live snapshot of resource consumption within a single execution.
 */
export interface ResourceUsageSnapshot {
  readonly toolCallsUsed: number;
  readonly outputBytesUsed: number;
  readonly elapsedMs: number;
}

/**
 * Stateful per-execution resource quota tracker.
 * Records actual usage and enforces hard caps before each tool invocation.
 */
export class ResourceQuota {
  private toolCallsUsed = 0;
  private outputBytesUsed = 0;
  private readonly startTime: number;

  constructor(private readonly limits: ResourceQuotaOptions) {
    this.startTime = Date.now();
  }

  /**
   * Asserts that the execution has not exceeded any quota before a tool runs.
   * Must be called before every tool invocation.
   *
   * @param toolName - Tool name for diagnostic error context.
   * @throws {OrchestrAIError} with code RATE_LIMIT if any quota is exceeded.
   */
  assertCanProceed(toolName: string): void {
    const elapsedMs = Date.now() - this.startTime;

    // Check elapsed wall-clock time budget
    if (elapsedMs > this.limits.maxElapsedMs) {
      throw new OrchestrAIError(
        `Execution time quota exceeded: ${elapsedMs}ms > ${this.limits.maxElapsedMs}ms limit`,
        "POLICY_VIOLATION",
        429,
        { toolName, elapsedMs, maxElapsedMs: this.limits.maxElapsedMs },
      );
    }

    // Check tool call count budget
    if (this.toolCallsUsed >= this.limits.maxToolCalls) {
      throw new OrchestrAIError(
        `Tool call quota exceeded: ${this.toolCallsUsed} calls >= ${this.limits.maxToolCalls} limit`,
        "POLICY_VIOLATION",
        429,
        { toolName, toolCallsUsed: this.toolCallsUsed, maxToolCalls: this.limits.maxToolCalls },
      );
    }

    // Check accumulated output byte budget
    if (this.outputBytesUsed >= this.limits.maxOutputBytes) {
      throw new OrchestrAIError(
        `Output byte quota exceeded: ${this.outputBytesUsed} bytes >= ${this.limits.maxOutputBytes} limit`,
        "POLICY_VIOLATION",
        429,
        {
          toolName,
          outputBytesUsed: this.outputBytesUsed,
          maxOutputBytes: this.limits.maxOutputBytes,
        },
      );
    }
  }

  /**
   * Records resource usage after a tool invocation completes.
   *
   * @param outputBytes - The byte size of the tool's output.
   */
  recordUsage(outputBytes: number): void {
    this.toolCallsUsed += 1;
    this.outputBytesUsed += outputBytes;
  }

  /** Returns a snapshot of current resource consumption for audit/telemetry. */
  snapshot(): ResourceUsageSnapshot {
    return {
      toolCallsUsed: this.toolCallsUsed,
      outputBytesUsed: this.outputBytesUsed,
      elapsedMs: Date.now() - this.startTime,
    };
  }
}
