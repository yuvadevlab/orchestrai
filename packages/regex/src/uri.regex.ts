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
