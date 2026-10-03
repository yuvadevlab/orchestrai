/**
 * @file apps/gateway/src/modules/harness/workspace-diagnostic-runner.ts
 * @description Language-aware compiler and linter diagnostic runner for workspace code standards.
 * Executes fast single-file syntax and lint evaluations (ESLint, TSC, Ruff).
 * @module apps/gateway/modules/harness
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  ESLINT_DIAGNOSTIC_REGEX,
  TSC_DIAGNOSTIC_REGEX,
  RUFF_DIAGNOSTIC_REGEX,
} from "@orchestrai/regex";
import {
  DiagnosticSeverity,
  DiagnosticToolType,
  type HarnessDiagnosticItem,
  type HarnessDiagnosticReport,
} from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";

const logger = loggerWithConfig(new Logger("WorkspaceDiagnosticRunner"));

/** Hard workspace line threshold invariant */
const MAX_FILE_LINES_INVARIANT = 250;

/**
 * Service executing fast single-file lint and compiler diagnostics.
 */
export class WorkspaceDiagnosticRunner {
  /**
   * Evaluates code standards and diagnostics for a modified file.
   *
   * @param filePath - Path to the file that was written or modified
   * @param workspaceRoot - Root sandbox directory
   * @returns Comprehensive diagnostic report
   */
  public runDiagnostics(filePath: string, workspaceRoot: string): HarnessDiagnosticReport {
    const start = Date.now();
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(workspaceRoot, filePath);

    if (!fs.existsSync(resolvedPath)) {
      return {
        passed: true,
        diagnostics: [],
        summary: "File not found for diagnostics check.",
        durationMs: Date.now() - start,
      };
    }

    const diagnostics: HarnessDiagnosticItem[] = [];

    // 1. Core Rule Check: Hard 250-Line Maximum Rule
    const content = fs.readFileSync(resolvedPath, "utf-8");
    const lineCount = content.split("\n").length;
    if (lineCount > MAX_FILE_LINES_INVARIANT) {
      diagnostics.push({
        file: filePath,
        line: lineCount,
        message: `File exceeds 250-line rule invariant (current length: ${lineCount} lines). Decompose into sub-modules immediately.`,
        severity: DiagnosticSeverity.ERROR,
        tool: DiagnosticToolType.WORKSPACE_RULE,
        code: "RULE_250_LINES_EXCEEDED",
      });
    }

    // 2. Language-Specific Linter / Compiler Checks
    const ext = path.extname(resolvedPath).toLowerCase();
    if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
      this.runJavaScriptDiagnostics(resolvedPath, workspaceRoot, diagnostics);
    } else if (ext === ".py") {
      this.runPythonDiagnostics(resolvedPath, workspaceRoot, diagnostics);
    }

    const durationMs = Date.now() - start;
    const errorCount = diagnostics.filter((d) => d.severity === DiagnosticSeverity.ERROR).length;
    const passed = errorCount === 0;

    const summary = passed
      ? `All code standards passed (${diagnostics.length} warnings)`
      : `Failed code standards: ${errorCount} errors detected in ${path.basename(filePath)}`;

    return {
      passed,
      diagnostics,
      summary,
      durationMs,
    };
  }

  /**
   * Executes ESLint on a single JS/TS file if eslint executable exists.
   */
  private runJavaScriptDiagnostics(
    filePath: string,
    workspaceRoot: string,
    diagnostics: HarnessDiagnosticItem[],
  ): void {
    const eslintBin = path.join(workspaceRoot, "node_modules", ".bin", "eslint");
    if (!fs.existsSync(eslintBin)) return;

    try {
      const proc = spawnSync(eslintBin, [filePath, "--format", "compact", "--max-warnings=0"], {
        cwd: workspaceRoot,
        encoding: "utf-8",
        timeout: 8000,
      });

      const output = (proc.stdout || "") + (proc.stderr || "");
      const lines = output.split("\n");

      for (const line of lines) {
        // e.g. path/to/file.ts: line 12, col 5, Error - 'x' is defined but never used. (rule)
        const match = ESLINT_DIAGNOSTIC_REGEX.exec(line);
        if (match) {
          diagnostics.push({
            file: filePath,
            line: Number.parseInt(match[1] || "1", 10),
            column: Number.parseInt(match[2] || "1", 10),
            severity:
              match[3] === "warning" ? DiagnosticSeverity.WARNING : DiagnosticSeverity.ERROR,
            message: match[4] || "ESLint violation",
            code: match[5],
            tool: DiagnosticToolType.ESLINT,
          });
        }
      }
    } catch (err) {
      logger.debug("ESLint execution skipped or failed", { error: String(err) });
    }

    // Run TypeScript compiler check for TS/TSX files
    if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      const tscBin = path.join(workspaceRoot, "node_modules", ".bin", "tsc");
      if (fs.existsSync(tscBin)) {
        try {
          const proc = spawnSync(tscBin, ["--noEmit", filePath], {
            cwd: workspaceRoot,
            encoding: "utf-8",
            timeout: 8000,
          });
          const output = (proc.stdout || "") + (proc.stderr || "");
          for (const line of output.split("\n")) {
            const match = TSC_DIAGNOSTIC_REGEX.exec(line);
            if (match) {
              diagnostics.push({
                file: filePath,
                line: Number.parseInt(match[2] || "1", 10),
                column: Number.parseInt(match[3] || "1", 10),
                code: match[4],
                message: match[5] || "TypeScript compiler error",
                severity: DiagnosticSeverity.ERROR,
                tool: DiagnosticToolType.TSC,
              });
            }
          }
        } catch (err) {
          logger.debug("TSC execution skipped", { error: String(err) });
        }
      }
    }
  }

  /**
   * Executes Ruff or python syntax check on Python files.
   */
  private runPythonDiagnostics(
    filePath: string,
    workspaceRoot: string,
    diagnostics: HarnessDiagnosticItem[],
  ): void {
    try {
      const proc = spawnSync("ruff", ["check", filePath], {
        cwd: workspaceRoot,
        encoding: "utf-8",
        timeout: 5000,
      });

      if (proc.status !== 0) {
        const output = (proc.stdout || "") + (proc.stderr || "");
        const lines = output.split("\n");

        for (const line of lines) {
          const match = RUFF_DIAGNOSTIC_REGEX.exec(line);
          if (match) {
            diagnostics.push({
              file: filePath,
              line: Number.parseInt(match[2] || "1", 10),
              column: Number.parseInt(match[3] || "1", 10),
              code: match[4],
              message: match[5] || "Ruff diagnostic error",
              severity: DiagnosticSeverity.ERROR,
              tool: DiagnosticToolType.RUFF,
            });
          }
        }
      }
    } catch (err) {
      logger.debug("Ruff diagnostic execution skipped", { error: String(err) });
    }
  }
}
