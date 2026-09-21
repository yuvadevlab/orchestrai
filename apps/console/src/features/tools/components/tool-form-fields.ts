/**
 * @file tool-form-fields.ts
 * @description Form field specifications for the tool registration ActionDialog.
 * @module apps/console/features/tools/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";

export const TOOL_FIELDS: FormFieldSpec[] = [
  { name: "name", label: "Tool ID / Name", placeholder: "e.g. web_search_v2", required: true },
  {
    name: "description",
    label: "Tool Capability Specification",
    placeholder: "Describe what this tool enables...",
    type: "textarea",
    required: true,
  },
  { name: "category", label: "Category", placeholder: "e.g. Search, FileSystem, Database" },
];
