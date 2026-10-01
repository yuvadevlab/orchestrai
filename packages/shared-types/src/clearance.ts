/**
 * @file packages/shared-types/src/clearance.ts
 * @description Data Transfer Objects (DTOs) for Human-In-The-Loop (HITL) clearance and security grants.
 * @module @orchestrai/shared-types
 */

import type {
  PermissionScope,
  ApprovalDecisionVerdict,
  ApprovalRiskLevel,
  PermissionLevel,
  RequestStatus,
  GrantStatus,
} from "./enums/security.enums";

/**
 * Request payload submitted by an operator to resolve a pending clearance request.
 */
export interface ResolveApprovalDto {
  /** The unique identifier of the approval ticket being resolved */
  readonly approvalId: string;
  /** The decision verdict rendered by the operator */
  readonly decision: ApprovalDecisionVerdict;
  /** Granted persistence duration scope */
  readonly scope: PermissionScope;
  /** Optional parameter modifications applied by operator before approval */
  readonly modifiedParameters?: Record<string, unknown>;
  /** Optional justification or operational note */
  readonly reason?: string;
  /** User ID of the authorizing operator */
  readonly resolvedBy?: string;
}

/**
 * Standard representation of an active or historical approval clearance ticket.
 */
export interface ApprovalTicketRecord {
  readonly id: string;
  readonly executionId: string;
  readonly sessionId?: string;
  readonly tenantId?: string;
  readonly agentId: string;
  readonly toolName: string;
  readonly target: string;
  readonly riskLevel: ApprovalRiskLevel;
  readonly blastRadius?: string;
  readonly parameters: Record<string, unknown>;
  readonly status: RequestStatus;
  readonly decision?: ApprovalDecisionVerdict;
  readonly resolvedScope?: PermissionScope;
  readonly resolvedBy?: string;
  readonly resolvedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Persistent access grant recorded in the security authorization ledger.
 */
export interface AccessGrantRecord {
  readonly id: string;
  readonly tenantId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly resourceUri: string;
  readonly permission: PermissionLevel;
  readonly scope: PermissionScope;
  readonly status: GrantStatus;
  readonly expiresAt?: string;
  readonly createdAt: string;
}
