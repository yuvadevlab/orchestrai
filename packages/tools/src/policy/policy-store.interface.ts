/**
 * @file packages/tools/src/policy/policy-store.interface.ts
 * @description Abstract storage interface for policy rules, decoupling the
 * engine from any specific persistence backend.
 */

import type { PolicyRule } from "./policy.types";

/**
 * Contract for any policy rule store implementation.
 * Supports both in-memory (development) and database-backed (production) stores.
 */
export interface IPolicyStore {
  /**
   * Retrieve all active policy rules ordered for evaluation.
   * Implementations should return rules in priority order (DENY rules first).
   *
   * @returns Promise resolving to the ordered list of active rules.
   */
  listRules(): Promise<ReadonlyArray<PolicyRule>>;

  /**
   * Add a new policy rule to the store.
   *
   * @param rule - The rule to persist.
   */
  addRule(rule: PolicyRule): Promise<void>;

  /**
   * Remove a policy rule by its unique ID.
   *
   * @param ruleId - The stable ID of the rule to delete.
   */
  removeRule(ruleId: string): Promise<void>;
}
