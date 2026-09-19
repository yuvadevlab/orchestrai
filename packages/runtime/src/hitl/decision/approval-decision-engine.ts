/**
 * @file packages/runtime/src/hitl/decision/approval-decision-engine.ts
 * @description Decision processing coordinator validating operator verdicts and argument overrides.
 */

import { OrchestrAIError } from "@orchestrai/core";
import {
  ApprovalResolutionInputSchema,
  type ApprovalResolutionInput,
  type ApprovalTicket,
  type IApprovalStorage,
} from "../contracts";

/**
 * Validates, records, and applies human operator decisions across active approval tickets.
 */
export class ApprovalDecisionEngine {
  private readonly storage: IApprovalStorage;

  public constructor(storage: IApprovalStorage) {
    this.storage = storage;
  }

  /**
   * Processes an operator resolution (approval, refusal, or cancellation) on an active ticket.
   *
   * @param approvalId - Identifier of the target approval ticket.
   * @param rawResolution - Decision verdict and optional modified arguments.
   * @returns The resolved ApprovalTicket.
   */
  public async resolve(
    approvalId: string,
    rawResolution: ApprovalResolutionInput,
  ): Promise<ApprovalTicket> {
    const resolution = ApprovalResolutionInputSchema.parse(rawResolution);

    // 1. Verify that the approval ticket exists
    const ticket = await this.storage.getTicket(approvalId);
    if (!ticket) {
      throw new OrchestrAIError(
        `Approval decision failed: ticket "${approvalId}" not found`,
        "NOT_FOUND",
        404,
        { approvalId },
      );
    }

    // 2. Validate modifiedArguments if operator edited parameters
    if (resolution.modifiedArguments) {
      // Ensure modifiedArguments is a non-null object
      if (
        typeof resolution.modifiedArguments !== "object" ||
        resolution.modifiedArguments === null
      ) {
        throw new OrchestrAIError(
          "Invalid modified arguments: must be a key-value record object",
          "VALIDATION_ERROR",
          400,
          { approvalId },
        );
      }
    }

    // 3. Persist the resolution via the storage adapter
    return this.storage.resolveTicket(approvalId, resolution);
  }

  /**
   * Convenience method to cancel an active approval ticket directly.
   *
   * @param approvalId - Identifier of the target approval ticket.
   * @param operatorId - Identity of the operator cancelling the run.
   * @param reason - Optional cancellation justification.
   */
  public async cancel(
    approvalId: string,
    operatorId: string,
    reason = "Operator cancelled execution at approval gate",
  ): Promise<ApprovalTicket> {
    return this.resolve(approvalId, {
      decision: "CANCELLED",
      operatorId,
      reason,
    });
  }

  /**
   * Retrieves an approval ticket by its identifier.
   */
  public async getTicket(approvalId: string): Promise<ApprovalTicket | undefined> {
    return this.storage.getTicket(approvalId);
  }
}
