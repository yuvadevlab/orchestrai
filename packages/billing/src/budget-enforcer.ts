/**
 * @file packages/billing/src/budget-enforcer.ts
 * @description Tenant budget quota enforcer evaluating spending limits against cost ledger.
 * @module @orchestrai/billing
 */

import { BillingEnforcementAction, BudgetQuotaStatus } from "@orchestrai/shared-types";
import type { CostLedger } from "./cost-ledger";
import type { BudgetEvaluationResult } from "./types";

/** Warning threshold percentage of allocated budget (80%) */
const WARNING_THRESHOLD_PERCENT = 80;
/** Critical throttle threshold percentage of allocated budget (100%) */
const THROTTLE_THRESHOLD_PERCENT = 100;

/**
 * Enforces financial budget caps and throttling policies on tenant partitions.
 */
export class BudgetEnforcer {
  constructor(private readonly ledger: CostLedger) {}

  /**
   * Evaluates current tenant expenditure against allocated monthly spend limit.
   *
   * @param tenantId - Target tenant UUID
   * @param maxMonthlySpendUsd - Configured budget spending limit in USD
   * @param periodStartMs - Start timestamp of current billing cycle
   * @returns BudgetEvaluationResult determining whether execution is allowed or blocked
   */
  public evaluateBudget(
    tenantId: string,
    maxMonthlySpendUsd: number,
    periodStartMs = 0,
  ): BudgetEvaluationResult {
    // If no cap is set (0 or negative), treat as unlimited healthy allowance
    if (maxMonthlySpendUsd <= 0) {
      return {
        tenantId,
        action: BillingEnforcementAction.ALLOW,
        status: BudgetQuotaStatus.HEALTHY,
        currentSpendUsd: 0,
        maxMonthlySpendUsd: 0,
        percentConsumed: 0,
        isThrottled: false,
      };
    }

    const summary = this.ledger.getTenantUsageSummary(tenantId, periodStartMs);
    const currentSpendUsd = summary.totalSpendUsd;
    const percentConsumed = Math.round((currentSpendUsd / maxMonthlySpendUsd) * 100);

    // 1. Quota fully exhausted or exceeded -> Throttle and block expensive runs
    if (percentConsumed >= THROTTLE_THRESHOLD_PERCENT) {
      return {
        tenantId,
        action: BillingEnforcementAction.THROTTLE,
        status: BudgetQuotaStatus.THROTTLED,
        currentSpendUsd,
        maxMonthlySpendUsd,
        percentConsumed,
        isThrottled: true,
      };
    }

    // 2. Approaching quota limit -> Warn operator
    if (percentConsumed >= WARNING_THRESHOLD_PERCENT) {
      return {
        tenantId,
        action: BillingEnforcementAction.WARN,
        status: BudgetQuotaStatus.WARNING,
        currentSpendUsd,
        maxMonthlySpendUsd,
        percentConsumed,
        isThrottled: false,
      };
    }

    // 3. Normal healthy consumption
    return {
      tenantId,
      action: BillingEnforcementAction.ALLOW,
      status: BudgetQuotaStatus.HEALTHY,
      currentSpendUsd,
      maxMonthlySpendUsd,
      percentConsumed,
      isThrottled: false,
    };
  }
}
