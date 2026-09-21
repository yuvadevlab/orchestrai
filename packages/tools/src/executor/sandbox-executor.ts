/**
 * @file packages/tools/src/executor/sandbox-executor.ts
 * @description Full security stack executor composing all Phase 21 defenses.
 *
 * ─── Security Execution Order ─────────────────────────────────────────
 * Every tool call flows through these layers in order before execution:
 *   1. Capability check  — Does this agent have the raw capability at all?
 *   2. Policy evaluation — Do RBAC/ABAC rules allow this agent/tool/op?
 *   3. Resource quota    — Has this execution exceeded any hard cap?
 *   4. Tool invocation   — Actually run the tool.
 *   5. Audit emission    — Always log the decision (allow or deny).
 * ─────────────────────────────────────────────────────────────────────
 */

import { performance } from "node:perf_hooks";
import { ToolResultStatus } from "@orchestrai/shared-types";
import type { ToolCallId, ToolResult } from "@orchestrai/core";
import type { ITool, ToolExecutionContext } from "@/interfaces";
import type { IToolRegistry } from "@/registry";
import { hasCapability, type Capability } from "@/capabilities";
import { PolicyEffect, type PolicyContext } from "@/policy";
import type { PolicyEngine } from "@/policy";
import { ResourceQuota } from "@/sandbox";
import type { IAuditLogger } from "@/audit";
import type { SandboxContext } from "./sandbox-context";

/**
 * Orchestrates the full 5-layer security stack for a single tool invocation.
 * Constructed once per execution session and reused for all tool calls within it.
 */
export class SandboxExecutor {
  /** Stateful quota tracker — shared across all tool calls in one execution */
  private readonly quota: ResourceQuota;

  constructor(
    private readonly ctx: SandboxContext,
    private readonly policyEngine: PolicyEngine,
    private readonly auditLogger: IAuditLogger,
  ) {
    // Initialize quota from the immutable context limits
    this.quota = new ResourceQuota(ctx.quotas);
  }

  /**
   * Executes a tool through all security layers.
   *
   * @param registry - Tool registry to resolve the tool by name.
   * @param toolName - The tool identifier to invoke.
   * @param callId - Unique call identifier from the model's tool call.
   * @param rawArgs - Raw unvalidated arguments from the model.
   * @param requiredCapability - The capability required to invoke this tool.
   * @param execContext - Optional execution context (abortSignal, executionId).
   * @returns A guaranteed ToolResult — never throws.
   */
  async run(
    registry: IToolRegistry,
    toolName: string,
    callId: ToolCallId,
    rawArgs: Record<string, unknown>,
    requiredCapability: Capability,
    execContext?: ToolExecutionContext,
  ): Promise<ToolResult> {
    const startTime = performance.now();

    // ─── Layer 1: Capability Check ──────────────────────────────────────
    const capCheck = hasCapability(requiredCapability, this.ctx.capabilities);
    if (!capCheck.permitted) {
      await this.auditLogger.log({
        agentId: this.ctx.agentId,
        tenantId: this.ctx.tenantId,
        toolId: toolName,
        operation: "execute",
        decision: "DENY",
        reason: capCheck.reason ?? "capability not granted",
        executionId: this.ctx.executionId,
      });
      return this.denyResult(
        callId,
        toolName,
        capCheck.reason ?? "Capability not granted",
        startTime,
      );
    }

    // ─── Layer 2: Policy (RBAC/ABAC) ────────────────────────────────────
    const policyCtx: PolicyContext = {
      agentId: this.ctx.agentId,
      tenantId: this.ctx.tenantId,
      toolId: toolName,
      operation: "execute",
    };
    const decision = await this.policyEngine.evaluate(policyCtx);
    if (decision.effect === PolicyEffect.DENY) {
      await this.auditLogger.log({
        agentId: this.ctx.agentId,
        tenantId: this.ctx.tenantId,
        toolId: toolName,
        operation: "execute",
        decision: "DENY",
        reason: decision.reason,
        executionId: this.ctx.executionId,
      });
      return this.denyResult(callId, toolName, decision.reason, startTime);
    }

    // ─── Layer 3: Resource Quota ─────────────────────────────────────────
    try {
      this.quota.assertCanProceed(toolName);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      await this.auditLogger.log({
        agentId: this.ctx.agentId,
        tenantId: this.ctx.tenantId,
        toolId: toolName,
        operation: "execute",
        decision: "DENY",
        reason,
        executionId: this.ctx.executionId,
      });
      return this.denyResult(callId, toolName, reason, startTime);
    }

    // ─── Layer 4: Tool Resolution & Execution ────────────────────────────
    const tool: ITool | undefined = registry.get(toolName);
    if (!tool) {
      return this.denyResult(
        callId,
        toolName,
        `Tool "${toolName}" not found in registry`,
        startTime,
      );
    }

    const parsedArgs = tool.inputSchema.safeParse(rawArgs);
    if (!parsedArgs.success) {
      const issues = parsedArgs.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return this.denyResult(callId, toolName, `Invalid arguments: ${issues}`, startTime);
    }

    try {
      const output = await tool.execute(parsedArgs.data, execContext ?? {});
      const outputBytes = JSON.stringify(output).length;
      this.quota.recordUsage(outputBytes);

      // ─── Layer 5: Audit — ALLOW ─────────────────────────────────────
      await this.auditLogger.log({
        agentId: this.ctx.agentId,
        tenantId: this.ctx.tenantId,
        toolId: toolName,
        operation: "execute",
        decision: "ALLOW",
        reason: decision.reason,
        executionId: this.ctx.executionId,
      });

      return {
        callId,
        toolName,
        status: ToolResultStatus.SUCCESS,
        output,
        durationMs: Math.round(performance.now() - startTime),
        timestamp: new Date(),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await this.auditLogger.log({
        agentId: this.ctx.agentId,
        tenantId: this.ctx.tenantId,
        toolId: toolName,
        operation: "execute",
        decision: "DENY",
        reason: `Runtime error: ${errorMessage}`,
        executionId: this.ctx.executionId,
      });
      return {
        callId,
        toolName,
        status: ToolResultStatus.ERROR,
        error: errorMessage,
        durationMs: Math.round(performance.now() - startTime),
        timestamp: new Date(),
      };
    }
  }

  /**
   * Creates a standardized denial ToolResult.
   *
   * @param callId - The tool call ID.
   * @param toolName - The tool that was denied.
   * @param reason - Human-readable denial reason.
   * @param startTime - Performance timestamp for duration calculation.
   */
  private denyResult(
    callId: ToolCallId,
    toolName: string,
    reason: string,
    startTime: number,
  ): ToolResult {
    return {
      callId,
      toolName,
      status: ToolResultStatus.ERROR,
      error: `Security policy blocked execution: ${reason}`,
      durationMs: Math.round(performance.now() - startTime),
      timestamp: new Date(),
    };
  }
}
