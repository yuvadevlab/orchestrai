/**
 * @file agent-form-fields.ts
 * @description Form field specifications for the agent creation ActionDialog.
 * Generates field configuration dynamically from live database models, modes, roles, and tools.
 * Strictly zero hardcoded models, providers, roles, permissions, or tools.
 * @module apps/console/features/agents/components
 */

import type { FormFieldSpec } from "@/components/ui/action-dialog";
import type { LlmModelRecord, PlatformModeRecord } from "@orchestrai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";
import type { AgentRoleRecord } from "../api/use-agent-roles";
import type { ToolDefinition } from "@/features/tools/types";

/**
 * Builds form field specifications for agent creation.
 * Models, execution modes, agent roles, and tools are supplied dynamically from live database records.
 *
 * @param models - Live LLM model catalog from database.
 * @param modes - Live platform modes from database.
 * @param roles - Live agent roles from database.
 * @param tools - Live tools catalog from database.
 * @returns Array of form field specifications for FormDialog.
 */
export function buildAgentFields(
  models: readonly LlmModelRecord[] = [],
  modes: readonly PlatformModeRecord[] = [],
  roles: readonly AgentRoleRecord[] = [],
  tools: readonly ToolDefinition[] = [],
): FormFieldSpec[] {
  // 1. Roles mapped dynamically from live database records
  const roleOptions =
    roles.length > 0
      ? roles.map((r) => ({
          value: r.slug,
          label: r.name,
        }))
      : [];

  const defaultRole = roles[0]?.slug || "";

  // 2. Models mapped dynamically from live database records
  const modelOptions =
    models.length > 0
      ? models.map((m) => ({
          value: m.modelIdentifier || m.name,
          label: m.name,
        }))
      : [];

  const defaultModel =
    models.find((m) => m.isDefault)?.modelIdentifier || models[0]?.modelIdentifier || "";

  // 3. Autonomy modes mapped dynamically from live database records
  const modeOptions =
    modes.length > 0
      ? modes.map((m) => ({
          value: m.slug.toLowerCase(),
          label: m.name,
        }))
      : [];

  const defaultMode =
    modes.find((m) => m.isDefault)?.slug?.toLowerCase() || modeOptions[0]?.value || "";

  // 4. Tools mapped dynamically from live database records (interactive multiselect list)
  const toolOptions =
    tools.length > 0
      ? tools.map((t) => ({
          value: t.slug || t.name,
          label: t.name,
        }))
      : [];

  return [
    {
      name: "name",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.NAME_LABEL,
      placeholder: UI_COPY.AGENTS.PROVISION_DIALOG.NAME_PLACEHOLDER,
      required: true,
      colSpan: 1,
    },
    {
      name: "role",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.ROLE_LABEL,
      type: "select",
      options: roleOptions,
      defaultValue: defaultRole,
      required: true,
      colSpan: 1,
    },
    {
      name: "description",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.DESC_LABEL,
      placeholder: UI_COPY.AGENTS.PROVISION_DIALOG.DESC_PLACEHOLDER,
      required: true,
      colSpan: 2,
    },
    {
      name: "model",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.MODEL_LABEL,
      type: "select",
      options: modelOptions,
      defaultValue: defaultModel,
      required: true,
      colSpan: 1,
    },
    {
      name: "mode",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.MODE_LABEL,
      type: "select",
      options: modeOptions,
      defaultValue: defaultMode,
      required: true,
      colSpan: 1,
    },
    {
      name: "tools",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.TOOLS_LABEL,
      type: "multiselect",
      options: toolOptions,
      helperText: UI_COPY.AGENTS.PROVISION_DIALOG.TOOLS_HELPER,
      colSpan: 2,
    },
    {
      name: "capabilities",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.CAPABILITIES_LABEL,
      placeholder: UI_COPY.AGENTS.PROVISION_DIALOG.CAPABILITIES_PLACEHOLDER,
      helperText: UI_COPY.AGENTS.PROVISION_DIALOG.CAPABILITIES_HELPER,
      colSpan: 1,
    },
    {
      name: "maxSteps",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.MAX_STEPS_LABEL,
      type: "number",
      placeholder: "25",
      defaultValue: "25",
      helperText: UI_COPY.AGENTS.PROVISION_DIALOG.MAX_STEPS_HELPER,
      colSpan: 1,
    },
    {
      name: "systemPrompt",
      label: UI_COPY.AGENTS.PROVISION_DIALOG.SYSTEM_PROMPT_LABEL,
      placeholder: UI_COPY.AGENTS.PROVISION_DIALOG.SYSTEM_PROMPT_PLACEHOLDER,
      type: "textarea",
      required: true,
      colSpan: 2,
    },
  ];
}
