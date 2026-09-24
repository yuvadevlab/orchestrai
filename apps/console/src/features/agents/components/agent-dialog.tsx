"use client";

/**
 * @file agent-dialog.tsx
 * @description Dedicated modal dialog component for provisioning cluster agents.
 * @module apps/console/features/agents/components
 */

import React from "react";
import { toast } from "sonner";
import { formatApiError } from "@/lib/error-utils";
import { FormDialog } from "@/components/ui";
import { buildAgentFields } from "./agent-form-fields";
import { useCreateAgentMutation } from "../api";
import { useAgentRoles } from "../api/use-agent-roles";
import { useModels } from "@/features/models/api";
import { usePlatformModes } from "@/lib/use-modes";
import { useTools } from "@/features/tools/api";

export interface AgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
}

/**
 * Modal dialog for provisioning a new cluster agent entity.
 * Supports all configuration parameters: role, domain, model engine,
 * autonomy mode, capabilities, tools, and system instructions.
 * Strictly sources models, modes, roles, and tools dynamically from live database records.
 */
export function AgentDialog({
  isOpen,
  onClose,
  onSuccess,
}: AgentDialogProps): React.JSX.Element | null {
  const createAgentMutation = useCreateAgentMutation();
  const { data: models = [] } = useModels();
  const { data: modes = [] } = usePlatformModes();
  const { data: roles = [] } = useAgentRoles();
  const { data: tools = [] } = useTools();

  const fields = buildAgentFields(models, modes, roles, tools);

  const handleCreateAgent = async (formData: Record<string, string>): Promise<void> => {
    const enabledTools = formData.tools
      ? formData.tools
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const capabilities = formData.capabilities
      ? formData.capabilities
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
    const parsedSteps = formData.maxSteps ? parseInt(formData.maxSteps, 10) : 25;
    const maxSteps = isNaN(parsedSteps) ? 25 : parsedSteps;

    const defaultModel =
      models.find((m) => m.isDefault)?.modelIdentifier || models[0]?.modelIdentifier || "";

    const defaultMode =
      modes.find((m) => m.isDefault)?.slug?.toUpperCase() ||
      modes[0]?.slug?.toUpperCase() ||
      "AUTO";

    const agentPromise = createAgentMutation.mutateAsync({
      name: formData.name || "New Agent",
      role: formData.role || "Research",
      description: formData.description || "Registered specialist agent",
      model: formData.model || defaultModel,
      mode: formData.mode || defaultMode,
      systemPrompt: formData.systemPrompt || "Agent instructions",
      enabledTools,
      capabilities,
      maxSteps,
    });

    toast.promise(agentPromise, {
      loading: "Provisioning cluster agent...",
      success: "Agent provisioned successfully!",
      error: (err) => formatApiError(err, "Failed to provision agent"),
    });

    await agentPromise;
    if (onSuccess) {
      await onSuccess();
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Provision New Agent"
      description="Register a new autonomous specialist or orchestrator into the cluster control plane."
      fields={fields}
      maxWidth="2xl"
      submitText="Register Agent"
      onClose={onClose}
      onSubmit={handleCreateAgent}
    />
  );
}
