/**
 * @file apps/console/src/lib/ui-copy/knowledge.ts
 * @description Centralized UI copy, placeholders, and dialog text for Knowledge & RAG.
 * @module apps/console/lib/ui-copy
 */

export const KNOWLEDGE_COPY = {
  PAGE_TITLE: "Knowledge Repository",
  BREADCRUMB: "Knowledge",
  PAGE_DESCRIPTION: "Domain documentation indexed for retrieval-augmented generation.",
  UPLOAD_BUTTON: "Upload Document",
  SEARCH_PLACEHOLDER: "Search documents by title, URI...",
  STATS: (count: number) => `${count} documents indexed`,
  EMPTY_TITLE: "No Indexed Documents",
  EMPTY_DESC: "Upload PDF, Markdown, or text documents to empower agents with RAG retrieval.",
  ERROR_TITLE: "Failed to load documents",
  RETRY_BUTTON: "Retry",
  MIME_FILTERS: {
    ALL: "All Formats",
    MARKDOWN: "Markdown",
    PLAIN: "Plain Text",
    JSON: "JSON",
    CSV: "CSV",
  },
  NO_MATCH_TITLE: "No Documents Matched",
  NO_MATCH_DESC: (query: string) =>
    `No documents in the knowledge base matched your search query "${query}".`,
  QUERY_TESTER: {
    TRIGGER_BUTTON: "Test query",
    TITLE: "Hybrid Vector Query Tester",
    DESCRIPTION:
      "Evaluate dense semantic embeddings and sparse keyword ranking against your corpus.",
    PLACEHOLDER: "Type a test question or keyword to search indexed chunks...",
    SUBMIT_BUTTON: "Retrieve",
    MATCHES_COUNT: (count: number, query: string) =>
      `Found ${count} matching chunks for "${query}"`,
    NO_MATCHES: "No matching passages found above score threshold.",
    TOAST_ERROR: "Failed to query knowledge base",
  },

  UPLOAD_DIALOG: {
    TITLE: "Add Knowledge Document",
    DESCRIPTION:
      "Ingest and chunk text or markdown into hybrid vector storage for swarm retrieval.",
    SUBMIT_BUTTON: "Ingest Document",
    TITLE_LABEL: "Document Title",
    TITLE_PLACEHOLDER: "e.g. Architecture Guide, API Reference, Company Guidelines",
    FORMAT_LABEL: "Document Format",
    CONTENT_LABEL: "Document Content",
    CONTENT_PLACEHOLDER:
      "Paste or write the text content to be chunked and indexed into the vector store...",
    FORMAT_MARKDOWN: "Markdown (.md)",
    FORMAT_PLAIN_TEXT: "Plain Text (.txt)",
    FORMAT_JSON: "JSON Data (.json)",
    FORMAT_CSV: "CSV Table (.csv)",
    DEFAULT_SLUG: "doc",
    UNTITLED_DOC: "Untitled Document",
    TOAST_SUCCESS: "Document ingested and vector-indexed successfully",
  },

  TABLE: {
    ADD_FIRST: "Add first document",
    DELETE_TOOLTIP: "Delete document and chunks",
    FEEDBACK_REMOVED: (title: string) => `Removed "${title}" from knowledge base`,
    FEEDBACK_ERROR: (title: string) => `Failed to delete document "${title}"`,
  },
} as const;
