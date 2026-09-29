/**
 * @file apps/gateway/src/services/autonomous-agent-runner.ts
 * @description Autonomous tool-calling executor providing filesystem access, planning, and bash tools.
 * @module apps/gateway/services
 */

import {
  ReadFileTool,
  WriteFileTool,
  ListDirectoryTool,
  BashTool,
  KnowledgeSearchTool,
} from "@orchestrai/tools";
import { buildAutonomousSystemPrompt } from "@orchestrai/prompts";
import { ArtifactType, ArtifactStatus } from "@orchestrai/shared-types";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ragService } from "@/modules/rag/rag.service";

export { buildAutonomousSystemPrompt };

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

export interface ToolArtifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  filePath?: string;
  language?: string;
  status: ArtifactStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Traverses upward from starting directory to discover monorepo workspace root containing pnpm-workspace.yaml.
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
 * Executes a single tool by name with provided arguments within workspace sandbox.
 */
export async function executeWorkspaceTool(
  toolName: string,
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
      case "read_file": {
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
      case "write_file": {
        const filePath = String(args.path || "");
        const content = String(args.content || "");
        const res = await writeFile.execute(
          { path: filePath, content, createDirectories: true },
          context,
        );
        return { output: res, isError: false };
      }
      case "list_dir": {
        const dirPath = String(args.path || ".");
        const res = await listDir.execute(
          { path: dirPath, recursive: false, maxEntries: 100 },
          context,
        );
        return { output: res, isError: false };
      }
      case "bash": {
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
      case "knowledge_search": {
        const query = String(args.query || "");
        const limit = typeof args.limit === "number" ? args.limit : 5;
        const minScore = typeof args.minScore === "number" ? args.minScore : 0.3;
        const res = await knowledgeSearch.execute({ query, limit, minScore }, context);
        return { output: res.contextText, isError: false };
      }
      default:
        return { output: `Unknown tool: ${toolName}`, isError: true };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { output: msg, isError: true };
  }
}

/**
 * Extracts and parses any ```tool_call blocks from generated model text.
 */
export function extractToolCall(
  text: string,
): { tool: string; args: Record<string, unknown> } | null {
  const match = /```(?:tool_call|json)\s*\n?([\s\S]*?)\n?```/.exec(text);
  if (!match || !match[1]) return null;

  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed && typeof parsed.tool === "string" && typeof parsed.args === "object") {
      return { tool: parsed.tool, args: parsed.args };
    }
  } catch {
    // Malformed JSON block ignored
  }
  return null;
}

/**
 * Helper to detect code language extension from file path.
 */
function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".ts" || ext === ".tsx") return "typescript";
  if (ext === ".js" || ext === ".jsx") return "javascript";
  if (ext === ".json") return "json";
  if (ext === ".md") return "markdown";
  if (ext === ".css") return "css";
  if (ext === ".html") return "html";
  if (ext === ".py") return "python";
  if (ext === ".sh") return "bash";
  return "text";
}

/**
 * Creates visual artifact metadata from tool execution result.
 */
export function formatToolArtifact(
  tool: string,
  args: Record<string, unknown>,
  result: { output: unknown; isError: boolean },
): ToolArtifact {
  const status = result.isError ? ArtifactStatus.ERROR : ArtifactStatus.SUCCESS;
  const contentStr =
    typeof result.output === "object"
      ? JSON.stringify(result.output, null, 2)
      : String(result.output);

  if (tool === "read_file") {
    const filePath = String(args.path || "file");
    return {
      id: randomUUID(),
      type: ArtifactType.CODE,
      title: `Read: ${filePath}`,
      filePath,
      language: detectLanguage(filePath),
      content: contentStr,
      status,
    };
  }

  if (tool === "write_file") {
    const filePath = String(args.path || "file");
    return {
      id: randomUUID(),
      type: ArtifactType.CODE,
      title: `Modified: ${filePath}`,
      filePath,
      language: detectLanguage(filePath),
      content: String(args.content || ""),
      status,
    };
  }

  if (tool === "bash") {
    const cmd = String(args.command || "command");
    return {
      id: randomUUID(),
      type: ArtifactType.TERMINAL,
      title: `Terminal: ${cmd.slice(0, 40)}`,
      content: contentStr,
      status,
    };
  }

  if (tool === "knowledge_search") {
    const q = String(args.query || "Search");
    return {
      id: randomUUID(),
      type: ArtifactType.SEARCH,
      title: `Knowledge: ${q.slice(0, 36)}`,
      content: contentStr,
      status,
    };
  }

  return {
    id: randomUUID(),
    type: ArtifactType.DOCUMENT,
    title: `Tool: ${tool}`,
    content: contentStr,
    status,
  };
}
