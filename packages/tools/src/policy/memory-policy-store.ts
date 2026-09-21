/**
 * @file packages/tools/src/policy/memory-policy-store.ts
 * @description In-memory policy store for local development and testing.
 *
 * ─── Default Rules (Design Note) ─────────────────────────────────────
 * The store ships with a minimal permissive default for development:
 * one ALLOW * rule that permits all operations. In production this should
 * be replaced with explicit, scoped ALLOW rules and appropriate DENY guards.
 * ─────────────────────────────────────────────────────────────────────
 */

import { PolicyEffect, type PolicyRule } from "./policy.types";
import type { IPolicyStore } from "./policy-store.interface";

/** Development default: permit everything so the system works out-of-the-box */
const DEFAULT_ALLOW_ALL_RULE: PolicyRule = {
  id: "default-allow-all",
  description: "Development default: allows all agents to invoke all tools",
  effect: PolicyEffect.ALLOW,
  agentId: "*",
  tenantId: "*",
  toolId: "*",
  operation: "*",
};

/**
 * Thread-safe in-memory implementation of IPolicyStore.
 * Suitable for local development, integration tests, and embedded runs.
 * Not suitable for production multi-tenant deployments.
 */
export class MemoryPolicyStore implements IPolicyStore {
  /** Internal mutable rule registry keyed by rule ID */
  private readonly rules: Map<string, PolicyRule>;

  /**
   * Initializes the store.
   *
   * @param seedRules - Optional initial rules to seed the store.
   *   If omitted, the permissive default-allow-all dev rule is loaded.
   */
  constructor(seedRules?: ReadonlyArray<PolicyRule>) {
    this.rules = new Map();
    // If no seed rules provided, load permissive dev default
    const initial = seedRules ?? [DEFAULT_ALLOW_ALL_RULE];
    for (const rule of initial) {
      this.rules.set(rule.id, rule);
    }
  }

  /** {@inheritDoc IPolicyStore.listRules} */
  async listRules(): Promise<ReadonlyArray<PolicyRule>> {
    // Return DENY rules before ALLOW rules for correct DENY-first evaluation order
    const allRules = Array.from(this.rules.values());
    return allRules.sort((a, b) => {
      if (a.effect === PolicyEffect.DENY && b.effect !== PolicyEffect.DENY) return -1;
      if (b.effect === PolicyEffect.DENY && a.effect !== PolicyEffect.DENY) return 1;
      return 0;
    });
  }

  /** {@inheritDoc IPolicyStore.addRule} */
  async addRule(rule: PolicyRule): Promise<void> {
    this.rules.set(rule.id, rule);
  }

  /** {@inheritDoc IPolicyStore.removeRule} */
  async removeRule(ruleId: string): Promise<void> {
    this.rules.delete(ruleId);
  }
}
