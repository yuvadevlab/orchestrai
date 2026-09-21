/**
 * @file packages/sdk/src/types/api-responses.ts
 * @description Strongly-typed response models, envelopes, and DTOs returned by the SDK.
 */

import { ExecutionStatus, MessageRole, AgentMode } from "@orchestrai/shared-types";

/**
 * Standard API error payload returned by OrchestrAI services.
 */
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  retryAfterSeconds?: number;
}

/**
 * Common response envelope for paginated resource collections.
 */
export interface PaginatedList<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  filter?: Record<string, unknown>;
}

/**
 * Persisted execution state record.
 */
export interface Execution {
  executionId: string;
  agentId: string;
  conversationId: string;
  status: ExecutionStatus;
  mode: AgentMode | string;
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  resumedAt?: string;
}

/**
 * Conversation session record.
 */
export interface Conversation {
  conversationId: string;
  title: string;
  tenantId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Message entry within a conversation session.
 */
export interface Message {
  messageId: string;
  conversationId: string;
  role: MessageRole | string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Configured Agent definition.
 */
export interface Agent {
  agentId: string;
  tenantId: string;
  name: string;
  description?: string;
  mode: AgentMode | string;
  systemPrompt: string;
  modelConfig: unknown;
  enabledTools: string[];
  maxSteps: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * RAG ingested document record.
 */
export interface RagDocument {
  documentId: string;
  tenantId: string;
  title: string;
  sourceUri: string;
  mimeType: string;
  status: string;
  createdAt: string;
}

/**
 * Semantic vector retrieval search result chunk.
 */
export interface RagChunkResult {
  chunkId: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

/**
 * RAG search query result wrapper.
 */
export interface RagQueryResult {
  query: string;
  tenantId: string;
  chunks: RagChunkResult[];
  total: number;
}

/**
 * Human-in-the-loop approval ticket.
 */
export interface ApprovalRequest {
  approvalId: string;
  executionId: string;
  stepId?: string;
  toolName?: string;
  toolArguments?: Record<string, unknown>;
  rationale?: string;
  status: string;
  requestedAt?: string;
  expiresAt?: string;
}

/**
 * Human-in-the-loop resolution outcome.
 */
export interface ApprovalDecisionResult {
  approvalId: string;
  decision: string;
  decidedBy: string;
  reason?: string;
  modifiedArguments?: Record<string, unknown>;
  decidedAt: string;
}

/**
 * Streaming event emitted over Server-Sent Events.
 */
export interface StreamEvent {
  event: string;
  data: unknown;
  id?: string;
  retry?: number;
}
