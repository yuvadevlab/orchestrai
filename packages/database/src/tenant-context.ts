/**
 * @file packages/database/src/tenant-context.ts
 * @description Multi-tenant isolation helpers and scoped query builders.
 * @module @orchestrai/database
 */

import type { QueryResult, QueryResultRow } from "pg";
import { executeQuery } from "./query";
import type { TenantScope } from "./types";

/**
 * Executes a tenant-isolated query ensuring the tenant_id constraint is strictly enforced.
 *
 * @param sqlWithTenantFilter - SQL query containing $1 placeholder for tenant_id
 * @param scope - Validated TenantScope containing tenantId
 * @param additionalParams - Remaining parameter values ($2, $3, etc.)
 * @returns QueryResult containing isolated rows
 */
export async function executeTenantQuery<T extends QueryResultRow = QueryResultRow>(
  sqlWithTenantFilter: string,
  scope: TenantScope,
  additionalParams: unknown[] = [],
): Promise<QueryResult<T>> {
  // Invariant: Tenant ID must be present and non-empty for multi-tenant safety
  if (!scope.tenantId) {
    throw new Error(
      "Multi-tenant security violation: tenantId is required for tenant-scoped queries",
    );
  }

  const allParams = [scope.tenantId, ...additionalParams];
  return executeQuery<T>(sqlWithTenantFilter, allParams);
}
