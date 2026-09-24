"use client";

/**
 * @file tool-dialog.tsx
 * @description Dedicated modal dialog component for registering tool capabilities.
 * @module apps/console/features/tools/components
 */

import React from "react";
import { toast } from "sonner";
import { formatApiError } from "@/lib/error-utils";
import { FormDialog } from "@/components/ui";
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
      name: formData.name || "Custom Tool",
      category: formData.category || "General",
      description: formData.description || "Registered runtime tool",
      permissions: formData.permissions || "read_only",
    });

    toast.promise(toolPromise, {
      loading: "Registering runtime tool...",
      success: "Tool registered successfully!",
      error: (err) => formatApiError(err, "Failed to register tool"),
    });

    await toolPromise;
    if (onSuccess) {
      await onSuccess();
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Register Custom Execution Tool"
      description="Attach a new tool capability schema into the cluster runtime."
      fields={fields}
      submitText="Register Tool"
      onClose={onClose}
      onSubmit={handleRegisterTool}
    />
  );
}
