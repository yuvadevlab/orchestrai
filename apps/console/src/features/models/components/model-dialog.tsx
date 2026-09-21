"use client";

/**
 * @file model-dialog.tsx
 * @description Dedicated modal dialog component for configuring model providers.
 * @module apps/console/features/models/components
 */

import React from "react";
import { FormDialog } from "@/components/ui";
import { MODEL_FIELDS } from "./model-form-fields";

export interface ModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

/**
 * Modal dialog for configuring a new model provider endpoint.
 */
export function ModelDialog({
  isOpen,
  onClose,
  onSuccess,
}: ModelDialogProps): React.JSX.Element | null {
  const handleAddModel = async (_formData: Record<string, string>): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600));
    await onSuccess();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Add LLM Model Provider"
      description="Configure an LLM provider endpoint or local inference server."
      fields={MODEL_FIELDS}
      submitText="Add Provider"
      onClose={onClose}
      onSubmit={handleAddModel}
    />
  );
}
