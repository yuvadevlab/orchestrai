/**
 * @file apps/gateway/src/modules/billing/billing.service.ts
 * @description Singleton billing service wiring @orchestrai/billing into the gateway.
 * Provides token counting, budget enforcement, and cost ledger recording
 * for every autonomous execution turn.
 * @module apps/gateway/modules/billing
 */

import { TokenCounter, CostLedger, BudgetEnforcer, TenantUsageSummary } from "@orchestrai/billing";
import { BillingEnforcementAction, BillingLedgerEntryType } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("BillingService"));

/**
 * Default cost per token used when the model DB record does not specify one.
 * Local Ollama models are $0 — this only matters for future cloud model fallbacks.
 */
const DEFAULT_COST_PER_TOKEN = 0.0;

/** Singleton cost ledger — in-memory for now, persisted via events in future */
const ledger = new CostLedger();

/** Singleton budget enforcer backed by the shared ledger */
const enforcer = new BudgetEnforcer(ledger);

/** Singleton token counter with 4.0 chars/token heuristic */
const counter = new TokenCounter();

/**
 * Checks whether a tenant's budget allows a new execution turn.
 * Returns false and logs a warning if the budget is throttled.
 * Returns true (allow) if budget is healthy or not configured.
 *
 * @param tenantId - Tenant UUID to check budget for
 * @param estimatedPromptTokens - Approximate tokens for the upcoming turn
 * @param costPerTokenUsd - Cost per token sourced from the model DB record (0 for local Ollama)
 * @param maxMonthlySpendUsd - Configured budget cap from tenant DB record (0 = unlimited)
 */
export function checkBudgetAllowed(
  tenantId: string,
  estimatedPromptTokens: number,
  costPerTokenUsd = DEFAULT_COST_PER_TOKEN,
  maxMonthlySpendUsd = 0,
): boolean {
  // Estimate cost for the upcoming turn using the DB-sourced cost rate
  const estimatedCostUsd = estimatedPromptTokens * costPerTokenUsd;

  const result = enforcer.evaluateBudget(tenantId, maxMonthlySpendUsd);

  if (result.action === BillingEnforcementAction.THROTTLE) {
    logger.warn("Budget throttled — blocking execution turn", {
      tenantId,
      percentConsumed: result.percentConsumed,
      currentSpendUsd: result.currentSpendUsd,
      estimatedCostUsd,
    });
    return false;
  }

  if (result.action === BillingEnforcementAction.WARN) {
    // Warn but allow — operators see this in logs and billing dashboard
    logger.warn("Budget warning — approaching configured spending limit", {
      tenantId,
      percentConsumed: result.percentConsumed,
      currentSpendUsd: result.currentSpendUsd,
    });
  }

  return true;
}

/**
 * Records a completed turn's token consumption into the cost ledger.
 * Called after each LLM response is received.
 *
 * The cost rate must be sourced from the model DB record, not hardcoded here.
 * Local Ollama models have costPerTokenUsd = 0; cloud fallbacks may have real rates.
 *
 * @param tenantId - Tenant UUID
 * @param executionId - Active execution identifier
 * @param modelIdentifier - Model identifier string from the DB model record
 * @param promptTokens - Input tokens consumed
 * @param completionTokens - Output tokens generated
 * @param costPerTokenUsd - Cost per token from DB model record (0 for local Ollama)
 */
export function recordTurnCost(
  tenantId: string,
  executionId: string,
  modelIdentifier: string,
  promptTokens: number,
  completionTokens: number,
  costPerTokenUsd = DEFAULT_COST_PER_TOKEN,
): void {
  const totalTokens = promptTokens + completionTokens;
  const costUsd = totalTokens * costPerTokenUsd;

  ledger.recordExpenditure({
    tenantId,
    entryType: BillingLedgerEntryType.COMPLETION,
    promptTokens,
    completionTokens,
    costUsd,
    modelIdentifier,
    executionId,
  });

  logger.debug("Turn cost recorded", { executionId, modelIdentifier, totalTokens, costUsd });
}

/**
 * Counts estimated tokens in a message array before sending to Ollama.
 * Used as the compaction trigger threshold check.
 *
 * @param messages - Array of chat messages to count
 * @returns Approximate token count
 */
export function countMessageTokens(
  messages: ReadonlyArray<{ content?: string; role?: string }>,
): number {
  return counter.countMessageTokens(messages);
}

/**
 * Returns the cost ledger for a tenant — used by the /billing API route.
 *
 * @param tenantId - Tenant to query usage for
 */
export function getTenantUsageSummary(tenantId: string): TenantUsageSummary {
  return ledger.getTenantUsageSummary(tenantId);
}
