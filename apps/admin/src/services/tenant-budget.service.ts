/**
 * @file apps/admin/src/services/tenant-budget.service.ts
 * @description Operator Control Plane service managing tenant spending limits, quotas, and budgets.
 * @module apps/admin/services
 */

import { getPrismaClient, type PrismaClient, type Tenant } from "@orchestrai/database";
import type { TenantBudgetInfo, TenantRecord } from "@orchestrai/shared-types";

/** Default monthly spending limit in USD for newly initialized tenant partitions */
const DEFAULT_MAX_MONTHLY_SPEND_USD = 500.0;

/**
 * In-memory operational budget store for tenant partitions.
 * Will interface directly with packages/billing in Phase 4.
 */
interface TenantBudgetStoreEntry {
  maxMonthlySpendUsd: number;
  currentSpendUsd: number;
  totalTokensUsed: number;
  periodStart: string;
  isThrottled: boolean;
}

/**
 * Admin service managing tenant quotas, spending caps, and tenant listings.
 */
export class TenantBudgetAdminService {
  private readonly budgetStore = new Map<string, TenantBudgetStoreEntry>();

  private get db(): PrismaClient {
    return getPrismaClient();
  }

  /**
   * Retrieves or initializes budget quota metrics for a tenant partition.
   */
  public async getTenantBudget(tenantId: string): Promise<TenantBudgetInfo> {
    let entry = this.budgetStore.get(tenantId);

    // Initialize with healthy defaults if not yet established
    if (!entry) {
      entry = {
        maxMonthlySpendUsd: DEFAULT_MAX_MONTHLY_SPEND_USD,
        currentSpendUsd: 0.0,
        totalTokensUsed: 0,
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        isThrottled: false,
      };
      this.budgetStore.set(tenantId, entry);
    }

    return {
      tenantId,
      maxMonthlySpendUsd: entry.maxMonthlySpendUsd,
      currentSpendUsd: entry.currentSpendUsd,
      totalTokensUsed: entry.totalTokensUsed,
      periodStart: entry.periodStart,
      isThrottled: entry.isThrottled,
    };
  }

  /**
   * Updates maximum monthly spending limit for a tenant partition.
   */
  public async updateTenantBudget(
    tenantId: string,
    patch: { maxMonthlySpendUsd: number },
  ): Promise<TenantBudgetInfo> {
    const existing = await this.getTenantBudget(tenantId);
    const newMaxSpend = patch.maxMonthlySpendUsd;

    // Evaluate throttling state: throttled if current spend meets or exceeds cap
    const isThrottled = existing.currentSpendUsd >= newMaxSpend && newMaxSpend > 0;

    const updated: TenantBudgetStoreEntry = {
      maxMonthlySpendUsd: newMaxSpend,
      currentSpendUsd: existing.currentSpendUsd,
      totalTokensUsed: existing.totalTokensUsed,
      periodStart: existing.periodStart,
      isThrottled,
    };

    this.budgetStore.set(tenantId, updated);

    return {
      tenantId,
      maxMonthlySpendUsd: updated.maxMonthlySpendUsd,
      currentSpendUsd: updated.currentSpendUsd,
      totalTokensUsed: updated.totalTokensUsed,
      periodStart: updated.periodStart,
      isThrottled: updated.isThrottled,
    };
  }

  /**
   * Lists all registered tenant accounts in the cluster.
   */
  public async listTenants(): Promise<TenantRecord[]> {
    const tenants = await this.db.tenant.findMany({
      orderBy: { name: "asc" },
    });

    return tenants.map((t: Tenant) => ({
      tenantId: t.tenantId,
      name: t.name,
      slug: t.slug,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  }
}
