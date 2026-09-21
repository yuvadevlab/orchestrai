"use client";

/**
 * @file agent-dialog.tsx
 * @description Dedicated modal dialog component for provisioning cluster agents.
 * @module apps/console/features/agents/components
 */

import React from "react";
import { FormDialog } from "@/components/ui";
import { AGENT_FIELDS } from "./agent-form-fields";
import { getApiClient } from "@/lib/api-client";

export interface AgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

/**
 * Modal dialog for provisioning a new cluster agent entity.
 */
export function AgentDialog({
  isOpen,
  onClose,
  onSuccess,
}: AgentDialogProps): React.JSX.Element | null {
  const handleCreateAgent = async (formData: Record<string, string>): Promise<void> => {
    const client = getApiClient();
    const enabledTools = formData.tools ? formData.tools.split(",").map((t) => t.trim()) : [];
    await client.agents.create({
      name: formData.name || "New Agent",
      systemPrompt: formData.systemPrompt || "Agent instructions",
      enabledTools,
    });
    await onSuccess();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Provision New Agent"
      description="Register a new autonomous agent specification into the cluster control plane."
      fields={AGENT_FIELDS}
      submitText="Register Agent"
      onClose={onClose}
      onSubmit={handleCreateAgent}
    />
  );
}
