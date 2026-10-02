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
