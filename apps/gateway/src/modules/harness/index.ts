/**
 * @file apps/gateway/src/modules/harness/index.ts
 * @description Centralized barrel export for the OrchestrAI Agent Harness subsystem.
 * Exposes workspace instruction loaders, code standards verification gates, and skill registries.
 * @module apps/gateway/modules/harness
 */

import { WorkspaceInstructionLoader } from "./workspace-instruction-loader";
import { WorkspaceDiagnosticRunner } from "./workspace-diagnostic-runner";
import { CodeStandardsGate } from "./code-standards-gate";
import { HarnessSkillRegistry } from "./harness-skill-registry";

export * from "./workspace-instruction-loader";
export * from "./workspace-diagnostic-runner";
export * from "./code-standards-gate";
export * from "./harness-skill-registry";

/** Singleton instance of the workspace instruction loader */
export const workspaceInstructionLoader = new WorkspaceInstructionLoader();

/** Singleton instance of the workspace diagnostic runner */
export const workspaceDiagnosticRunner = new WorkspaceDiagnosticRunner();

/** Singleton instance of the code standards verification gate */
export const codeStandardsGate = new CodeStandardsGate(workspaceDiagnosticRunner);

/** Singleton instance of the discovered skill and rule registry */
export const harnessSkillRegistry = new HarnessSkillRegistry();
