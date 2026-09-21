"use client";

/**
 * @file knowledge-dialog.tsx
 * @description Dedicated modal dialog component for ingesting RAG knowledge documents.
 * @module apps/console/features/knowledge/components
 */

import React from "react";
import { FormDialog } from "@/components/ui";
import { KNOWLEDGE_FIELDS } from "./knowledge-form-fields";

export interface KnowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

/**
 * Modal dialog for ingesting a document into the RAG vector store.
 */
export function KnowledgeDialog({
  isOpen,
  onClose,
  onSuccess,
}: KnowledgeDialogProps): React.JSX.Element | null {
  const handleIngestDoc = async (_formData: Record<string, string>): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600));
    await onSuccess();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Ingest Knowledge Document"
      description="Parse and vectorize a document into the RAG vector store for agent search."
      fields={KNOWLEDGE_FIELDS}
      submitText="Ingest Vector Doc"
      onClose={onClose}
      onSubmit={handleIngestDoc}
    />
  );
}
