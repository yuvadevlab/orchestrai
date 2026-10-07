/**
 * @file apps/gateway/src/services/autonomous-agent-runner.ts
 * @description Autonomous tool-calling executor providing filesystem access, planning, and bash tools.
 * All tool name comparisons use `WorkspaceTool` enum — never bare string literals.
 * @module apps/gateway/services
 */

import { randomUUID } from "node:crypto";
import path from "node:path";
import { buildAutonomousSystemPrompt } from "@orchestrai/prompts";
import { ArtifactType, ArtifactStatus, WorkspaceTool } from "@orchestrai/shared-types";
import { TOOL_CALL_BLOCK_REGEX } from "@orchestrai/regex";
import { resolveMonorepoRoot, executeWorkspaceTool } from "./workspace-tool-executor";

export { buildAutonomousSystemPrompt, resolveMonorepoRoot, executeWorkspaceTool };

/** Visual artifact metadata derived from a single tool execution result. */
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
 * Extracts and parses any ```tool_call blocks from generated model text.
 *
 * @param text - Raw model-generated text that may contain a fenced tool_call block
 * @returns Parsed tool name and args, or null if no valid block found
 */
export function extractToolCall(
  text: string,
): { tool: string; args: Record<string, unknown> } | null {
  const match = TOOL_CALL_BLOCK_REGEX.exec(text);
  if (!match || !match[1]) return null;

  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed && typeof parsed.tool === "string" && typeof parsed.args === "object") {
      return { tool: parsed.tool, args: parsed.args };
    }
  } catch {
    // Malformed JSON block — silently ignore
  }
  return null;
}

/**
 * Detects the syntax-highlight language identifier from a file path extension.
 *
 * @param filePath - Absolute or relative path to a file
 * @returns Language string for Monaco / Prism rendering
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
 * Creates visual artifact metadata from a tool execution result.
 * Determines ArtifactType from WorkspaceTool enum — never raw string comparison.
 *
 * @param tool - The canonical WorkspaceTool value that was invoked
 * @param args - Arguments the tool was called with
 * @param result - Raw tool execution output and error flag
 * @returns Structured ToolArtifact ready for SSE emission
 */
export function formatToolArtifact(
  tool: WorkspaceTool,
  args: Record<string, unknown>,
  result: { output: unknown; isError: boolean },
): ToolArtifact {
  const status = result.isError ? ArtifactStatus.ERROR : ArtifactStatus.SUCCESS;
  const contentStr =
    typeof result.output === "object"
      ? JSON.stringify(result.output, null, 2)
      : String(result.output);

  if (tool === WorkspaceTool.READ_FILE) {
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

  if (tool === WorkspaceTool.WRITE_FILE) {
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

  if (tool === WorkspaceTool.BASH) {
    const cmd = String(args.command || "command");
    return {
      id: randomUUID(),
      type: ArtifactType.TERMINAL,
      title: `Terminal: ${cmd.slice(0, 40)}`,
      content: contentStr,
      status,
    };
  }

  if (tool === WorkspaceTool.KNOWLEDGE_SEARCH) {
    const q = String(args.query || "Search");
    return {
      id: randomUUID(),
      type: ArtifactType.SEARCH,
      title: `Knowledge: ${q.slice(0, 36)}`,
      content: contentStr,
      status,
    };
  }

  if (tool === WorkspaceTool.VERIFY_CODE) {
    const targetPath = String(args.path || "workspace");
    return {
      id: randomUUID(),
      type: ArtifactType.CODE,
      title: `Verification: ${targetPath}`,
      filePath: targetPath,
      language: detectLanguage(targetPath),
      content: contentStr,
      status,
    };
  }

  if (tool === WorkspaceTool.READ_SKILL) {
    const skillName = String(args.name || "Skill");
    return {
      id: randomUUID(),
      type: ArtifactType.DOCUMENT,
      title: `Skill: ${skillName}`,
      content: contentStr,
      status,
    };
  }

  if (tool === WorkspaceTool.LIST_SKILLS) {
    return {
      id: randomUUID(),
      type: ArtifactType.DOCUMENT,
      title: "Workspace Discovered Skills",
      content: contentStr,
      status,
    };
  }

  // LIST_DIR and any future tools fall through to DOCUMENT
  return {
    id: randomUUID(),
    type: ArtifactType.DOCUMENT,
    title: `Tool: ${tool}`,
    content: contentStr,
    status,
  };
}

/**
 * Coerces a raw string from model output into a typed `WorkspaceTool` enum member.
 * Returns null if the string does not match any known tool — caller should skip the dispatch.
 *
 * @param raw - Untrusted string from parsed model JSON (e.g. "read_file")
 * @returns Canonical WorkspaceTool or null if unrecognised
 */
export function coerceWorkspaceTool(raw: string): WorkspaceTool | null {
  /** Validates raw string is a valid WorkspaceTool value without Object.values allocation on hot path. */
  if (Object.values(WorkspaceTool).includes(raw as WorkspaceTool)) {
    return raw as WorkspaceTool;
  }
  return null;
}
