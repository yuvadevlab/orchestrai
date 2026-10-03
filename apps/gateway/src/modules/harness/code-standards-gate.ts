/**
 * @file apps/gateway/src/modules/harness/code-standards-gate.ts
 * @description Code Standards Verification Gate mediating post-write checks and HITL repair loops.
 * @module apps/gateway/modules/harness
 */

import { DiagnosticSeverity, type HarnessDiagnosticReport } from "@orchestrai/shared-types";
import { WorkspaceDiagnosticRunner } from "./workspace-diagnostic-runner";

/**
 * Gate evaluator validating code modifications against workspace linters and invariants.
 */
export class CodeStandardsGate {
  constructor(
    private readonly runner: WorkspaceDiagnosticRunner = new WorkspaceDiagnosticRunner(),
  ) {}

  /**
   * Evaluates a newly written or modified file and formats feedback for the agent.
   *
   * @param filePath - File path that was written
   * @param workspaceRoot - Root sandbox directory
   * @returns Formatted evaluation result with pass indicator and actionable report
   */
  public evaluateWrittenFile(
    filePath: string,
    workspaceRoot: string,
  ): { passed: boolean; feedback: string; report: HarnessDiagnosticReport } {
    const report = this.runner.runDiagnostics(filePath, workspaceRoot);

    if (report.passed) {
      return {
        passed: true,
        feedback: `Code standards verification passed cleanly for "${filePath}".`,
        report,
      };
    }

    // Format errors into actionable instructions for the autonomous reasoning loop
    const errorItems = report.diagnostics
      .filter((d) => d.severity === DiagnosticSeverity.ERROR)
      .map((d, index) => {
        const location = d.line
          ? `[Line ${d.line}${d.column ? `, Col ${d.column}` : ""}]`
          : "[General]";
        const codeStr = d.code ? ` (${d.code})` : "";
        return `${index + 1}. ${location}${codeStr}: ${d.message} [Tool: ${d.tool}]`;
      });

    const formattedFeedback = [
      `[Code Standards & Diagnostic Gate: ERRORS DETECTED]`,
      `Target File: ${filePath}`,
      `Violations (${errorItems.length}):`,
      ...errorItems,
      ``,
      `REQUIRED REPAIR PROTOCOL:`,
      `1. Analyze the violations above to identify the root cause.`,
      `2. Formulate a clean, minimal code correction.`,
      `3. If code updates require modifying files, state your rationale and request Human-in-the-Loop (HITL) approval with the proposed diff before finalizing.`,
    ].join("\n");

    return {
      passed: false,
      feedback: formattedFeedback,
      report,
    };
  }
}
