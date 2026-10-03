/**
 * @file apps/console/src/lib/ui-copy/index.ts
 * @description Centralized, modular UI copy dictionary assembly.
 * Eliminates all raw string literals, hardcoded placeholders, and a11y texts in JSX.
 * @module apps/console/lib/ui-copy
 */

import { COMMON_COPY } from "./common";
import { STUDIO_COPY } from "./studio";
import { AGENTS_COPY } from "./agents";
import { EXECUTIONS_COPY } from "./executions";
import { KNOWLEDGE_COPY } from "./knowledge";
import { MEMORY_COPY } from "./memory";
import { MODELS_COPY } from "./models";
import { TOOLS_COPY } from "./tools";
import { EVALUATIONS_COPY } from "./evaluations";
import { CONTEXT_COPY } from "./context";
import { AUTH_COPY } from "./auth";
import { SETTINGS_COPY } from "./settings";

export * from "./common";
export * from "./studio";
export * from "./agents";
export * from "./executions";
export * from "./knowledge";
export * from "./memory";
export * from "./models";
export * from "./tools";
export * from "./evaluations";
export * from "./context";
export * from "./auth";
export * from "./settings";

/**
 * Universal, type-safe dictionary of user-facing UI text strings,
 * placeholders, accessibility labels, and action copy.
 */
export const UI_COPY = {
  AGENTS: AGENTS_COPY,
  EXECUTIONS: EXECUTIONS_COPY,
  MODELS: MODELS_COPY,
  KNOWLEDGE: KNOWLEDGE_COPY,
  MEMORY: MEMORY_COPY,
  EVALUATIONS: EVALUATIONS_COPY,
  TOOLS: TOOLS_COPY,
  CONTEXT: CONTEXT_COPY,
  STUDIO: {
    ...STUDIO_COPY.PROMPT,
    ...STUDIO_COPY,
  },
  COMMON: COMMON_COPY,
  AUTH: AUTH_COPY,
  SETTINGS: SETTINGS_COPY,
} as const;

export type UiCopyCatalog = typeof UI_COPY;
