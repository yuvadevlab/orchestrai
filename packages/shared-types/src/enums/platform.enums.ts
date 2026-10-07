/**
 * @file packages/shared-types/src/enums/platform.enums.ts
 * @description Enumerations governing platform scope, registered capabilities, and platform tools.
 * @module @orchestrai/shared-types/enums
 */

/**
 * Scope governance for platform-wide versus tenant-bound entities.
 */
export enum PlatformScope {
  PLATFORM = "platform",
  TENANT = "tenant",
}

/**
 * Navigation section layout grouping.
 */
export enum NavSection {
  MAIN = "main",
  BOTTOM = "bottom",
}

/**
 * Standard functional capability identifiers assigned to agents.
 */
export enum PlatformCapabilitySlug {
  FILESYSTEM_ACCESS = "filesystem_access",
  REPOSITORY_MANAGEMENT = "repository_management",
  SYSTEM_EXECUTION = "system_execution",
  DATABASE_ACCESS = "database_access",
  API_INTEGRATION = "api_integration",
  MEMORY_AND_RAG = "memory_and_rag",
}

/**
 * Standard platform tools registered in the database and execution registry.
 */
export enum PlatformToolName {
  READ_FILE = "read_file",
  WRITE_FILE = "write_file",
  LIST_DIRECTORY = "list_directory",
  SEARCH_FILES = "search_files",
  EDIT_FILE = "edit_file",
  GIT_STATUS = "git_status",
  GIT_COMMIT = "git_commit",
  SEARCH_REPO = "search_repo",
  CREATE_REPO = "create_repo",
  BASH = "bash",
  QUERY_DATABASE = "query_database",
  INSPECT_SCHEMA = "inspect_schema",
  CALL_API = "call_api",
  FETCH_URL = "fetch_url",
  RECORD_MEMORY = "record_memory",
  RECALL_MEMORY = "recall_memory",
  SEARCH_RAG = "search_rag",
  PYTHON_SANDBOX = "python_sandbox",
  WEB_SEARCH = "web_search",
  DOCUMENT_READER = "document_reader",
  URL_SCRAPER = "url_scraper",
  REST_API_CALLER = "rest_api_caller",
  SQL_ANALYTICS = "sql_analytics",
  WEBHOOKS = "webhooks",
  PDF_PARSER = "pdf_parser",
  LIST_DIR = "list_dir",
}

/**
 * Sandboxing tier and isolation boundary enforced on tool execution.
 */
export enum ToolSandboxType {
  READ_ONLY = "read_only",
  NETWORK_READ = "network_read",
  NETWORK_WRITE = "network_write",
  WORKSPACE_WRITE = "workspace_write",
  EPHEMERAL_VM = "ephemeral_vm",
}

/**
 * Standard operator and user role classifications for control-plane access control.
 */
export enum OperatorRole {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  OWNER = "owner",
  OPERATOR = "operator",
  DEVELOPER = "developer",
  VIEWER = "viewer",
  USER = "user",
  SYSTEM = "system",
}

/**
 * Budget throttle and quota status classifications.
 */
export enum BudgetQuotaStatus {
  HEALTHY = "healthy",
  WARNING = "warning",
  EXCEEDED = "exceeded",
  THROTTLED = "throttled",
}

/**
 * Canonical platform agent role classifications.
 */
export enum AgentRoleSlug {
  STRATEGY = "strategy",
  RESEARCH = "research",
  WRITING = "writing",
  ENGINEERING = "engineering",
  DATA = "data",
  AUTOMATION = "automation",
  SPECIALIST = "specialist",
}

/**
 * Service health and probe readiness indicators.
 */
export enum HealthStatus {
  OK = "ok",
  READY = "ready",
  DEGRADED = "degraded",
  DOWN = "down",
}
