/**
 * @file apps/gateway/src/services/permission-types.ts
 * @description Type definitions for Human-in-the-Loop security clearance and permission checks.
 * @module apps/gateway/services
 */

import { PermissionScope, ApprovalRiskLevel } from "@orchestrai/shared-types";
export { PermissionScope, ApprovalRiskLevel };

/**
 * Result of evaluating a requested tool operation against active clearance grants.
 */
export interface PermissionCheckResult {
  /** True if the operation is fully authorized to proceed without human intervention */
  readonly allowed: boolean;
  /** Normalized target path or shell command string */
  readonly target?: string;
  /** Human-readable explanation of why clearance is required or denied */
  readonly reason?: string;
  /** Suggested project or directory root for session/permanent scoping */
  readonly suggestedPrefix?: string;
  /** Primary working directory for execution */
  readonly effectiveRoot?: string;
  /** Full list of all approved root directories for multi-root tools */
  readonly effectiveRoots?: readonly string[];
  /** True if the target matches high-risk credential or secret signatures */
  readonly isSensitive?: boolean;
  /** Overall risk level associated with the requested operation */
  readonly riskLevel?: ApprovalRiskLevel;
}

/**
 * Pending interactive approval request presented to the operator in the Studio.
 */
export interface ApprovalRequest {
  /** Unique identifier for this approval prompt */
  readonly id: string;
  /** Execution run that initiated the request */
  readonly executionId: string;
  /** Active session or conversation ID */
  readonly sessionId?: string;
  /** Tool name being executed (e.g. read_file, write_file, bash) */
  readonly tool: string;
  /** File path or command string requiring clearance */
  readonly target: string;
  /** Diagnostic reason shown to the user */
  readonly reason: string;
  /** Suggested folder boundary for permanent/session granting */
  readonly suggestedPrefix?: string;
  /** True if target contains credentials, API keys, or protected files */
  readonly isSensitive?: boolean;
  /** Risk classification tier */
  readonly riskLevel?: ApprovalRiskLevel;
  /** ISO timestamp when clearance was requested */
  readonly createdAt: string;
}

/**
 * Human operator decision resolving a pending approval request.
 */
export interface ApprovalDecision {
  /** Selected scope of authorization */
  readonly scope: PermissionScope;
  /** True if permission was granted, false if rejected/denied */
  readonly granted: boolean;
  /** User or operator ID who made the decision */
  readonly decidedBy?: string;
}

/**
 * Internal pending approval registry item containing promise resolution callbacks.
 */
export interface PendingApproval {
  readonly request: ApprovalRequest;
  readonly resolve: (decision: ApprovalDecision) => void;
  readonly reject: (err: Error) => void;
}
