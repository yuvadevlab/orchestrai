/**
 * @file packages/core/src/cqrs/approval.commands.ts
 * @description CQRS command definitions for resolving human-in-the-loop security clearance tickets.
 * @module @orchestrai/core/cqrs
 */

import {
  ApprovalCommandType,
  type ApprovalDecisionVerdict,
  type PermissionScope,
} from "@orchestrai/shared-types";
import type { ICommand } from "./command-bus.port";

/**
 * Command to resolve an operator security approval request.
 */
export interface ResolveApprovalCommand extends ICommand<ApprovalCommandType.RESOLVE> {
  readonly approvalId: string;
  readonly decision: ApprovalDecisionVerdict;
  readonly scope: PermissionScope;
  readonly modifiedParameters?: Record<string, unknown>;
  readonly reason?: string;
  readonly operatorId?: string;
}
