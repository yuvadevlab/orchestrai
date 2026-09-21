"use client";

/**
 * @file tool-dialog.tsx
 * @description Dedicated modal dialog component for registering tool capabilities.
 * @module apps/console/features/tools/components
 */

import React from "react";
import { FormDialog } from "@/components/ui";
import { TOOL_FIELDS } from "./tool-form-fields";

export interface ToolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

/**
 * Modal dialog for registering a new tool capability schema.
 */
export function ToolDialog({
  isOpen,
  onClose,
  onSuccess,
}: ToolDialogProps): React.JSX.Element | null {
  const handleRegisterTool = async (_formData: Record<string, string>): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600));
    await onSuccess();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Register Custom Execution Tool"
      description="Attach a new tool capability schema into the cluster runtime."
      fields={TOOL_FIELDS}
      submitText="Register Tool"
      onClose={onClose}
      onSubmit={handleRegisterTool}
    />
  );
}
