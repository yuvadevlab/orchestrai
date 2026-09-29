/**
 * @file packages/shared-types/src/enums/security.enums.ts
 * @description Domain enumerations for Human-in-the-Loop clearances and security risk tiers.
 */

/**
 * Grant duration scope for an approved tool execution or directory access.
 */
export enum PermissionScope {
  ONCE = "once",
  SESSION = "session",
  PERMANENT = "permanent",
  DENY = "deny",
}

/**
 * Verdict submitted by an operator for a pending approval request.
 */
export enum ApprovalDecisionVerdict {
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

/**
 * Security risk tier classified by path and command inspection policies.
 */
export enum ApprovalRiskLevel {
  SAFE = "safe",
  CAUTION = "caution",
  CRITICAL = "critical",
}

/**
 * Access permission level requested or granted for a resource.
 */
export enum PermissionLevel {
  READ = "read",
  WRITE = "write",
  EXECUTE = "execute",
  ADMIN = "admin",
}

/**
 * Lifecycle status of an authorization clearance request.
 */
export enum RequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

/**
 * Operational status of a granted permission token.
 */
export enum GrantStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
}
