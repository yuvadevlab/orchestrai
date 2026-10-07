/**
 * @file apps/console/src/lib/ui-copy/memory.ts
 * @description Centralized UI copy, placeholders, and dialog text for Episodic Memory.
 * @module apps/console/lib/ui-copy
 */

export const MEMORY_COPY = {
  PAGE_TITLE: "Episodic Memory",
  BREADCRUMB: "Memory",
  PAGE_DESCRIPTION: "Distilled semantic facts and episodic learnings across agent runs.",
  RECORD_BUTTON: "Record Memory",
  SEARCH_PLACEHOLDER: "Search memories by content...",
  STATS: (count: number) => `${count} memories stored`,
  EMPTY_TITLE: "No Episodic Memories Stored",
  EMPTY_DESC: "Episodic learnings will automatically distill here as agents complete tasks.",
  ERROR_TITLE: "Failed to load memories",
  RETRY_BUTTON: "Retry",
  TYPE_FILTERS: {
    ALL: "All Types",
    FACTS: "Facts",
    EPISODIC: "Episodic",
    PREFERENCES: "Preferences",
    WORKING: "Working",
  },
  NO_MATCH_TITLE: "No Memories Matched",
  NO_MATCH_DESC: (query: string) => `No memories matched your search query "${query}".`,
  RECALL_TESTER: {
    TRIGGER_BUTTON: "Test recall",
    TITLE: "Memory Recall Tester",
    DESCRIPTION:
      "Test semantic recall matching what agents will see during session prompt synthesis.",
    PLACEHOLDER: "Enter a prompt to recall associated agent memories...",
    SUBMIT_BUTTON: "Recall",
    MATCHES_COUNT: (count: number, query: string) => `Recalled ${count} memories for "${query}"`,
    NO_MATCHES: "No relevant memories recalled above relevance threshold.",
    TOAST_ERROR: "Failed to query memory store",
  },

  CREATE_DIALOG: {
    TITLE: "Record Memory or Fact",
    DESCRIPTION: "Inject persistent knowledge and user preferences remembered across all sessions.",
    SUBMIT_BUTTON: "Save Memory",
    CONTENT_LABEL: "Memory / Learned Fact",
    CONTENT_PLACEHOLDER:
      "e.g. User prefers Python with type annotations and functional error handling using Result pattern.",
    IMPORTANCE_LABEL: "Importance Priority (0.1 - 1.0)",
    PRIORITY_CRITICAL: "Critical (0.9) - Always prioritize",
    PRIORITY_HIGH: "High (0.8) - Core preference",
    PRIORITY_MEDIUM: "Medium (0.5) - General note",
    PRIORITY_LOW: "Low (0.2) - Ephemeral observation",
    TOAST_SUCCESS: "Fact recorded in persistent agent memory",
  },

  LIST: {
    ADD_FIRST: "Add first memory",
    DELETE_TOOLTIP: "Delete memory",
    FEEDBACK_REMOVED: "Memory deleted from persistent agent storage",
    FEEDBACK_ERROR: "Failed to delete memory item",
    PRIORITY_PCT: (pct: number) => `${pct}% priority`,
  },
} as const;
