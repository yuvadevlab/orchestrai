/**
 * @file packages/events/src/saga/saga-coordinator.ts
 * @description Distributed Saga orchestrator executing forward steps and backward compensating steps.
 */

import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import { SagaState, type SagaDefinition, type SagaResult, type SagaStep } from "./saga.types";

/**
 * Orchestrates multi-step distributed Saga transactions with inverse compensation on failure.
 */
export class SagaCoordinator {
  /**
   * Internal logger instance.
   */
  private readonly logger = loggerWithConfig(new Logger("SagaCoordinator"));

  /**
   * Executes a defined Saga workflow.
   *
   * @param definition - Complete Saga workflow definition.
   * @returns SagaResult containing final state, mutated context, and step audit logs.
   */
  public async execute<TContext>(
    definition: SagaDefinition<TContext>,
  ): Promise<SagaResult<TContext>> {
    const { name, steps, initialContext } = definition;
    this.logger.info(`Starting Saga execution: ${name} (${steps.length} steps)`);

    let currentContext = { ...initialContext };
    const completedSteps: SagaStep<TContext>[] = [];
    const compensatedStepNames: string[] = [];

    // Forward execution phase
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Guard clause: skip if step index is out of bounds
      if (!step) {
        continue;
      }

      this.logger.debug(`Executing Saga step [${i + 1}/${steps.length}]: ${step.name}`);

      try {
        currentContext = await step.execute(currentContext);
        completedSteps.push(step);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Saga step failed [${step.name}]: ${errorMsg}. Triggering compensation...`,
        );

        // Trigger backward compensation phase
        const compensationResult = await this.compensate(completedSteps, currentContext);
        compensatedStepNames.push(...compensationResult.compensatedSteps);

        return {
          state: compensationResult.success ? SagaState.COMPENSATED : SagaState.FAILED,
          context: compensationResult.context,
          completedSteps: completedSteps.map((s) => s.name),
          compensatedSteps: compensatedStepNames,
          error: `Step [${step.name}] failed: ${errorMsg}${
            !compensationResult.success ? ` (Compensation error: ${compensationResult.error})` : ""
          }`,
        };
      }
    }

    this.logger.info(`Saga completed successfully: ${name}`);
    return {
      state: SagaState.COMPLETED,
      context: currentContext,
      completedSteps: completedSteps.map((s) => s.name),
      compensatedSteps: [],
    };
  }

  /**
   * Runs compensating steps in reverse order (LIFO).
   */
  private async compensate<TContext>(
    completedSteps: SagaStep<TContext>[],
    context: TContext,
  ): Promise<{ success: boolean; context: TContext; compensatedSteps: string[]; error?: string }> {
    let currentContext = { ...context };
    const compensatedSteps: string[] = [];

    // Reverse iterate through completed steps to execute compensation
    for (let i = completedSteps.length - 1; i >= 0; i--) {
      const step = completedSteps[i];

      // Guard clause: skip if step index is undefined
      if (!step) {
        continue;
      }

      this.logger.debug(`Compensating Saga step: ${step.name}`);

      try {
        currentContext = await step.compensate(currentContext);
        compensatedSteps.push(step.name);
      } catch (err: unknown) {
        const compError = err instanceof Error ? err.message : String(err);
        this.logger.error(`Critical: Compensation failed for step [${step.name}]: ${compError}`);

        // Guard clause: Return failure if compensation itself crashes
        return {
          success: false,
          context: currentContext,
          compensatedSteps,
          error: compError,
        };
      }
    }

    return {
      success: true,
      context: currentContext,
      compensatedSteps,
    };
  }
}
