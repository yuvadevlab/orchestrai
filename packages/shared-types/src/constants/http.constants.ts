/**
 * @file packages/shared-types/src/constants/http.constants.ts
 * @description Canonical HTTP routing, query parameters, route parameters, and header constants.
 */

/**
 * Canonical query parameter keys utilized across gateway, admin, and client HTTP requests.
 */
export const QUERY_PARAMS = {
  /** Target LLM provider filter identifier */
  PROVIDER_ID: "providerId",
  /** Agent configuration identifier */
  AGENT_ID: "agentId",
  /** Conversation session identifier */
  SESSION_ID: "sessionId",
  /** Execution run identifier */
  EXECUTION_ID: "executionId",
  /** Tenant scope identifier */
  TENANT_ID: "tenantId",
  /** User account identifier */
  USER_ID: "userId",
  /** Max records pagination limit */
  LIMIT: "limit",
  /** Pagination records offset */
  OFFSET: "offset",
  /** Keyset pagination cursor */
  CURSOR: "cursor",
  /** Filesystem path or workspace directory */
  PATH: "path",
  /** Search or query string */
  QUERY: "query",
  /** Entity lifecycle status filter */
  STATUS: "status",
} as const;

/**
 * Canonical route parameter keys utilized across HTTP URL routing patterns.
 */
export const ROUTE_PARAMS = {
  /** Generic entity identifier parameter (:id) */
  ID: "id",
  /** Configuration namespace identifier (:namespace) */
  NAMESPACE: "namespace",
  /** Configuration entry key (:key) */
  KEY: "key",
  /** Execution run identifier (:executionId) */
  EXECUTION_ID: "executionId",
  /** Tenant partition identifier (:tenantId) */
  TENANT_ID: "tenantId",
  /** Session thread identifier (:sessionId) */
  SESSION_ID: "sessionId",
} as const;

/**
 * Canonical HTTP header names utilized across services, gateways, and middleware.
 */
export const HEADER_NAMES = {
  /** Bearer session token header */
  AUTHORIZATION: "authorization",
  /** Request/response MIME content type */
  CONTENT_TYPE: "content-type",
  /** Tenant identification header */
  X_TENANT_ID: "x-tenant-id",
  /** Gateway/Admin API clearance key */
  X_API_KEY: "x-api-key",
  /** End-to-end distributed tracing request identifier */
  X_REQUEST_ID: "x-request-id",
} as const;

/**
 * Canonical API endpoints utilized across Gateway routers, SDK client resources, and Console hooks.
 */
export const API_ROUTES = {
  /** Dynamic execution modes endpoint */
  MODES: "/api/v1/modes",
  /** AI Models endpoint */
  MODELS: "/api/v1/models",
  /** LLM Providers endpoint */
  PROVIDERS: "/api/v1/providers",
  /** Cluster Agents endpoint */
  AGENTS: "/api/v1/agents",
  /** Available agent roles catalog */
  AGENT_ROLES: "/api/v1/agents/roles",
  /** Execution runs endpoint */
  EXECUTIONS: "/api/v1/executions",
  /** Agent Tools endpoint */
  TOOLS: "/api/v1/tools",
  /** Tool category blurbs endpoint */
  TOOLS_CATEGORIES: "/api/v1/tools/categories",
  /** Platform capabilities and permissions endpoint */
  PERMISSIONS: "/api/v1/permissions",
  /** Platform roles endpoint */
  ROLES: "/api/v1/roles",
  /** Dynamic platform slash commands endpoint */
  COMMANDS: "/api/v1/commands",
  /** Dynamic welcome suggestions endpoint */
  SUGGESTIONS: "/api/v1/suggestions",
  /** Dynamic welcome screen metadata endpoint */
  WELCOME: "/api/v1/welcome",
  /** Dynamic application branding endpoint */
  BRANDING: "/api/v1/branding",
  /** Dynamic navigation menu items endpoint */
  NAV: "/api/v1/nav",
  /** Memory records endpoint */
  MEMORY: "/api/v1/memory",
  /** Memory semantic recall search endpoint */
  MEMORY_SEARCH: "/api/v1/memory/search",
  /** RAG Knowledge documents endpoint */
  RAG_DOCUMENTS: "/api/v1/rag/documents",
  /** RAG semantic query endpoint */
  RAG_QUERY: "/api/v1/rag/query",
  /** OpenTelemetry traces endpoint */
  TRACES: "/api/v1/traces",
  /** Human-in-the-loop approvals endpoint */
  APPROVALS: "/api/v1/approvals",
  /** Evaluation datasets endpoint */
  EVAL_DATASETS: "/api/v1/eval/datasets",
  /** Benchmark run endpoint */
  EVAL_RUN: "/api/v1/eval/run",
  /** Workspace file exploration endpoint */
  WORKSPACE_FILES: "/api/v1/workspace/files",
  /** Workspace harness rules & skills endpoint */
  WORKSPACE_HARNESS: "/api/v1/workspace/harness",
  /** Authentication endpoints */
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    SIGNUP: "/api/v1/auth/signup",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
    SESSION: "/api/v1/auth/session",
    ME: "/api/v1/auth/me",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
  },
} as const;

/**
 * Standard HTTP response status codes utilized across gateways, services, and error classes.
 */
export const HttpStatus = {
  /** Success: 200 OK */
  OK: 200,
  /** Success: 201 Created */
  CREATED: 201,
  /** Success: 202 Accepted */
  ACCEPTED: 202,
  /** Success: 204 No Content */
  NO_CONTENT: 204,
  /** Client Error: 400 Bad Request */
  BAD_REQUEST: 400,
  /** Client Error: 401 Unauthorized */
  UNAUTHORIZED: 401,
  /** Client Error: 403 Forbidden */
  FORBIDDEN: 403,
  /** Client Error: 404 Not Found */
  NOT_FOUND: 404,
  /** Client Error: 408 Request Timeout */
  REQUEST_TIMEOUT: 408,
  /** Client Error: 409 Conflict */
  CONFLICT: 409,
  /** Client Error: 422 Unprocessable Entity */
  UNPROCESSABLE_ENTITY: 422,
  /** Client Error: 429 Too Many Requests */
  TOO_MANY_REQUESTS: 429,
  /** Server Error: 500 Internal Server Error */
  INTERNAL_SERVER_ERROR: 500,
  /** Server Error: 502 Bad Gateway */
  BAD_GATEWAY: 502,
  /** Server Error: 503 Service Unavailable */
  SERVICE_UNAVAILABLE: 503,
  /** Server Error: 504 Gateway Timeout */
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Derived TypeScript union type of HTTP status codes.
 */
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];

/**
 * Dedicated Operator Control Plane Admin API routing patterns.
 */
export const ADMIN_ROUTES = {
  /** Admin health probe endpoint */
  HEALTH: "/health",
  /** Admin readiness probe endpoint */
  READY: "/ready",
  /** LLM provider administration endpoint */
  LLM_PROVIDER: "/platform/llm-provider",
  /** LLM model catalog administration endpoint */
  LLM_MODEL: "/platform/llm-model",
  /** Platform mode catalog administration endpoint */
  PLATFORM_MODE: "/platform/platform-mode",
  /** Platform agent role catalog administration endpoint */
  PLATFORM_ROLE: "/platform/platform-role",
  /** Platform permission tier administration endpoint */
  PLATFORM_PERMISSION: "/platform/platform-permission",
  /** Platform tool catalog administration endpoint */
  PLATFORM_TOOL: "/platform/platform-tool",
  /** Tenant quota and budget administration endpoint */
  BUDGETS: "/platform/budgets",
  /** Tenant list administration endpoint */
  TENANTS: "/platform/tenants",
} as const;
