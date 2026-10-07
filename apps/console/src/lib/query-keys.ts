/**
 * @file apps/console/src/lib/query-keys.ts
 * @description Centralized TanStack Query keys factory and shared constants.
 * @module apps/console/lib
 */

import {
  QUERY_PARAMS,
  ROUTE_PARAMS,
  HEADER_NAMES,
  API_ROUTES,
  QUERY_KEY_SCOPES,
  TEMPLATE_TOKENS,
  HttpMethod,
} from "@orchestrai/shared-types";

export {
  QUERY_PARAMS,
  ROUTE_PARAMS,
  HEADER_NAMES,
  API_ROUTES,
  QUERY_KEY_SCOPES,
  TEMPLATE_TOKENS,
  HttpMethod,
};

/**
 * Type-safe query key hierarchies for TanStack Query across Console features.
 * Consolidates all query keys into a single source of truth to prevent typos and cache collisions.
 * Uses shared QUERY_KEY_SCOPES tokens to guarantee zero hardcoded string literals.
 */
export const QUERY_KEYS = {
  /** AI Models query keys */
  MODELS: {
    /** Root models key for cache invalidation */
    ALL: [QUERY_KEY_SCOPES.MODELS] as const,
    /** Filtered models list by providerId */
    LIST: (providerId?: string) => [QUERY_KEY_SCOPES.MODELS, providerId] as const,
  },

  /** LLM Providers query keys */
  PROVIDERS: {
    /** Root providers key */
    ALL: [QUERY_KEY_SCOPES.PROVIDERS] as const,
  },

  /** Autonomous Agents query keys */
  AGENTS: {
    /** Root agents key */
    ALL: [QUERY_KEY_SCOPES.AGENTS] as const,
    /** Filtered agents list by tenantId */
    LIST: (tenantId?: string | null) => [QUERY_KEY_SCOPES.AGENTS, tenantId] as const,
    /** Available agent roles catalog */
    ROLES: [QUERY_KEY_SCOPES.AGENT_ROLES] as const,
  },

  /** Execution Runs query keys */
  EXECUTIONS: {
    /** Root executions key */
    ALL: [QUERY_KEY_SCOPES.EXECUTIONS] as const,
    /** Tenant execution list */
    LIST: (tenantId?: string | null) => [QUERY_KEY_SCOPES.EXECUTIONS, tenantId] as const,
    /** Single execution trace spans */
    TRACE: (executionId?: string) => [QUERY_KEY_SCOPES.TRACES, executionId] as const,
  },

  /** System & Custom Tools query keys */
  TOOLS: {
    /** Root tools catalog */
    ALL: [QUERY_KEY_SCOPES.TOOLS] as const,
    /** Tool permissions and capabilities */
    PERMISSIONS: [QUERY_KEY_SCOPES.TOOL_PERMISSIONS] as const,
    /** Tool category definitions */
    CATEGORIES: [QUERY_KEY_SCOPES.TOOLS, QUERY_KEY_SCOPES.CATEGORIES] as const,
  },

  /** Multi-Tier Memory query keys */
  MEMORY: {
    /** Stored memory records */
    ALL: [QUERY_KEY_SCOPES.MEMORIES] as const,
  },

  /** Knowledge Base & RAG query keys */
  KNOWLEDGE: {
    /** Root knowledge key */
    ALL: [QUERY_KEY_SCOPES.KNOWLEDGE] as const,
    /** Ingested document records */
    DOCUMENTS: [QUERY_KEY_SCOPES.KNOWLEDGE_DOCUMENTS] as const,
  },

  /** Platform Control Plane dynamic configurations */
  PLATFORM: {
    /** Dynamic execution modes */
    MODES: [QUERY_KEY_SCOPES.PLATFORM_MODES] as const,
    /** Dynamic slash commands */
    COMMANDS: [QUERY_KEY_SCOPES.PLATFORM_COMMANDS] as const,
    /** Dynamic starter suggestions */
    SUGGESTIONS: [QUERY_KEY_SCOPES.PLATFORM_SUGGESTIONS] as const,
    /** Dynamic welcome metadata */
    WELCOME: [QUERY_KEY_SCOPES.PLATFORM, QUERY_KEY_SCOPES.WELCOME] as const,
    /** Dynamic branding metadata */
    BRANDING: [QUERY_KEY_SCOPES.PLATFORM, QUERY_KEY_SCOPES.BRANDING] as const,
    /** Dynamic navigation menu items */
    NAV_ITEMS: (userId?: string, roles?: string[]) =>
      [QUERY_KEY_SCOPES.NAV_ITEMS, userId, roles] as const,
  },

  /** Local Workspace exploration query keys */
  WORKSPACE: {
    /** Scanned directory file tree */
    FILES: (path?: string, query?: string) =>
      [
        QUERY_KEY_SCOPES.WORKSPACE_FILES,
        path || QUERY_KEY_SCOPES.ROOT,
        query || QUERY_KEY_SCOPES.EMPTY,
      ] as const,
    /** Discovered instruction rules and skills */
    HARNESS: (path?: string) =>
      [QUERY_KEY_SCOPES.WORKSPACE_HARNESS, path || QUERY_KEY_SCOPES.ROOT] as const,
  },

  /** Human-in-the-Loop Clearance Approvals query keys */
  APPROVALS: {
    /** Root approval clearance tickets */
    ALL: [QUERY_KEY_SCOPES.APPROVALS] as const,
  },

  /** Benchmark Evaluation query keys */
  EVALUATIONS: {
    /** Available benchmark evaluation datasets */
    DATASETS: [QUERY_KEY_SCOPES.EVALUATION_DATASETS] as const,
  },
} as const;
