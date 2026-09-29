/**
 * @file apps/gateway/src/modules/streaming/workspace-tool-executor.ts
 * @description Sandboxed workspace tool dispatcher for autonomous agents.
 * All tool dispatch uses `WorkspaceTool` enum — no bare string literals.
 * @module apps/gateway/modules/streaming
 */

import {
  ReadFileTool,
  WriteFileTool,
  ListDirectoryTool,
  BashTool,
  KnowledgeSearchTool,
} from "@orchestrai/tools";
import { WorkspaceTool } from "@orchestrai/shared-types";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ragService } from "@/modules/rag/rag.service";

const readFile = new ReadFileTool();
const writeFile = new WriteFileTool();
const listDir = new ListDirectoryTool();
const bash = new BashTool();
const knowledgeSearch = new KnowledgeSearchTool(async (query, limit, minScore) => {
  const res = await ragService.query(
    { query, limit: limit ?? 5, minScore: minScore ?? 0.3, alpha: 0.5 },
    "default",
  );
  return res.chunks;
});

/**
 * Traverses upward from starting directory to discover monorepo workspace root
 * containing pnpm-workspace.yaml.
 *
 * @param startDir - Starting directory path
 * @returns Discovered workspace root or fallback to startDir
 */
export function resolveMonorepoRoot(startDir: string = process.cwd()): string {
  if (process.env.WORKSPACE_ROOT) {
    return path.resolve(process.env.WORKSPACE_ROOT);
  }
  let current = path.resolve(startDir);
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.resolve(startDir);
}

/**
 * Executes a single tool by canonical WorkspaceTool enum key with provided
 * arguments within workspace sandbox.
 *
 * @param toolName - Canonical WorkspaceTool enum value (e.g. WorkspaceTool.BASH)
 * @param args - Invocation parameters for the tool
 * @param workspaceRoot - Root sandbox directory; auto-resolved if omitted
 * @param allowedRoots - Additional permitted directory paths for file-system tools
 * @returns Tool output payload and execution error indicator
 */
export async function executeWorkspaceTool(
  toolName: WorkspaceTool,
  args: Record<string, unknown>,
  workspaceRoot: string = resolveMonorepoRoot(),
  allowedRoots?: readonly string[],
): Promise<{ output: unknown; isError: boolean }> {
  const targetRoot = workspaceRoot || resolveMonorepoRoot();
  const roots = Array.from(new Set([...(allowedRoots || []), targetRoot]));
  const context = {
    workspaceRoot: targetRoot,
    allowedRoots: roots,
    tenantId: "default",
    executionId: randomUUID(),
  };

  try {
    switch (toolName) {
      case WorkspaceTool.READ_FILE: {
        const filePath = String(args.path || "");
        const startLine = typeof args.startLine === "number" ? args.startLine : undefined;
        const lineCount = typeof args.lineCount === "number" ? args.lineCount : undefined;
        const res = await readFile.execute({ path: filePath, startLine, lineCount }, context);
        const repo = path.basename(context.workspaceRoot || "");
        const isCurrent = res.resolvedPath.startsWith(context.workspaceRoot || "");
        const header = isCurrent
          ? `[File: "${filePath}" (Workspace: "${repo}", path: ${res.resolvedPath})]`
          : `[File: "${filePath}" (External Project, path: ${res.resolvedPath})]`;
        return { output: `${header}\n\n${res.content}`, isError: false };
      }
      case WorkspaceTool.WRITE_FILE: {
        const filePath = String(args.path || "");
        const content = String(args.content || "");
        const res = await writeFile.execute(
          { path: filePath, content, createDirectories: true },
          context,
        );
        return { output: res, isError: false };
      }
      case WorkspaceTool.LIST_DIR: {
        const dirPath = String(args.path || ".");
        const res = await listDir.execute(
          { path: dirPath, recursive: false, maxEntries: 100 },
          context,
        );
        return { output: res, isError: false };
      }
      case WorkspaceTool.BASH: {
        const command = String(args.command || "");
        const cwdArg = typeof args.cwd === "string" ? args.cwd : undefined;
        const res = await bash.execute({ command, cwd: cwdArg, maxOutputBytes: 50000 }, context);
        const outputText =
          (res.stdout || "").trim() ||
          (res.stderr || "").trim() ||
          (res.exitCode === 0
            ? "Command executed successfully with exit code 0."
            : `Command failed with exit code ${res.exitCode}.`);
        return { output: outputText, isError: res.exitCode !== 0 };
      }
      case WorkspaceTool.KNOWLEDGE_SEARCH: {
        const query = String(args.query || "");
        const limit = typeof args.limit === "number" ? args.limit : 5;
        const minScore = typeof args.minScore === "number" ? args.minScore : 0.3;
        const res = await knowledgeSearch.execute({ query, limit, minScore }, context);
        return { output: res.contextText, isError: false };
      }
      default: {
        // Exhaustive guard — TypeScript will error if a new WorkspaceTool member is added
        // without a corresponding case above.
        const _unreachable: never = toolName;
        return { output: `Unknown tool: ${String(_unreachable)}`, isError: true };
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { output: msg, isError: true };
  }
}
