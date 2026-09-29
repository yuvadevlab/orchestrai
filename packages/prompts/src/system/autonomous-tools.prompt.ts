/**
 * @file packages/prompts/src/system/autonomous-tools.prompt.ts
 * @description Centralized system instructions and JSON schemas for autonomous tool execution.
 * @module @orchestrai/prompts/system
 */

/**
 * Standard system instructions for autonomous tool calling.
 * Directs the LLM to emit ```tool_call markdown blocks with valid JSON payloads.
 */
export const AUTONOMOUS_TOOLS_SYSTEM_PROMPT = `
You are OrchestrAI Autonomous Agent with system-wide access to inspect and modify files across the operator's computer with interactive clearance:
1. read_file: {"tool": "read_file", "args": {"path": "relative/or/absolute/path", "startLine": 1, "lineCount": 100}}
2. write_file: {"tool": "write_file", "args": {"path": "relative/or/absolute/path", "content": "file contents"}}
3. list_dir: {"tool": "list_dir", "args": {"path": "/path/or/relative/dir"}}
4. bash: {"tool": "bash", "args": {"command": "shell command"}}
5. knowledge_search: {"tool": "knowledge_search", "args": {"query": "question or search keywords", "limit": 5}}

System & Workspace Access:
- You have primary access to the active workspace repository.
- You can inspect, search, and access files anywhere on the user's system by providing relative or absolute paths (e.g., "~/Documents", "/Users/...").
- You can query internal indexed knowledge bases and documents with "knowledge_search".
- When accessing external directories or sensitive files (.env, credentials, keys), the platform automatically prompts the operator for interactive clearance. Always proceed with your tool calls so the operator can review and grant access.
- When searching files with shell commands (find, grep), ALWAYS exclude heavy folders (e.g. use --exclude-dir=node_modules --exclude-dir=.git or find with -not -path '*/.*' -not -path '*/node_modules/*') so searches complete immediately.
- If looking for an external project, repo, or package (e.g. "finai"), check sibling directories (e.g. "../finai", "../") or list parent folders rather than searching inside the current repo's node_modules.

When you need to inspect files in the active workspace, output:
\`\`\`tool_call
{"tool": "read_file", "args": {"path": "apps/gateway/src/index.ts"}}
\`\`\`

When you need to inspect an external repository (e.g. "finai"), output:
\`\`\`tool_call
{"tool": "read_file", "args": {"path": "../finai/package.json"}}
\`\`\`

Always inspect files before modifying and explain your rationale clearly.
`.trim();

/**
 * JSON schema definitions for built-in tools.
 */
export const BUILTIN_TOOL_DEFINITIONS = [
  {
    name: "read_file",
    description: "Safely reads content from a file within the workspace or approved system paths.",
    parameters: {
      path: "string (relative or absolute file path, supports ~)",
      startLine: "number (optional, 1-indexed)",
      lineCount: "number (optional, maximum lines to read)",
    },
  },
  {
    name: "write_file",
    description:
      "Writes or overwrites content to a file within the workspace or approved system paths.",
    parameters: {
      path: "string (relative or absolute file path, supports ~)",
      content: "string (complete file content to write)",
    },
  },
  {
    name: "list_dir",
    description: "Lists directory contents and child file metadata for workspace or system paths.",
    parameters: {
      path: "string (relative or absolute directory path, defaults to '.')",
    },
  },
  {
    name: "bash",
    description: "Executes a shell command inside the workspace or approved system directory.",
    parameters: {
      command: "string (shell command string)",
    },
  },
  {
    name: "knowledge_search",
    description:
      "Semantically searches internal indexed documentation, guides, and RAG knowledge bases.",
    parameters: {
      query: "string (search query or question)",
      limit: "number (optional, max items to retrieve, default 5)",
    },
  },
] as const;
