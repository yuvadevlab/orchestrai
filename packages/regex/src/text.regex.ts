/**
 * @file packages/regex/src/text.regex.ts
 * @description Regular expressions for text manipulation, markdown sanitization, and token splitting.
 * @module @orchestrai/regex
 */

/**
 * Strips leading and trailing square brackets from database pgvector string representations.
 */
export const EMBEDDING_ARRAY_REGEX: RegExp = /^\[|\]$/g;

/**
 * Matches leading markdown heading hashes (#, ##, ###) and optional trailing spaces.
 */
export const MARKDOWN_HEADING_REGEX: RegExp = /^#+\s*/;

/**
 * Matches leading and trailing hyphens on generated slugs or identifiers.
 */
export const LEADING_TRAILING_DASH_REGEX: RegExp = /^-|-$/g;

/**
 * Matches strings that begin with an alphanumeric character.
 */
export const ALPHANUMERIC_START_REGEX: RegExp = /^[a-zA-Z0-9]/;

/**
 * Matches delimiters (whitespace, dots, underscores, dashes) for token splitting.
 */
export const WORD_SPLIT_REGEX: RegExp = /[\s._-]+/;

/**
 * Matches one or more consecutive whitespace characters globally.
 */
export const WHITESPACE_GLOBAL_REGEX: RegExp = /\s+/g;

/**
 * Matches sequences of non-alphanumeric characters globally for slugification.
 */
export const NON_ALPHANUMERIC_GLOBAL_REGEX: RegExp = /[^a-z0-9]+/g;

/**
 * Matches individual non-alphanumeric characters globally.
 */
export const NON_ALPHANUMERIC_CHAR_REGEX: RegExp = /[^a-z0-9]/g;

/**
 * Matches a trailing newline at the end of a string.
 */
export const TRAILING_NEWLINE_REGEX: RegExp = /\n$/;

/**
 * Matches leading and trailing single or double quotes wrapping a string.
 */
export const QUOTE_WRAPPER_REGEX: RegExp = /^["']|["']$/g;

/**
 * Matches backslashes globally for Windows to POSIX path separator normalization.
 */
export const BACKSLASH_GLOBAL_REGEX: RegExp = /\\/g;

/**
 * Matches hexadecimal placeholder characters (0, 1, 8) in UUID generation templates.
 */
export const HEX_GENERATOR_CHAR_REGEX: RegExp = /[018]/g;

/**
 * Matches Unix (\n) or Windows (\r\n) newline sequences for line splitting.
 */
export const NEWLINE_SPLIT_REGEX: RegExp = /\r?\n/;

/**
 * Matches all standard newline variants (\r\n, \r, or \n) across operating systems.
 */
export const NEWLINE_UNIVERSAL_SPLIT_REGEX: RegExp = /\r\n|\r|\n/;

/**
 * Matches Windows CRLF sequences (\r\n) globally for normalization to Unix newlines.
 */
export const CRLF_GLOBAL_REGEX: RegExp = /\r\n/g;

/**
 * Matches two or more consecutive newlines for paragraph boundary splitting.
 */
export const DOUBLE_NEWLINE_SPLIT_REGEX: RegExp = /\n\n+/;

/**
 * Matches paragraph breaks delimited by newlines with optional intervening whitespace.
 */
export const PARAGRAPH_SPLIT_REGEX: RegExp = /\n\s*\n/;

/**
 * Matches sentence units terminated by punctuation (.!?), newlines, or string boundaries.
 */
export const SENTENCE_SPLIT_REGEX: RegExp = /[^.!?\n]+(?:[.!?]+|\n+|$)/g;

/**
 * Matches dashes and underscores globally for key normalization.
 */
export const DASH_UNDERSCORE_GLOBAL_REGEX: RegExp = /[-_]/g;

/**
 * Matches common name delimiters (whitespace, underscore, dash) for token splitting.
 */
export const NAME_SPLIT_REGEX: RegExp = /[\s_-]+/;

/**
 * Matches double quotes globally for JSON and metric escaping.
 */
export const DOUBLE_QUOTE_GLOBAL_REGEX: RegExp = /"/g;

/**
 * Matches all characters other than lowercase letters and whitespace.
 */
export const NON_ALPHA_WHITESPACE_REGEX: RegExp = /[^a-z\s]/g;
