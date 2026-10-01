/**
 * @file apps/console/src/lib/stores/execution-slice.ts
 * @description Zustand store slice governing DAG execution progression, steps, and telemetry.
 * @module apps/console/lib/stores
 */

import type { StateCreator } from "zustand";
import type { ExecutionStatus, StepStatus } from "@orchestrai/shared-types";

/**
 * Step representation within an active DAG execution run.
 */
export interface ConsoleExecutionStep {
  readonly id: string;
  readonly name: string;
  readonly stepType: string;
  readonly status: StepStatus | string;
  readonly durationMs?: number;
  readonly error?: string;
  readonly output?: unknown;
}

/**
 * State and actions for execution runs and telemetry.
 */
export interface ExecutionSlice {
  activeExecutionId: string | null;
  executionStatus: ExecutionStatus | string | null;
  executionSteps: ConsoleExecutionStep[];
  activeStepId: string | null;
  totalTokensUsed: number;

  setActiveExecutionId: (id: string | null) => void;
  setExecutionStatus: (status: ExecutionStatus | string | null) => void;
  setExecutionSteps: (steps: ConsoleExecutionStep[]) => void;
  appendExecutionStep: (step: ConsoleExecutionStep) => void;
  updateExecutionStep: (id: string, patch: Partial<ConsoleExecutionStep>) => void;
  setActiveStepId: (stepId: string | null) => void;
  setTotalTokensUsed: (tokens: number) => void;
  resetExecution: () => void;
}

export const createExecutionSlice: StateCreator<ExecutionSlice, [], [], ExecutionSlice> = (
  set,
) => ({
  activeExecutionId: null,
  executionStatus: null,
  executionSteps: [],
  activeStepId: null,
  totalTokensUsed: 0,

  setActiveExecutionId: (id) => set({ activeExecutionId: id }),
  setExecutionStatus: (status) => set({ executionStatus: status }),
  setExecutionSteps: (steps) => set({ executionSteps: steps }),
  appendExecutionStep: (step) =>
    set((state) => ({ executionSteps: [...state.executionSteps, step] })),
  updateExecutionStep: (id, patch) =>
    set((state) => ({
      executionSteps: state.executionSteps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
  setActiveStepId: (stepId) => set({ activeStepId: stepId }),
  setTotalTokensUsed: (tokens) => set({ totalTokensUsed: tokens }),
  resetExecution: () =>
    set({
      activeExecutionId: null,
      executionStatus: null,
      executionSteps: [],
      activeStepId: null,
      totalTokensUsed: 0,
    }),
});
