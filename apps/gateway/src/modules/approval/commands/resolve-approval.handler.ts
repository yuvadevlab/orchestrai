/**
 * @file apps/gateway/src/commands/resolve-approval.handler.ts
 * @description CQRS command handler for submitting Human-In-The-Loop security clearance verdicts.
 * @module apps/gateway/commands
 */

import type { ICommandHandler, ResolveApprovalCommand } from "@orchestrai/core";
import { ApprovalService } from "@/modules/approval/approval.service";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("ResolveApprovalCommandHandler"));

/**
 * Command handler processing operator ResolveApprovalCommand requests.
 */
export class ResolveApprovalCommandHandler implements ICommandHandler<
  ResolveApprovalCommand,
  void
> {
  constructor(private readonly approvalService: ApprovalService = new ApprovalService()) {}

  /**
   * Applies the operator's decision to database grants and active turn promises.
   */
  public async handle(command: ResolveApprovalCommand): Promise<void> {
    logger.info("Resolving approval clearance ticket via CQRS command handler", {
      approvalId: command.approvalId,
      decision: command.decision,
      scope: command.scope,
    });

    await this.approvalService.resolveApproval(
      command.approvalId,
      {
        decision: command.decision,
        scope: command.scope,
        reason: command.reason,
        modifiedArguments: command.modifiedParameters,
      },
      command.operatorId || "operator",
    );
  }
}
