/**
 * @file packages/tools/src/capabilities/capability-evaluator.ts
 * @description Evaluates whether a capability grant permits a specific scoped operation.
 *
 * ─── Evaluation Logic (Design Note) ──────────────────────────────────
 * Capability checks happen BEFORE RBAC policy evaluation. A tool call
 * must first have the raw capability present in the grant set, then satisfy
 * any scope constraints on that grant, and THEN pass policy rules.
 * This two-layer approach means even a DENY rule miss cannot open a
 * capability that was never granted in the first place.
 * ─────────────────────────────────────────────────────────────────────
 */

import { Capability, type CapabilitySet } from "./capability.types";
import type { CapabilityGrant } from "./capability-grant.schema";

/**
 * Result from evaluating a capability check.
 */
export interface CapabilityCheckResult {
  /** Whether the operation is permitted under the granted capability set */
  readonly permitted: boolean;
  /** Human-readable reason if not permitted (useful for audit logs) */
  readonly reason?: string;
}

/**
 * Checks whether a requested capability is present in the grant set.
 *
 * @param required - The capability required to perform the operation.
 * @param granted - The full set of capabilities granted to this agent execution.
 * @returns CapabilityCheckResult with permitted flag and optional reason.
 */
export function hasCapability(required: Capability, granted: CapabilitySet): CapabilityCheckResult {
  if (!granted.has(required)) {
    return {
      permitted: false,
      reason: `Capability "${required}" was not granted for this execution`,
    };
  }
  return { permitted: true };
}

/**
 * Evaluates a capability grant's scope constraints for a specific resource.
 *
 * @param grant - The scoped capability grant to evaluate.
 * @param resource - The resource being accessed (path, domain, or table name).
 * @returns CapabilityCheckResult with scope-aware permitted flag.
 */
export function evaluateGrantScope(
  grant: CapabilityGrant,
  resource: string,
): CapabilityCheckResult {
  // ─── Path prefix constraint (FILE_READ / FILE_WRITE) ────────────────
  if (
    (grant.capability === Capability.FILE_READ || grant.capability === Capability.FILE_WRITE) &&
    grant.pathPrefix !== undefined
  ) {
    if (!resource.startsWith(grant.pathPrefix)) {
      return {
        permitted: false,
        reason: `Path "${resource}" is outside the granted prefix "${grant.pathPrefix}"`,
      };
    }
  }

  // ─── Domain allowlist constraint (NETWORK_OUTBOUND) ──────────────────
  if (
    grant.capability === Capability.NETWORK_OUTBOUND &&
    grant.domainAllowlist !== undefined &&
    grant.domainAllowlist.length > 0
  ) {
    const allowed = grant.domainAllowlist.some(
      (domain) => resource === domain || resource.endsWith(`.${domain}`),
    );
    if (!allowed) {
      return {
        permitted: false,
        reason: `Domain "${resource}" is not in the granted allowlist`,
      };
    }
  }

  // ─── Table allowlist constraint (DATABASE_READ / DATABASE_WRITE) ──────
  if (
    (grant.capability === Capability.DATABASE_READ ||
      grant.capability === Capability.DATABASE_WRITE) &&
    grant.tableAllowlist !== undefined &&
    grant.tableAllowlist.length > 0
  ) {
    if (!grant.tableAllowlist.includes(resource)) {
      return {
        permitted: false,
        reason: `Table "${resource}" is not in the granted allowlist`,
      };
    }
  }

  return { permitted: true };
}
