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
import { useIngestDocument } from "../api";

export interface KnowledgeUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UPLOAD_FIELDS: FormFieldConfig[] = [
  {
    name: "title",
    label: "Document Title",
    type: "text",
    placeholder: "e.g. Architecture Guide, API Reference, Company Guidelines",
    required: true,
  },
  {
    name: "sourceUri",
    label: "Source URI / Identifier",
    type: "text",
    placeholder: "e.g. manual://docs/architecture.md",
    required: true,
    defaultValue: "manual://doc",
  },
  {
    name: "mimeType",
    label: "MIME Type",
    type: "select",
    defaultValue: DocumentMimeType.MARKDOWN,
    options: [
      { value: DocumentMimeType.MARKDOWN, label: "Markdown (.md)" },
      { value: DocumentMimeType.PLAIN_TEXT, label: "Plain Text (.txt)" },
      { value: DocumentMimeType.JSON, label: "JSON Data (.json)" },
      { value: DocumentMimeType.CSV, label: "CSV Table (.csv)" },
    ],
  },
  {
    name: "content",
    label: "Document Content",
    type: "textarea",
    placeholder:
      "Paste or write the text content to be chunked and indexed into the vector store...",
    required: true,
    colSpan: 2,
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
      await ingestMutation.mutateAsync({
        title: formData.title || "Untitled Document",
        sourceUri: formData.sourceUri || "manual://doc",
        mimeType: formData.mimeType || "text/markdown",
        content: formData.content || "",
      });
      toast.success("Document ingested and vector-indexed successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Add Knowledge Document"
      description="Ingest and chunk text or markdown into hybrid vector storage for swarm retrieval."
      fields={UPLOAD_FIELDS}
      submitText="Ingest Document"
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
