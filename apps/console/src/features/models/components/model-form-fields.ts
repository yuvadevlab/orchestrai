/**
 * @file model-form-fields.ts
 * @description Form field generator for model creation using live provider options.
 * @module apps/console/features/models/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";
import { UI_COPY } from "@/lib/ui-copy";
import type { LlmProvider } from "../types";

/**
 * Builds form field specifications with available providers.
 */
export function buildModelFields(providers: LlmProvider[]): FormFieldSpec[] {
  return [
    {
      name: "providerId",
      label: UI_COPY.MODELS.DIALOG.PROVIDER_LABEL,
      type: "select",
      options: providers.map((p) => ({ label: p.name, value: p.providerId })),
      required: true,
      colSpan: 1,
    },
    {
      name: "name",
      label: UI_COPY.MODELS.DIALOG.NAME_LABEL,
      placeholder: UI_COPY.MODELS.DIALOG.NAME_PLACEHOLDER,
      required: true,
      colSpan: 1,
    },
    {
      name: "modelIdentifier",
      label: UI_COPY.MODELS.DIALOG.IDENTIFIER_LABEL,
      placeholder: UI_COPY.MODELS.DIALOG.IDENTIFIER_PLACEHOLDER,
      required: true,
      colSpan: 1,
    },
    {
      name: "contextWindow",
      label: UI_COPY.MODELS.DIALOG.CONTEXT_WINDOW_LABEL,
      placeholder: UI_COPY.MODELS.DIALOG.CONTEXT_WINDOW_PLACEHOLDER,
      colSpan: 1,
    },
    {
      name: "isDefault",
      label: UI_COPY.MODELS.DIALOG.DEFAULT_ENGINE_LABEL,
      type: "select",
      options: [
        { value: "false", label: UI_COPY.MODELS.DIALOG.STANDARD_MODEL_LABEL },
        { value: "true", label: UI_COPY.MODELS.DIALOG.DEFAULT_MODEL_LABEL },
      ],
      defaultValue: "false",
      colSpan: 2,
    },
    {
      name: "description",
      label: UI_COPY.MODELS.DIALOG.DESC_LABEL,
      placeholder: UI_COPY.MODELS.DIALOG.DESC_PLACEHOLDER,
      type: "textarea",
      colSpan: 2,
    },
  ];
}
