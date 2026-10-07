/**
 * @file packages/shared-types/src/enums/hub.enums.ts
 * @description Domain enumerations for Knowledge RAG, Episodic Memory, Tracing, and Evaluations.
 */

/**
 * Categorical tier of an agent memory item.
 * Dictates retention, lifecycle policy, and retrieval strategies.
 */
export enum MemoryType {
  CONVERSATION = "CONVERSATION",
  WORKING = "WORKING",
  USER_PREFERENCE = "USER_PREFERENCE",
  FACT = "FACT",
  EPISODIC = "EPISODIC",
  TASK = "TASK",
  SYSTEM = "SYSTEM",
}

/**
 * Upload processing status for attached knowledge documents.
 */
export enum DocumentUploadStatus {
  UPLOADING = "uploading",
  INDEXED = "indexed",
  ERROR = "error",
}

/**
 * OpenTelemetry distributed tracing span outcome status.
 */
export enum TraceSpanStatus {
  OK = "ok",
  ERROR = "error",
  UNSET = "unset",
}

/**
 * Standard supported document MIME content types for RAG indexing.
 */
export enum DocumentMimeType {
  MARKDOWN = "text/markdown",
  PLAIN_TEXT = "text/plain",
  JSON = "application/json",
  CSV = "text/csv",
}

/**
 * Registered capability benchmark dataset identifiers.
 */
export enum BenchmarkDatasetName {
  AUTONOMOUS_TOOL_CALLING = "autonomous_tool_calling",
}

/**
 * Standard performance and capability benchmark evaluation metrics.
 */
export enum BenchmarkMetric {
  ACCURACY = "accuracy",
  LATENCY = "latency",
  COST = "cost",
}

/**
 * Terminal execution episode learning outcome.
 */
export enum EpisodeOutcome {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  ABORTED = "ABORTED",
}
