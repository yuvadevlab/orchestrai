/**
 * @file knowledge-form-fields.ts
 * @description Form field specifications for the knowledge ingestion ActionDialog.
 * @module apps/console/features/knowledge/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";

export const KNOWLEDGE_FIELDS: FormFieldSpec[] = [
  {
    name: "title",
    label: "Document Title",
    placeholder: "e.g. System Architecture Specification v2",
    required: true,
  },
  {
    name: "content",
    label: "Document Text / Spec Content",
    placeholder: "Paste markdown or spec text...",
    type: "textarea",
    required: true,
  },
  {
    name: "source",
    label: "Source URL or Tag",
    placeholder: "e.g. https://docs.internal/architecture",
  },
];
