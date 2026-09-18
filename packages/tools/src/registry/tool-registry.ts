/**
 * @file packages/tools/src/registry/tool-registry.ts
 * @description Central catalog and discovery registry for OrchestrAI tools.
 *
 * ─── The Tool Registry Pattern (Learning note) ──────────────────────
 * Instead of passing tool instances directly across various sub-agents or
 * graph nodes, the application registers all available tools in a single
 * `ToolRegistry`.
 *
 * This provides:
 * 1. Single source of discovery: look up any tool by name.
 * 2. Schema generation: formats all registered tools into OpenAI or Anthropic schemas.
 * 3. Security filtering: dynamically restrict tools based on agent permission level.
 * ───────────────────────────────────────────────────────────────────
 */

import { OrchestrAIError } from "@orchestrai/core";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import type { ITool } from "@/interfaces";
import type { AnthropicToolFormat, OpenAiFunctionToolFormat } from "./tool-registry.types";

/**
 * In-memory registry managing the lifecycle, retrieval, and formatting of tools.
 */
export class ToolRegistry {
  private readonly tools = new Map<string, ITool>();

  /**
   * Registers an executable tool with the platform.
   *
   * @param tool - Tool instance implementing ITool.
   * @param allowOverwrite - If false, throws an error when a tool with the same name exists.
   * @returns This registry instance for chaining.
   * @throws {OrchestrAIError} with code VALIDATION_ERROR if duplicate registration is attempted.
   */
  public register(tool: ITool, allowOverwrite = false): this {
    const name = tool.definition.name;

    if (!allowOverwrite && this.tools.has(name)) {
      throw new OrchestrAIError(
        `Tool with name "${name}" is already registered in this registry`,
        "VALIDATION_ERROR",
        409,
        { toolName: name },
      );
    }

    this.tools.set(name, tool);
    return this;
  }

  /**
   * Retrieves a registered tool by its name.
   *
   * @param name - The tool identifier string.
   * @returns The registered ITool, or undefined if not found.
   */
  public get(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  /**
   * Retrieves a tool by name, throwing a NOT_FOUND error if it is not registered.
   *
   * @param name - The tool identifier string.
   * @returns The registered ITool instance.
   * @throws {OrchestrAIError} with code NOT_FOUND if the tool is absent.
   */
  public getOrThrow(name: string): ITool {
    const tool = this.get(name);
    if (!tool) {
      throw new OrchestrAIError(
        `Tool "${name}" is not registered in this registry`,
        "NOT_FOUND",
        404,
        { toolName: name },
      );
    }
    return tool;
  }

  /**
   * Checks whether a tool with the given name is registered.
   *
   * @param name - Tool identifier string.
   * @returns True if registered.
   */
  public has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Unregisters a tool from the registry.
   *
   * @param name - Tool identifier string.
   * @returns True if the tool was present and removed, false otherwise.
   */
  public unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Returns a snapshot array of all currently registered tools.
   *
   * @returns Array of ITool instances.
   */
  public list(): ITool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Returns the count of registered tools.
   */
  public get size(): number {
    return this.tools.size;
  }

  /**
   * Filters tools matching a maximum permission clearance level.
   *
   * @param maxLevel - The maximum allowed permission tier.
   * @returns Array of tools whose permission level is at or below maxLevel.
   */
  public findByPermission(maxLevel: ToolPermissionLevel): ITool[] {
    // Hierarchy weights for filtering
    const weights: Record<ToolPermissionLevel, number> = {
      [ToolPermissionLevel.READ_ONLY]: 1,
      [ToolPermissionLevel.WRITE_SAFE]: 2,
      [ToolPermissionLevel.SENSITIVE]: 3,
      [ToolPermissionLevel.DANGEROUS]: 4,
    };

    const targetWeight = weights[maxLevel];
    return this.list().filter((t) => weights[t.definition.permissionLevel] <= targetWeight);
  }

  /**
   * Formats registered tools into the OpenAI function calling schema format.
   *
   * @param tools - Optional subset of tools; defaults to all registered tools.
   * @returns Array of OpenAI function tool definition objects.
   */
  public toOpenAiFormat(tools?: ITool[]): OpenAiFunctionToolFormat[] {
    const list = tools ?? this.list();
    return list.map((t) => ({
      type: "function",
      function: {
        name: t.definition.name,
        description: t.definition.description,
        parameters: t.definition.parametersSchema,
      },
    }));
  }

  /**
   * Formats registered tools into the Anthropic Messages API tool format.
   *
   * @param tools - Optional subset of tools; defaults to all registered tools.
   * @returns Array of Anthropic tool definition objects.
   */
  public toAnthropicFormat(tools?: ITool[]): AnthropicToolFormat[] {
    const list = tools ?? this.list();
    return list.map((t) => ({
      name: t.definition.name,
      description: t.definition.description,
      input_schema: t.definition.parametersSchema,
    }));
  }
}
