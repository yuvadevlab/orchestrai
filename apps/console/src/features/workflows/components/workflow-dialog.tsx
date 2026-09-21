"use client";

/**
 * @file workflow-dialog.tsx
 * @description Dedicated modal dialog component for composing workflow DAGs.
 * @module apps/console/features/workflows/components
 */

import React from "react";
import { FormDialog } from "@/components";
import { WORKFLOW_FIELDS } from "./workflow-form-fields";

export interface WorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

/**
 * Modal dialog for composing a new workflow pipeline DAG.
 */
export function WorkflowDialog({
  isOpen,
  onClose,
  onSuccess,
}: WorkflowDialogProps): React.JSX.Element | null {
  const handleCreateWorkflow = async (_formData: Record<string, string>): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600));
    await onSuccess();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Compose New Workflow DAG"
      description="Configure a new autonomous agent pipeline with triggers and execution steps."
      fields={WORKFLOW_FIELDS}
      submitText="Save Workflow"
      onClose={onClose}
      onSubmit={handleCreateWorkflow}
    />
  );
}
