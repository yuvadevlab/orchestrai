/**
 * @file packages/tools/src/registry/tool-registry.types.ts
 * @description Type definitions for LLM-specific tool formatting outputs.
 *
 * ─── Tool Calling Format Differences (Learning note) ─────────────────
 * Every LLM provider expects tools in a slightly different schema shape:
 *
 * 1. OpenAI format:
 *    {
 *      type: "function",
 *      function: { name: "...", description: "...", parameters: { ...jsonSchema } }
 *    }
 *
 * 2. Anthropic format:
 *    {
 *      name: "...",
 *      description: "...",
 *      input_schema: { ...jsonSchema }
 *    }
 *
 * 3. Ollama format:
 *    Matches the OpenAI function definition structure.
 *
 * The registry exports helper methods to convert our internal ToolDefinition
 * directly into these provider formats without repeating conversion code.
 * ───────────────────────────────────────────────────────────────────
 */

/**
 * OpenAI Chat Completions function tool format.
 */
export interface OpenAiFunctionToolFormat {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/**
 * Anthropic Messages API tool format.
 */
export interface AnthropicToolFormat {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/**
 * Ollama chat endpoint tool format (compatible with OpenAI format).
 */
export type OllamaToolFormat = OpenAiFunctionToolFormat;

/**
 * Minimal registry interface used by SandboxExecutor.
 * Decouples the executor from the concrete ToolRegistry class.
 */
export interface IToolRegistry {
  /**
   * Retrieves a registered tool by its name.
   *
   * @param name - The tool's unique name.
   * @returns The ITool instance, or undefined if not registered.
   */
  get(name: string): import("../interfaces/index.js").ITool | undefined;
}
