/**
 * @file packages/agent/src/modes/plan/plan-tracker.ts
 * @description Manages plan progression, dependency verification, and step status updates.
 */

import { PlanOverallStatus, PlanStepStatus, type Plan, type PlanStep } from "./plan.schema";

/**
 * Tracks and updates the state of a structured execution plan across agent steps.
 */
export class PlanTracker {
  private plan: Plan;

  constructor(plan: Plan) {
    this.plan = { ...plan };
  }

  /**
   * Retrieves the current snapshot of the tracked plan.
   */
  public getPlan(): Readonly<Plan> {
    return this.plan;
  }

  /**
   * Identifies the next step eligible for execution whose dependencies are satisfied.
   *
   * @returns The next executable PlanStep or undefined if all are done/blocked.
   */
  public getNextExecutableStep(): PlanStep | undefined {
    const completedIds = new Set(
      this.plan.steps.filter((s) => s.status === PlanStepStatus.COMPLETED).map((s) => s.id),
    );

    return this.plan.steps.find((step) => {
      // Must be pending to be started
      if (step.status !== PlanStepStatus.PENDING) {
        return false;
      }
      // All dependencies must be in COMPLETED status
      const dependenciesMet = step.dependencies.every((depId) => completedIds.has(depId));
      return dependenciesMet;
    });
  }

  /**
   * Updates the status and result summary of a specific step.
   *
   * @param stepId - Identifier of the step to update.
   * @param status - Target PlanStepStatus.
   * @param resultSummary - Optional result or error summary.
   */
  public updateStepStatus(stepId: string, status: PlanStepStatus, resultSummary?: string): void {
    const stepIndex = this.plan.steps.findIndex((s) => s.id === stepId);
    // Guard: Ignore update if stepId not present in plan
    if (stepIndex === -1) {
      return;
    }

    const updatedSteps = [...this.plan.steps];
    const targetStep = updatedSteps[stepIndex];
    if (!targetStep) {
      return;
    }

    updatedSteps[stepIndex] = {
      ...targetStep,
      status,
      resultSummary: resultSummary ?? targetStep.resultSummary,
    };

    this.plan = {
      ...this.plan,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
      status: this.computeOverallStatus(updatedSteps),
    };
  }

  /**
   * Calculates overall plan completion percentage (0 to 100).
   */
  public getProgressPercentage(): number {
    if (this.plan.steps.length === 0) return 100;
    const completed = this.plan.steps.filter((s) => s.status === PlanStepStatus.COMPLETED).length;
    return Math.round((completed / this.plan.steps.length) * 100);
  }

  /**
   * Checks whether the entire plan has concluded all steps.
   */
  public isCompleted(): boolean {
    return this.plan.status === PlanOverallStatus.COMPLETED;
  }

  /**
   * Helper computing the aggregate plan status from step statuses.
   */
  private computeOverallStatus(steps: readonly PlanStep[]): PlanOverallStatus {
    const hasFailure = steps.some((s) => s.status === PlanStepStatus.FAILED);
    if (hasFailure) {
      return PlanOverallStatus.FAILED;
    }

    const allFinished = steps.every(
      (s) => s.status === PlanStepStatus.COMPLETED || s.status === PlanStepStatus.SKIPPED,
    );
    if (allFinished) {
      return PlanOverallStatus.COMPLETED;
    }

    const anyActive = steps.some(
      (s) => s.status === PlanStepStatus.IN_PROGRESS || s.status === PlanStepStatus.COMPLETED,
    );
    if (anyActive) {
      return PlanOverallStatus.ACTIVE;
    }

    return PlanOverallStatus.DRAFT;
  }
}
