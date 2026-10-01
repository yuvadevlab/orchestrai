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
}

/**
 * Standard operator and user role classifications for control-plane access control.
 */
export enum OperatorRole {
  ADMIN = "admin",
  OPERATOR = "operator",
  DEVELOPER = "developer",
  VIEWER = "viewer",
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
