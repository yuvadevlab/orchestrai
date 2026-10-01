/**
 * @file packages/billing/src/cost-ledger.ts
 * @description Append-only transaction ledger storing token consumption and monetary costs.
 * @module @orchestrai/billing
 */

import { randomUUID } from "node:crypto";
import type { CostLedgerEntry, TenantUsageSummary } from "./types";
import type { BillingLedgerEntryType } from "@orchestrai/shared-types";

/**
 * Append-only transactional financial ledger partitioned by tenant.
 */
export class CostLedger {
  private readonly ledger: CostLedgerEntry[] = [];

  /**
   * Appends an immutable expenditure entry to the tenant ledger.
   */
  public recordExpenditure(params: {
    tenantId: string;
    entryType: BillingLedgerEntryType;
    promptTokens: number;
    completionTokens: number;
    costUsd: number;
    modelIdentifier: string;
    executionId?: string;
  }): CostLedgerEntry {
    const entry: CostLedgerEntry = {
      id: randomUUID(),
      tenantId: params.tenantId,
      entryType: params.entryType,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      costUsd: Number(params.costUsd.toFixed(6)),
      modelIdentifier: params.modelIdentifier,
      executionId: params.executionId,
      timestamp: Date.now(),
    };

    this.ledger.push(entry);
    return entry;
  }

  /**
   * Retrieves aggregated usage and financial totals for a tenant since period start.
   */
  public getTenantUsageSummary(tenantId: string, periodStartMs = 0): TenantUsageSummary {
    const entries = this.ledger.filter(
      (e) => e.tenantId === tenantId && e.timestamp >= periodStartMs,
    );

    let totalSpendUsd = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;

    for (const e of entries) {
      totalSpendUsd += e.costUsd;
      totalPromptTokens += e.promptTokens;
      totalCompletionTokens += e.completionTokens;
    }

    return {
      tenantId,
      totalSpendUsd: Number(totalSpendUsd.toFixed(6)),
      totalPromptTokens,
      totalCompletionTokens,
      totalTokens: totalPromptTokens + totalCompletionTokens,
      entryCount: entries.length,
      periodStart: new Date(periodStartMs).toISOString(),
    };
  }

  /**
   * Returns all raw ledger entries for a tenant partition.
   */
  public getEntriesByTenant(tenantId: string): readonly CostLedgerEntry[] {
    return this.ledger.filter((e) => e.tenantId === tenantId);
  }
}
