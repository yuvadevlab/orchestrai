"use client";

/**
 * @file tool-dialog.tsx
 * @description Dedicated modal dialog component for registering tool capabilities.
 * @module apps/console/features/tools/components
 */

import React from "react";
import { toast } from "@yuva-devlab/ui";
import { formatApiError } from "@/lib/error-utils";
import { FormDialog } from "@/components/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { buildToolFields } from "./tool-form-fields";
import { useRegisterToolMutation } from "../api";
import { usePermissions } from "../api/use-permissions";
import { useTools } from "../api/use-tools";

export interface ToolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
}

/**
 * Modal dialog for registering a new tool capability schema.
 * Permissions and categories are dynamically sourced from the database.
 */
export function ToolDialog({
  isOpen,
  onClose,
  onSuccess,
}: ToolDialogProps): React.JSX.Element | null {
  const registerMutation = useRegisterToolMutation();
  const { data: permissions = [] } = usePermissions();
  const { data: tools = [] } = useTools();

  const fields = buildToolFields(permissions, tools);

  const handleRegisterTool = async (formData: Record<string, string>): Promise<void> => {
    const toolPromise = registerMutation.mutateAsync({
      name: formData.name || UI_COPY.TOOLS.REGISTER_DIALOG.FALLBACK_NAME,
      category: formData.category || UI_COPY.TOOLS.REGISTER_DIALOG.FALLBACK_CATEGORY,
      description: formData.description || UI_COPY.TOOLS.REGISTER_DIALOG.FALLBACK_DESCRIPTION,
      permissions: formData.permissions || UI_COPY.TOOLS.REGISTER_DIALOG.FALLBACK_PERMISSIONS,
    });

    toast.promise(toolPromise, {
      loading: UI_COPY.TOOLS.REGISTER_DIALOG.TOAST_LOADING,
      success: UI_COPY.TOOLS.REGISTER_DIALOG.TOAST_SUCCESS,
      error: (err) => formatApiError(err, UI_COPY.TOOLS.REGISTER_DIALOG.TOAST_ERROR),
    });

    await toolPromise;
    if (onSuccess) {
      await onSuccess();
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title={UI_COPY.TOOLS.REGISTER_DIALOG.TITLE}
      description={UI_COPY.TOOLS.REGISTER_DIALOG.DESCRIPTION}
      fields={fields}
      submitText={UI_COPY.TOOLS.REGISTER_DIALOG.SUBMIT_BUTTON}
      onClose={onClose}
      onSubmit={handleRegisterTool}
    />
  );
}
