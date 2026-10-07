/**
 * @file packages/regex/src/prompt.regex.ts
 * @description Regular expressions for user prompt commands, mentions, and path parsing.
 * @module @orchestrai/regex
 */

/**
 * Matches an active '@' mention query at the end of a line or after whitespace.
 * Captures the search term (alphanumeric, dots, slashes, dashes, underscores).
 */
export const MENTION_QUERY_REGEX: RegExp = /(?:^|\s)@([a-zA-Z0-9_./-]*)$/;

/**
 * Matches leading slash command prefix (e.g. "/plan " or "/act ") for stripping after execution.
 */
export const SLASH_COMMAND_PREFIX_REGEX: RegExp = /^\/[a-zA-Z0-9_-]*\s*/;

/**
 * Matches trailing slashes or backslashes on directory paths for path normalization.
 */
export const TRAILING_PATH_SLASH_REGEX: RegExp = /[/\\]+$/;

/**
 * Matches path separator slashes and backslashes for path splitting.
 */
export const PATH_SPLIT_REGEX: RegExp = /[/\\]/;
