/**
 * @file apps/console/src/lib/ui-copy/agents.ts
 * @description Centralized UI copy, placeholders, and dialog copy for Specialist Agents.
 * @module apps/console/lib/ui-copy
 */

export const AGENTS_COPY = {
  PAGE_TITLE: "Agents",
  BREADCRUMB: "Agents",
  PAGE_DESCRIPTION: "Cluster specialist agents available for autonomous delegation.",
  REGISTER_BUTTON: "Register Agent",
  SEARCH_PLACEHOLDER: "Search agents by name, model, role...",
  STATS: (count: number) => `${count} registered`,
  ACTIVE_STATS: (active: number, total: number) => `${active}/${total} active`,
  FILTER_ALL: "All",
  ERROR_TITLE: "Failed to load cluster agents",
  RETRY_BUTTON: "Retry",
  EMPTY_TITLE: "No Agents Registered",
  EMPTY_DESC: "Create your first specialist agent to begin delegating complex tasks.",
  NO_MATCH_TITLE: "No Agents Matched",
  NO_MATCH_DESC: (query: string) =>
    `No agents in the cluster registry matched your search query "${query}".`,
  DETAIL: {
    NOT_FOUND_TITLE: "Agent Entity Not Found",
    NOT_FOUND_DESC: (id: string) =>
      `No agent with identifier "${id}" was found in the cluster registry.`,
    SYSTEM_INSTRUCTIONS_TITLE: "System Instructions",
    EXECUTION_HISTORY_TITLE: "Execution history",
    RUNS_COUNT: (count: number) => `${count} recorded runs`,
    NO_RUNS_DESC: "No recorded runs for this agent yet.",
    EDIT_BUTTON: "Edit specification",
    SPECIFICATION_TITLE: "Specification",
    ROLE_LABEL: "Role Classification",
    MODE_LABEL: "Execution Mode",
    PROVIDER_LABEL: "Provider & Model",
    SCOPE_LABEL: "Platform Scope",
    MODEL_LABEL: "Model",
    STATUS_LABEL: "Status",
    EXECUTIONS_LABEL: "Executions",
    SUCCESS_RATE_LABEL: "Success rate",
    PERCENTAGE: (pct: number) => `${pct}%`,
    TOOLS_TITLE: "Enabled Capabilities & Tools",
    NO_TOOLS_DESC: "No specific tool permissions assigned to this agent.",
  },

  PROVISION_DIALOG: {
    TITLE: "Provision New Agent",
    DESCRIPTION:
      "Register a new autonomous specialist or orchestrator into the cluster control plane.",
    SUBMIT_BUTTON: "Register Agent",
    NAME_LABEL: "Agent Name",
    NAME_PLACEHOLDER: "e.g. Data Analysis Specialist",
    ROLE_LABEL: "Role / Domain",
    DESC_LABEL: "Role Description",
    DESC_PLACEHOLDER: "e.g. Cleans datasets, runs SQL, builds charts and reads out insights.",
    MODEL_LABEL: "Model Engine",
    MODE_LABEL: "Autonomy Mode",
    TOOLS_LABEL: "Enabled Tools",
    TOOLS_HELPER: "Select authorized execution tools fetched directly from database",
    CAPABILITIES_LABEL: "Capabilities",
    CAPABILITIES_PLACEHOLDER: "e.g. Planning, Synthesis, Web Search",
    CAPABILITIES_HELPER: "Comma-separated list of agent capability tags",
    MAX_STEPS_LABEL: "Max Step Budget",
    MAX_STEPS_HELPER: "Maximum execution loops allowed before halting",
    SYSTEM_PROMPT_LABEL: "System Instructions / Persona",
    SYSTEM_PROMPT_PLACEHOLDER:
      "Define the core instructions, behavioral constraints, and specialist persona...",
    FALLBACK_NAME: "New Agent",
    FALLBACK_ROLE: "Research",
    FALLBACK_DESC: "Registered specialist agent",
    FALLBACK_PROMPT: "Agent instructions",
    TOAST_LOADING: "Provisioning cluster agent...",
    TOAST_SUCCESS: "Agent provisioned successfully!",
    TOAST_ERROR: "Failed to provision agent",
  },
} as const;
