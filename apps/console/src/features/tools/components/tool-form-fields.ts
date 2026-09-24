/**
 * @file tool-form-fields.ts
 * @description Dynamic form field generator for tool registration ActionDialog.
 * Generates options dynamically from live database permissions and tools catalog.
 * Strictly zero hardcoded permissions or policies.
 * @module apps/console/features/tools/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";
import type { ToolPermissionRecord } from "../api/use-permissions";
import type { ToolDefinition } from "../types";

/**
 * Builds form field specifications for tool registration from database records.
 *
 * @param permissions - Live permission tiers from database.
 * @param tools - Live tools catalog from database for discovering categories.
 * @returns Array of form field specifications for FormDialog.
 */
export function buildToolFields(
  permissions: readonly ToolPermissionRecord[] = [],
  tools: readonly ToolDefinition[] = [],
): FormFieldSpec[] {
  // Map permission options dynamically from database
  const permissionOptions =
    permissions.length > 0
      ? permissions.map((p) => ({
          value: p.level,
          label: p.name,
        }))
      : [];

  const defaultPermission = permissions[0]?.level || "";

  // Derive available categories dynamically from database tools
  const uniqueCategories = Array.from(new Set(tools.map((t) => t.category).filter(Boolean)));

  const categoryOptions =
    uniqueCategories.length > 0 ? uniqueCategories.map((c) => ({ value: c, label: c })) : [];

  const defaultCategory = categoryOptions[0]?.value || "";

  return [
    {
      name: "name",
      label: "Tool Identifier / Name",
      placeholder: "e.g. web_search_v2",
      required: true,
      colSpan: 1,
    },
    {
      name: "category",
      label: "Functional Category",
      type: "select",
      options: categoryOptions,
      defaultValue: defaultCategory,
      required: true,
      colSpan: 1,
    },
    {
      name: "permissions",
      label: "Permission & Safety Tier",
      type: "select",
      options: permissionOptions,
      defaultValue: defaultPermission,
      required: true,
      colSpan: 2,
    },
    {
      name: "description",
      label: "Capability Specification",
      placeholder: "Describe what this tool enables and expected parameters...",
      type: "textarea",
      required: true,
      colSpan: 2,
    },
  ];
}
