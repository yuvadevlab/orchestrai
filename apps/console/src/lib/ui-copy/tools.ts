/**
 * @file apps/console/src/lib/ui-copy/tools.ts
 * @description Centralized UI copy, placeholders, and dialog text for Tools & Integrations.
 * @module apps/console/lib/ui-copy
 */

export const TOOLS_COPY = {
  PAGE_TITLE: "Tools & Integrations",
  BREADCRUMB: "Tools",
  PAGE_DESCRIPTION: "Permissioned capabilities available to every specialist.",
  REGISTER_BUTTON: "Register tool",
  STATS: (count: number) => `${count} capabilities active`,
  EMPTY_TITLE: "No Tools Registered",
  EMPTY_DESC:
    "Register search tools, database connectors, or custom sandbox plugins for your agents.",
  REGISTER_DIALOG: {
    TITLE: "Register Custom Execution Tool",
    DESCRIPTION: "Attach a new tool capability schema into the cluster runtime.",
    SUBMIT_BUTTON: "Register Tool",
    NAME_LABEL: "Tool Identifier / Name",
    NAME_PLACEHOLDER: "e.g. web_search_v2",
    CATEGORY_LABEL: "Functional Category",
    PERMISSIONS_LABEL: "Permission & Safety Tier",
    DESCRIPTION_LABEL: "Capability Specification",
    DESCRIPTION_PLACEHOLDER: "Describe what this tool enables and expected parameters...",
    FALLBACK_NAME: "Custom Tool",
    FALLBACK_CATEGORY: "General",
    FALLBACK_DESCRIPTION: "Registered runtime tool",
    FALLBACK_PERMISSIONS: "read_only",
    TOAST_LOADING: "Registering runtime tool...",
    TOAST_SUCCESS: "Tool registered successfully!",
    TOAST_ERROR: "Failed to register tool",
  },

  CARD: {
    PERMISSIONS_LABEL: "Permission Level",
    TOGGLE_ENABLE_TOOLTIP: "Toggle capability enablement",
    TOGGLE_A11Y: (name: string) => `Toggle ${name}`,
    DEFAULT_DESCRIPTION: "Configured agent capability with granular isolation.",
    POLICY_AUTO_RUN: "Auto-run",
    POLICY_ASK_FIRST: "Ask first",
    SANDBOX_NETWORK_READ: "Network read",
    SANDBOX_READ_ONLY: "Read only",
    SANDBOX_WORKSPACE_WRITE: "Workspace write",
    SANDBOX_EPHEMERAL_VM: "Ephemeral VM",
    SANDBOX_NETWORK_WRITE: "Network write",
    TOAST_UPDATING: (name: string) => `Updating ${name}...`,
    TOAST_UPDATED: (name: string, isEnabled: boolean) =>
      `${name} ${isEnabled ? "enabled" : "disabled"}`,
    TOAST_UPDATE_ERROR: (msg: string) => `Failed to update tool: ${msg}`,
  },
} as const;
