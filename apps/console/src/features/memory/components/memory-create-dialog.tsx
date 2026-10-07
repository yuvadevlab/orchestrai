"use client";

/**
 * @file apps/console/src/features/memory/components/memory-create-dialog.tsx
 * @description Modal dialog for recording a new learned fact or cross-session memory.
 * @module apps/console/features/memory/components
 */

import React from "react";
import { toast } from "@yuva-devlab/ui";
import { FormDialog, type FormFieldConfig } from "@/components/ui";
import { formatApiError } from "@/lib/error-utils";
import { UI_COPY } from "@/lib/ui-copy";
import { useCreateMemory } from "../api";

export interface MemoryCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MEMORY_FIELDS: FormFieldConfig[] = [
  {
    name: "content",
    label: UI_COPY.MEMORY.CREATE_DIALOG.CONTENT_LABEL,
    type: "textarea",
    placeholder: UI_COPY.MEMORY.CREATE_DIALOG.CONTENT_PLACEHOLDER,
    required: true,
    colSpan: 2,
  },
  {
    name: "importanceScore",
    label: UI_COPY.MEMORY.CREATE_DIALOG.IMPORTANCE_LABEL,
    type: "select",
    defaultValue: "0.8",
    options: [
      { value: "0.9", label: UI_COPY.MEMORY.CREATE_DIALOG.PRIORITY_CRITICAL },
      { value: "0.8", label: UI_COPY.MEMORY.CREATE_DIALOG.PRIORITY_HIGH },
      { value: "0.5", label: UI_COPY.MEMORY.CREATE_DIALOG.PRIORITY_MEDIUM },
      { value: "0.2", label: UI_COPY.MEMORY.CREATE_DIALOG.PRIORITY_LOW },
    ],
  },
];

/**
 * Modal form for committing direct semantic facts to the agent swarm memory.
 */
export function MemoryCreateDialog({
  isOpen,
  onClose,
  onSuccess,
}: MemoryCreateDialogProps): React.JSX.Element | null {
  const createMutation = useCreateMemory();

  const handleSubmit = async (formData: Record<string, string>): Promise<void> => {
    try {
      await createMutation.mutateAsync({
        content: formData.content || "",
        importanceScore: parseFloat(formData.importanceScore || "0.8"),
      });
      toast.success(UI_COPY.MEMORY.CREATE_DIALOG.TOAST_SUCCESS);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title={UI_COPY.MEMORY.CREATE_DIALOG.TITLE}
      description={UI_COPY.MEMORY.CREATE_DIALOG.DESCRIPTION}
      fields={MEMORY_FIELDS}
      submitText={UI_COPY.MEMORY.CREATE_DIALOG.SUBMIT_BUTTON}
      maxWidth="md"
      columns={1}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
