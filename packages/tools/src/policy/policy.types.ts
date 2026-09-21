/**
 * @file packages/tools/src/policy/policy.types.ts
 * @description Types and interfaces for the RBAC/ABAC policy engine.
 *
 * ─── DENY-First Design (Learning Note) ───────────────────────────────
 * Most security bugs come from default-allow systems where a missing rule
 * accidentally opens access. OrchestrAI uses DENY-first ordering:
 * 1. Evaluate rules in order.
 * 2. If ANY matching rule has effect=DENY → immediately reject (no further evaluation).
 * 3. If a matching rule has effect=ALLOW → permit.
 * 4. If no rule matches → default deny.
 * This means adding rules can only open access, never accidentally widen it.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Whether a policy rule permits or blocks the matched action.
 */
export enum PolicyEffect {
  ALLOW = "ALLOW",
  DENY = "DENY",
}

/**
 * Contextual attributes available during policy rule evaluation.
 * Rules match against these attributes using string equality or wildcards ("*").
 */
export interface PolicyContext {
  /** Unique identifier of the agent attempting the operation */
  readonly agentId: string;
  /** Tenant scope isolating multi-tenant deployments */
  readonly tenantId: string;
  /** The tool being invoked (e.g. "read_file", "http_fetch") */
  readonly toolId: string;
  /** The specific operation class (e.g. "execute", "read", "write") */
  readonly operation: string;
}

/**
 * A single policy rule evaluated against a PolicyContext.
 * Wildcard "*" in any field matches any value for that field.
 */
export interface PolicyRule {
  /** Stable unique identifier for this rule */
  readonly id: string;
  /** Human-readable description of what this rule enforces */
  readonly description: string;
  /** The decision to apply when this rule matches */
  readonly effect: PolicyEffect;
  /** Agent ID to match — use "*" to match all agents */
  readonly agentId: string;
  /** Tenant ID to match — use "*" to match all tenants */
  readonly tenantId: string;
  /** Tool ID to match — use "*" to match all tools */
  readonly toolId: string;
  /** Operation to match — use "*" to match all operations */
  readonly operation: string;
}

/**
 * Result of evaluating a PolicyContext against the loaded rule set.
 */
export interface PolicyDecision {
  /** Final resolved decision */
  readonly effect: PolicyEffect;
  /** The rule that produced this decision, or undefined if default-deny was applied */
  readonly matchedRule?: PolicyRule;
  /** Human-readable reason for the decision */
  readonly reason: string;
}
