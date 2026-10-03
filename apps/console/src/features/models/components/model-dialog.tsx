"use client";

/**
 * @file model-dialog.tsx
 * @description Dedicated modal dialog component for configuring model providers.
 * @module apps/console/features/models/components
 */

import React from "react";
import { toast } from "@yuva-devlab/ui";
import { formatApiError } from "@/lib/error-utils";
import { FormDialog } from "@/components/ui";
import { UI_COPY } from "@/lib/ui-copy";
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
      name: formData.name || UI_COPY.MODELS.DIALOG.FALLBACK_NAME,
      providerId: formData.providerId || (providers[0]?.providerId ?? ""),
      modelIdentifier:
        formData.modelIdentifier || formData.name || UI_COPY.MODELS.DIALOG.FALLBACK_IDENTIFIER,
      description: formData.description,
      contextWindow: formData.contextWindow ? parseInt(formData.contextWindow, 10) : 8192,
      isDefault: formData.isDefault === "true",
    });

    toast.promise(modelPromise, {
      loading: UI_COPY.MODELS.DIALOG.TOAST_LOADING,
      success: UI_COPY.MODELS.DIALOG.TOAST_SUCCESS,
      error: (err) => formatApiError(err, UI_COPY.MODELS.DIALOG.TOAST_ERROR),
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
      title={UI_COPY.MODELS.DIALOG.TITLE}
      description={UI_COPY.MODELS.DIALOG.DESCRIPTION}
      fields={fields}
      submitText={UI_COPY.MODELS.DIALOG.SUBMIT_BUTTON}
      onClose={onClose}
      onSubmit={handleAddModel}
    />
  );
}
