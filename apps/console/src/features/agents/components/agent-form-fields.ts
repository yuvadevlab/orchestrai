/**
 * @file agent-form-fields.ts
 * @description Form field specifications for the agent creation ActionDialog.
 * @module apps/console/features/agents/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";

export const AGENT_FIELDS: FormFieldSpec[] = [
  {
    name: "name",
    label: "Agent Name",
    placeholder: "e.g. Data Analysis Specialist",
    required: true,
  },
  {
    name: "systemPrompt",
    label: "System Instructions",
    placeholder: "Define agent behavior...",
    type: "textarea",
    required: true,
  },
  {
    name: "mode",
    label: "Execution Role",
    type: "select",
    options: [
      { value: "Specialist", label: "Specialist Agent" },
      { value: "Supervisor", label: "Supervisor Orchestrator" },
    ],
  },
  { name: "tools", label: "Enabled Tools", placeholder: "sql, web_search, filesystem" },
];
