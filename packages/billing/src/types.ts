/**
 * @file packages/billing/src/types.ts
 * @description Domain types and contracts for tenant cost ledgers and budget enforcers.
 * @module @orchestrai/billing
 */

import type {
  BillingLedgerEntryType,
  BillingEnforcementAction,
  BudgetQuotaStatus,
} from "@orchestrai/shared-types";

/**
 * Immutable audit ledger entry representing a discrete financial expenditure.
 */
export interface CostLedgerEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly entryType: BillingLedgerEntryType;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly costUsd: number;
  readonly modelIdentifier: string;
  readonly executionId?: string;
  readonly timestamp: number;
}

/**
 * Aggregated tenant consumption metrics across an accounting billing cycle.
 */
export interface TenantUsageSummary {
  readonly tenantId: string;
  readonly totalSpendUsd: number;
  readonly totalPromptTokens: number;
  readonly totalCompletionTokens: number;
  readonly totalTokens: number;
  readonly entryCount: number;
  readonly periodStart: string;
}

/**
 * Result evaluation of a tenant budget enforcement inspection.
 */
export interface BudgetEvaluationResult {
  readonly tenantId: string;
  readonly action: BillingEnforcementAction;
  readonly status: BudgetQuotaStatus;
  readonly currentSpendUsd: number;
  readonly maxMonthlySpendUsd: number;
  readonly percentConsumed: number;
  readonly isThrottled: boolean;
}
