/**
 * @file types.ts
 * @description Type definitions for registered execution tools and plugin capabilities.
 * @module apps/console/features/tools
 */

/**
 * Tool category classification.
 */
export type ToolCategory = string;

/**
 * Tool definition entity mapped directly from the platform_tools database table.
 */
export interface ToolDefinition {
  toolId?: string;
  name: string;
  slug?: string;
  category: ToolCategory;
  description?: string;
  permissionLevel?: string;
  sandbox?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}
