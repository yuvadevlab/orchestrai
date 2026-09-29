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
import { useCreateMemory } from "../api";

export interface MemoryCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MEMORY_FIELDS: FormFieldConfig[] = [
  {
    name: "content",
    label: "Memory / Learned Fact",
    type: "textarea",
    placeholder:
      "e.g. User prefers Python with type annotations and functional error handling using Result pattern.",
    required: true,
    colSpan: 2,
  },
  {
    name: "importanceScore",
    label: "Importance Priority (0.1 - 1.0)",
    type: "select",
    defaultValue: "0.8",
    options: [
      { value: "0.9", label: "Critical (0.9) - Always prioritize" },
      { value: "0.8", label: "High (0.8) - Core preference" },
      { value: "0.5", label: "Medium (0.5) - General note" },
      { value: "0.2", label: "Low (0.2) - Ephemeral observation" },
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
      toast.success("Fact recorded in persistent agent memory");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Record Memory or Fact"
      description="Inject persistent knowledge and user preferences remembered across all sessions."
      fields={MEMORY_FIELDS}
      submitText="Save Memory"
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
