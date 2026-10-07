"use client";

/**
 * @file apps/console/src/features/knowledge/components/knowledge-upload-dialog.tsx
 * @description Modal dialog for ingesting new text, markdown, or code documents into RAG vector storage.
 * @module apps/console/features/knowledge/components
 */

import React from "react";
import { toast } from "@yuva-devlab/ui";
import { FormDialog, type FormFieldConfig } from "@/components/ui";
import { formatApiError } from "@/lib/error-utils";
import { DocumentMimeType } from "@orchestrai/shared-types";
import { LEADING_TRAILING_DASH_REGEX } from "@orchestrai/regex";
import { UI_COPY } from "@/lib/ui-copy";
import { useIngestDocument } from "../api";

export interface KnowledgeUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UPLOAD_FIELDS: FormFieldConfig[] = [
  {
    name: "title",
    label: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.TITLE_LABEL,
    type: "text",
    placeholder: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.TITLE_PLACEHOLDER,
    required: true,
  },
  {
    name: "mimeType",
    label: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.FORMAT_LABEL,
    type: "select",
    defaultValue: DocumentMimeType.MARKDOWN,
    options: [
      {
        value: DocumentMimeType.MARKDOWN,
        label: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.FORMAT_MARKDOWN,
      },
      {
        value: DocumentMimeType.PLAIN_TEXT,
        label: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.FORMAT_PLAIN_TEXT,
      },
      {
        value: DocumentMimeType.JSON,
        label: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.FORMAT_JSON,
      },
      {
        value: DocumentMimeType.CSV,
        label: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.FORMAT_CSV,
      },
    ],
  },
  {
    name: "content",
    label: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.CONTENT_LABEL,
    type: "textarea",
    placeholder: UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.CONTENT_PLACEHOLDER,
    required: true,
  },
];

/**
 * Modal form dialog for ingesting raw knowledge documents.
 */
export function KnowledgeUploadDialog({
  isOpen,
  onClose,
  onSuccess,
}: KnowledgeUploadDialogProps): React.JSX.Element | null {
  const ingestMutation = useIngestDocument();

  const handleSubmit = async (formData: Record<string, string>): Promise<void> => {
    try {
      const derivedSlug = (formData.title || UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.DEFAULT_SLUG)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(LEADING_TRAILING_DASH_REGEX, "");
      await ingestMutation.mutateAsync({
        title: formData.title || UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.UNTITLED_DOC,
        sourceUri: formData.sourceUri || `manual://${derivedSlug}`,
        mimeType: formData.mimeType || DocumentMimeType.MARKDOWN,
        content: formData.content || "",
      });
      toast.success(UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.TOAST_SUCCESS);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title={UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.TITLE}
      description={UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.DESCRIPTION}
      fields={UPLOAD_FIELDS}
      submitText={UI_COPY.KNOWLEDGE.UPLOAD_DIALOG.SUBMIT_BUTTON}
      maxWidth="md"
      columns={1}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
