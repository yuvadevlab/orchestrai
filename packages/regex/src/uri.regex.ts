/**
 * @file packages/regex/src/uri.regex.ts
 * @description Regular expressions for URI scheme validation, resource identifiers, and tool names.
 * @module @orchestrai/regex
 */

/**
 * Standard RFC-3986 URI pattern enforcing protocol scheme and non-empty resource path.
 */
export const CANONICAL_URI_REGEX: RegExp = /^[a-z][a-z0-9+.-]*:\/\/.+$/i;

/**
 * Pattern matching leading file:// protocol prefix.
 */
export const FILE_PROTOCOL_REGEX: RegExp = /^file:\/\//;

/**
 * Pattern matching leading postgres:// protocol prefix.
 */
export const POSTGRES_PROTOCOL_REGEX: RegExp = /^postgres:\/\//;

/**
 * Pattern matching leading http:// or https:// protocol prefixes.
 */
export const HTTP_PROTOCOL_REGEX: RegExp = /^https?:\/\//;

/**
 * Identifier pattern for tool names, agent slugs, and resource keys (alphanumeric, dashes, underscores).
 */
export const TOOL_NAME_REGEX: RegExp = /^[a-zA-Z0-9_-]+$/;

/**
 * Pattern matching channel prefix for Redis realtime pub/sub topics.
 */
export const REALTIME_CHANNEL_PREFIX_REGEX: RegExp = /^orchestrai:(realtime|events):/;

/**
 * Route pattern matching execution SSE stream path: /api/v1/executions/:executionId/stream
 */
export const EXECUTION_STREAM_ROUTE_REGEX: RegExp = /^\/api\/v1\/executions\/([^/]+)\/stream$/;

/**
 * Route parameter token pattern for extracting named parameters (e.g. :id, :executionId) from URL route paths.
 */
export const ROUTE_PARAM_TOKEN_REGEX: RegExp = /:([a-zA-Z0-9_]+)/g;

/**
 * Matches raw password credentials in database connection URI strings for structured log masking.
 */
export const DB_PASSWORD_MASK_REGEX: RegExp = /:[^:@]+@/;

/**
 * Matches a trailing forward slash at the end of a URI or path string.
 */
export const TRAILING_SLASH_REGEX: RegExp = /\/$/;

/**
 * Matches one or more trailing forward slashes at the end of a base URL.
 */
export const TRAILING_SLASHES_GLOBAL_REGEX: RegExp = /\/+$/;

/**
 * Matches a leading forward slash at the start of a URI path string.
 */
export const LEADING_SLASH_REGEX: RegExp = /^\//;
