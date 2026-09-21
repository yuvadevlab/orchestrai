/**
 * @file conversation-form-fields.ts
 * @description Form field specifications for the conversation creation ActionDialog.
 * @module apps/console/features/conversations/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";

export const CONVERSATION_FIELDS: FormFieldSpec[] = [
  {
    name: "title",
    label: "Session Topic / Title",
    placeholder: "e.g. Architecture Optimization Session",
    required: true,
  },
  { name: "agent", label: "Target Agent Role", placeholder: "e.g. Supervisor / Developer Agent" },
  {
    name: "initialPrompt",
    label: "Initial Prompt",
    placeholder: "State your inquiry...",
    type: "textarea",
  },
];
