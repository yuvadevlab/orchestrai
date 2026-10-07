/**
 * @file packages/shared-types/src/constants/query-keys.constants.ts
 * @description Centralized query key token scopes and string template placeholders.
 */

/**
 * Universal query key segment tokens ensuring zero hardcoded string literals in TanStack Query keys.
 */
export const QUERY_KEY_SCOPES = {
  /** AI models domain token */
  MODELS: "models",
  /** LLM providers domain token */
  PROVIDERS: "providers",
  /** Agents domain token */
  AGENTS: "agents",
  /** Agent roles catalog token */
  AGENT_ROLES: "agent-roles",
  /** Execution runs domain token */
  EXECUTIONS: "executions",
  /** Traces and telemetry spans token */
  TRACES: "traces",
  /** Tool catalog token */
  TOOLS: "tools",
  /** Tool permissions token */
  TOOL_PERMISSIONS: "tool-permissions",
  /** Tool category blurbs token */
  CATEGORIES: "categories",
  /** Agent memories domain token */
  MEMORIES: "memories",
  /** Knowledge domain token */
  KNOWLEDGE: "knowledge",
  /** Ingested documents token */
  KNOWLEDGE_DOCUMENTS: "knowledge-documents",
  /** Platform namespace token */
  PLATFORM: "platform",
  /** Platform execution modes token */
  PLATFORM_MODES: "platform-modes",
  /** Platform slash commands token */
  PLATFORM_COMMANDS: "platform-commands",
  /** Platform suggestions token */
  PLATFORM_SUGGESTIONS: "platform-suggestions",
  /** Welcome metadata token */
  WELCOME: "welcome",
  /** Dynamic branding token */
  BRANDING: "branding",
  /** Dynamic navigation menu items token */
  NAV_ITEMS: "nav-items",
  /** Workspace scanned files token */
  WORKSPACE_FILES: "workspace-files",
  /** Workspace harness rules & skills token */
  WORKSPACE_HARNESS: "workspace-harness",
  /** Approvals domain token */
  APPROVALS: "approvals",
  /** Evaluation datasets token */
  EVALUATION_DATASETS: "evaluation-datasets",
  /** Generic gateway data cache token */
  GATEWAY_DATA: "gateway-data",
  /** Default fallback root path identifier */
  ROOT: "root",
  /** Empty string identifier */
  EMPTY: "",
} as const;

/**
 * Dynamic string template replacement placeholders.
 */
export const TEMPLATE_TOKENS = {
  /** User name template token inside welcome headlines */
  USER_NAME: "{name}",
} as const;
