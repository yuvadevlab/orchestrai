/**
 * @file packages/tools/src/builtins/system/bash.tool.ts
 * @description Command execution tool classified as DANGEROUS requiring Human-In-The-Loop clearance.
 *
 * ─── Shell Execution in AI Agents (Learning note) ───────────────────
 * Giving an LLM shell execution capability is both the most powerful feature
 * and the greatest security risk in an autonomous agent platform.
 *
 * Safety Invariants:
 * 1. Permission level: DANGEROUS — By core invariant, `requiresHumanApproval()`
 *    returns true for this tool. The runtime will NEVER dispatch this tool automatically
 *    without human confirmation in the UI/CLI.
 * 2. `isDestructive: true` — Explicitly flags that actions may not be reversible.
 * 3. Working Directory Jail: `cwd` is validated via `sanitizePath` to prevent running
 *    commands outside the workspace directory.
 * 4. Output Caps: Stdout and Stderr are capped to prevent memory exhaustion or token floods.
 * ───────────────────────────────────────────────────────────────────
 */

import { exec } from "node:child_process";
import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ToolDefinition } from "@orchestrai/core";
import type { ITool, ToolExecutionContext } from "@/interfaces";
import { sanitizePath } from "@/security";

/**
 * Input arguments schema for BashTool.
 */
export const BashInputSchema = z.object({
  command: z.string().min(1).describe("The shell command string to execute"),
  cwd: z.string().optional().describe("Optional working directory relative to workspace root"),
  maxOutputBytes: z
    .number()
    .int()
    .positive()
    .default(50_000)
    .describe("Maximum stdout/stderr bytes returned before truncation"),
});

export type BashInput = z.infer<typeof BashInputSchema>;

/**
 * Output shape returned by BashTool.
 */
export interface BashOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
  readonly isTruncated: boolean;
}

/**
 * Tool for executing shell commands with strict safety caps and human clearance mandates.
 */
export class BashTool implements ITool<BashInput, BashOutput> {
  public readonly definition: ToolDefinition = {
    name: "bash",
    description:
      "Executes a bash shell command within the workspace. DANGEROUS: Requires explicit human operator authorization.",
    permissionLevel: ToolPermissionLevel.DANGEROUS,
    parametersSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command string" },
        cwd: { type: "string", description: "Working directory relative to workspace" },
        maxOutputBytes: {
          type: "integer",
          default: 50000,
          description: "Max output bytes",
        },
      },
      required: ["command"],
    },
    timeoutMs: 60_000,
    isDestructive: true,
  };

  public readonly inputSchema = BashInputSchema;

  /**
   * Executes the shell command in a child process with sandbox boundary checks.
   */
  async execute(args: BashInput, context: ToolExecutionContext): Promise<BashOutput> {
    const root = context.workspaceRoot ?? process.cwd();
    const workingDir = args.cwd ? sanitizePath(args.cwd, root) : root;

    return new Promise((resolve, reject) => {
      const child = exec(
        args.command,
        {
          cwd: workingDir,
          maxBuffer: args.maxOutputBytes * 2,
          signal: context.abortSignal,
        },
        (error, stdout, stderr) => {
          const outStr = stdout.toString();
          const errStr = stderr.toString();

          const isTruncated =
            Buffer.byteLength(outStr, "utf8") > args.maxOutputBytes ||
            Buffer.byteLength(errStr, "utf8") > args.maxOutputBytes;

          const trimmedOut = outStr.slice(0, args.maxOutputBytes);
          const trimmedErr = errStr.slice(0, args.maxOutputBytes);

          // If child process returned a non-zero exit code or error
          if (error && typeof error.code === "number") {
            resolve({
              stdout: trimmedOut,
              stderr: trimmedErr || error.message,
              exitCode: error.code,
              isTruncated,
            });
            return;
          }

          if (error) {
            reject(error);
            return;
          }

          resolve({
            stdout: trimmedOut,
            stderr: trimmedErr,
            exitCode: child.exitCode ?? 0,
            isTruncated,
          });
        },
      );
    });
  }
}
