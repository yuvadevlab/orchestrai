/**
 * @file workflow-form-fields.ts
 * @description Form field specifications for the workflow creation ActionDialog.
 * @module apps/console/features/workflows/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";

export const WORKFLOW_FIELDS: FormFieldSpec[] = [
  {
    name: "name",
    label: "Workflow Name",
    placeholder: "e.g. Multi-Agent Code Review Pipeline",
    required: true,
  },
  {
    name: "description",
    label: "Description & Intent",
    placeholder: "Describe the workflow steps...",
    type: "textarea",
    required: true,
  },
  { name: "trigger", label: "Trigger Event", placeholder: "e.g. github.push or manual.dispatch" },
];
