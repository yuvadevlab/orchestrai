/**
 * @file model-form-fields.ts
 * @description Form field specifications for the model provider ActionDialog.
 * @module apps/console/features/models/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";

export const MODEL_FIELDS: FormFieldSpec[] = [
  {
    name: "provider",
    label: "Provider Name",
    placeholder: "e.g. Ollama Local / OpenAI / Anthropic",
    required: true,
  },
  {
    name: "model",
    label: "Model Identifier",
    placeholder: "e.g. qwen2.5:7b or gpt-4o",
    required: true,
  },
  {
    name: "baseUrl",
    label: "API Base Endpoint URL",
    placeholder: "e.g. http://localhost:11434/v1",
  },
  { name: "apiKey", label: "API Key (if required)", placeholder: "sk-..." },
];
