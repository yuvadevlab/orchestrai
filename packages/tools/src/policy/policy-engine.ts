/**
 * @file packages/tools/src/policy/policy-engine.ts
 * @description DENY-first RBAC/ABAC policy engine for agent tool access control.
 *
 * ─── Evaluation Algorithm (Design Note) ──────────────────────────────
 * Rules are evaluated in DENY-first order (MemoryPolicyStore sorts them).
 * Wildcard "*" in a rule field matches any value in the context.
 * The first matching rule is decisive:
 *   - DENY  → reject immediately, no further evaluation.
 *   - ALLOW → permit.
 * If no rule matches → default DENY (closed-world assumption).
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  PolicyEffect,
  type PolicyContext,
  type PolicyDecision,
  type PolicyRule,
} from "./policy.types";
import type { IPolicyStore } from "./policy-store.interface";

/**
 * Checks whether a single rule field matches the context value.
 * A rule field of "*" is a wildcard that matches any context value.
 *
 * @param ruleField - The rule's field value (specific value or "*").
 * @param contextValue - The actual context value to match against.
 * @returns True if the field matches.
 */
function fieldMatches(ruleField: string, contextValue: string): boolean {
  // Wildcard "*" matches any value
  return ruleField === "*" || ruleField === contextValue;
}

/**
 * Tests whether a policy rule fully matches the given PolicyContext.
 *
 * @param rule - The rule to test.
 * @param ctx - The execution context to match against.
 * @returns True if all fields of the rule match the context.
 */
function ruleMatches(rule: PolicyRule, ctx: PolicyContext): boolean {
  return (
    fieldMatches(rule.agentId, ctx.agentId) &&
    fieldMatches(rule.tenantId, ctx.tenantId) &&
    fieldMatches(rule.toolId, ctx.toolId) &&
    fieldMatches(rule.operation, ctx.operation)
  );
}

/**
 * DENY-first RBAC/ABAC policy engine.
 * Evaluates an ordered set of rules against a PolicyContext and returns
 * a decisive allow or deny decision with the matched rule for audit.
 */
export class PolicyEngine {
  constructor(private readonly store: IPolicyStore) {}

  /**
   * Evaluates the policy rule set against the given context.
   *
   * @param ctx - The execution context describing the attempted operation.
   * @returns A PolicyDecision with the resolved effect, matched rule, and reason.
   */
  async evaluate(ctx: PolicyContext): Promise<PolicyDecision> {
    // Load rules in DENY-first priority order
    const rules = await this.store.listRules();

    for (const rule of rules) {
      if (!ruleMatches(rule, ctx)) {
        // This rule does not match the current context — skip it
        continue;
      }

      // First matching rule is decisive (DENY-first ordering ensures safety)
      if (rule.effect === PolicyEffect.DENY) {
        return {
          effect: PolicyEffect.DENY,
          matchedRule: rule,
          reason: `Denied by rule "${rule.id}": ${rule.description}`,
        };
      }

      // ALLOW rule matched — permit the operation
      return {
        effect: PolicyEffect.ALLOW,
        matchedRule: rule,
        reason: `Allowed by rule "${rule.id}": ${rule.description}`,
      };
    }

    // No rule matched — closed-world default DENY
    return {
      effect: PolicyEffect.DENY,
      reason: `No matching policy rule for agent="${ctx.agentId}" tool="${ctx.toolId}" op="${ctx.operation}" — default deny`,
    };
  }
}
