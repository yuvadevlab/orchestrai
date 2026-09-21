/**
 * @file packages/tools/src/executor/sandbox-context.ts
 * @description Immutable per-execution security context bundling all sandbox parameters.
 *
 * ─── Why Immutable Context? (Design Note) ────────────────────────────
 * A SandboxContext is built once at execution start and passed read-only
 * through the entire call stack. This prevents any tool or downstream
 * code from widening its own privileges mid-execution.
 * ─────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import type { CapabilitySet } from "@/capabilities";
import type { ResourceQuotaOptions } from "@/sandbox";

/**
 * Zod schema for validating sandbox context inputs at construction time.
 */
const SandboxContextInputSchema = z.object({
  agentId: z.string().min(1),
  tenantId: z.string().min(1),
  executionId: z.string().min(1),
  /** Absolute path to the workspace root used as the filesystem jail */
  pathJailRoot: z.string().min(1),
  /** Permitted outbound domains. Empty array = block all outbound */
  networkAllowlist: z.array(z.string()).default([]),
  quotas: z.object({
    maxToolCalls: z.number().int().positive().default(50),
    maxOutputBytes: z.number().int().positive().default(1_000_000),
    maxElapsedMs: z.number().int().positive().default(120_000),
  }),
});

export type SandboxContextInput = z.infer<typeof SandboxContextInputSchema>;

/**
 * Immutable security context for a single agent execution.
 * Carries the full security configuration used by SandboxExecutor.
 */
export class SandboxContext {
  /** The agent performing this execution */
  readonly agentId: string;
  /** Tenant scope for multi-tenant isolation */
  readonly tenantId: string;
  /** Execution trace identifier */
  readonly executionId: string;
  /** Absolute path jail root for filesystem operations */
  readonly pathJailRoot: string;
  /** Permitted outbound network domains */
  readonly networkAllowlist: ReadonlyArray<string>;
  /** Hard resource caps for this execution */
  readonly quotas: ResourceQuotaOptions;
  /** Capabilities explicitly granted for this execution */
  readonly capabilities: CapabilitySet;

  private constructor(input: SandboxContextInput, capabilities: CapabilitySet) {
    this.agentId = input.agentId;
    this.tenantId = input.tenantId;
    this.executionId = input.executionId;
    this.pathJailRoot = input.pathJailRoot;
    this.networkAllowlist = input.networkAllowlist;
    this.quotas = input.quotas;
    this.capabilities = capabilities;
  }

  /**
   * Factory method that validates inputs and constructs an immutable SandboxContext.
   *
   * @param input - Raw sandbox configuration (Zod-validated on construction).
   * @param capabilities - Explicit capability set granted to this execution.
   * @returns Validated, immutable SandboxContext.
   * @throws {ZodError} if any input field fails validation.
   */
  static create(input: SandboxContextInput, capabilities: CapabilitySet): SandboxContext {
    // Validate all inputs at construction time — fail fast before execution starts
    const validated = SandboxContextInputSchema.parse(input);
    return new SandboxContext(validated, capabilities);
  }
}
