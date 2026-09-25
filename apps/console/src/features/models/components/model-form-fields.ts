/**
 * @file model-form-fields.ts
 * @description Form field generator for model creation using live provider options.
 * @module apps/console/features/models/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";
import type { LlmProvider } from "../types";

/**
 * Builds form field specifications with available providers.
 */
export function buildModelFields(providers: LlmProvider[]): FormFieldSpec[] {
  return [
    {
      name: "providerId",
      label: "Provider",
      type: "select",
      options: providers.map((p) => ({ label: p.name, value: p.providerId })),
      required: true,
      colSpan: 1,
    },
    {
      name: "name",
      label: "Display Name",
      placeholder: "e.g. Primary Model",
      required: true,
      colSpan: 1,
    },
    {
      name: "modelIdentifier",
      label: "Model Identifier",
      placeholder: "e.g. model-identifier-tag",
      required: true,
      colSpan: 1,
    },
    {
      name: "contextWindow",
      label: "Context Window (tokens)",
      placeholder: "32768",
      colSpan: 1,
    },
    {
      name: "isDefault",
      label: "Default Engine",
      type: "select",
      options: [
        { value: "false", label: "Standard Catalog Model" },
        { value: "true", label: "Default AI Engine" },
      ],
      defaultValue: "false",
      colSpan: 2,
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Model capabilities and notes...",
      type: "textarea",
      colSpan: 2,
    },
  ];
}
