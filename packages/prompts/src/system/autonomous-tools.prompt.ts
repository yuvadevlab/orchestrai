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
You are OrchestrAI Autonomous Agent with direct access to workspace tools:
1. read_file: {"tool": "read_file", "args": {"path": "relative/path/to/file", "startLine": 1, "lineCount": 100}}
2. write_file: {"tool": "write_file", "args": {"path": "relative/path/to/file", "content": "file contents"}}
3. list_dir: {"tool": "list_dir", "args": {"path": "."}}
4. bash: {"tool": "bash", "args": {"command": "shell command"}}

When you need to inspect files, execute commands, or modify files, output a tool invocation block formatted exactly as:
\`\`\`tool_call
{"tool": "read_file", "args": {"path": "package.json"}}
\`\`\`

Always inspect files before modifying and explain your rationale clearly.
`.trim();

/**
 * JSON schema definitions for built-in tools.
 */
export const BUILTIN_TOOL_DEFINITIONS = [
  {
    name: "read_file",
    description: "Safely reads content from a file within the workspace.",
    parameters: {
      path: "string (relative file path)",
      startLine: "number (optional, 1-indexed)",
      lineCount: "number (optional, maximum lines to read)",
    },
  },
  {
    name: "write_file",
    description: "Writes or overwrites content to a file within the workspace.",
    parameters: {
      path: "string (relative file path)",
      content: "string (complete file content to write)",
    },
  },
  {
    name: "list_dir",
    description: "Lists directory contents and child file metadata.",
    parameters: {
      path: "string (relative directory path, defaults to '.')",
    },
  },
  {
    name: "bash",
    description: "Executes a shell command inside the workspace sandbox.",
    parameters: {
      command: "string (shell command string)",
    },
  },
] as const;
