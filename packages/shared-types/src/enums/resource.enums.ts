/**
 * @file packages/shared-types/src/enums/resource.enums.ts
 * @description Generic resource classification enums for system-wide AI agent authorization.
 */

/**
 * Universal resource type taxonomy for system-wide agents.
 * Identifies the target class of any platform asset acted upon by tools.
 */
export enum ResourceType {
  FILE = "file",
  DIRECTORY = "directory",
  REPOSITORY = "repository",
  PROJECT = "project",
  DATABASE = "database",
  TABLE = "table",
  API = "api",
  DOCUMENT = "document",
  APPLICATION = "application",
  INTEGRATION = "integration",
  CLOUD_RESOURCE = "cloud_resource",
  INTERNAL_SERVICE = "internal_service",
  USER = "user",
  TENANT = "tenant",
}
