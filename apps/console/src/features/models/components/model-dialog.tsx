"use client";

/**
 * @file model-dialog.tsx
 * @description Dedicated modal dialog component for configuring model providers.
 * @module apps/console/features/models/components
 */

import React from "react";
import { toast } from "sonner";
import { formatApiError } from "@/lib/error-utils";
import { FormDialog } from "@/components/ui";
import { buildModelFields } from "./model-form-fields";
import { useProviders, useRegisterModelMutation } from "../api";

export interface ModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
}

/**
 * Modal dialog for configuring a new model provider endpoint.
 */
export function ModelDialog({
  isOpen,
  onClose,
  onSuccess,
}: ModelDialogProps): React.JSX.Element | null {
  const { data: providers = [] } = useProviders();
  const registerMutation = useRegisterModelMutation();

  const handleAddModel = async (formData: Record<string, string>): Promise<void> => {
    const modelPromise = registerMutation.mutateAsync({
      name: formData.name || "Custom Model",
      providerId: formData.providerId || (providers[0]?.providerId ?? ""),
      modelIdentifier: formData.modelIdentifier || formData.name || "custom-model",
      description: formData.description,
      contextWindow: formData.contextWindow ? parseInt(formData.contextWindow, 10) : 8192,
      isDefault: formData.isDefault === "true",
    });

    toast.promise(modelPromise, {
      loading: "Registering model...",
      success: "Model registered successfully!",
      error: (err) => formatApiError(err, "Failed to register model"),
    });

    await modelPromise;
    onClose();
    if (onSuccess) {
      await onSuccess();
    }
  };

  const fields = buildModelFields(providers);

  return (
    <FormDialog
      isOpen={isOpen}
      title="Add LLM Model"
      description="Register a new AI model under an active provider."
      fields={fields}
      submitText="Add Model"
      onClose={onClose}
      onSubmit={handleAddModel}
    />
  );
}
