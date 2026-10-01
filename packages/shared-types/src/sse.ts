/**
 * @file packages/shared-types/src/sse.ts
 * @description Strongly-typed Server-Sent Event (SSE) payload contracts and wire envelopes.
 * @module @orchestrai/shared-types
 */

import { SseStreamEvent } from "./enums/studio.enums";
import type { ArtifactType } from "./enums/studio.enums";
import type { PermissionScope, ApprovalRiskLevel } from "./enums/security.enums";
import { SseMessageRole, SseToolCallStatus, SseDoneStatus } from "./enums/sse.enums";

/**
 * Standard token text chunk emitted during LLM generation.
 */
export interface SseChunkPayload {
  readonly executionId: string;
  readonly chunk: string;
  readonly sequenceNumber: number;
  readonly timestamp: string;
}

/**
 * Complete message payload emitted at turn completion.
 */
export interface SseMessagePayload {
  readonly executionId: string;
  readonly messageId: string;
  readonly role: SseMessageRole;
  readonly content: string;
  readonly agentName?: string;
  readonly model?: string;
  readonly timestamp: string;
}

/**
 * Multi-domain artifact payload emitted when an agent generates code, doc, or terminal output.
 */
export interface SseArtifactPayload {
  readonly id: string;
  readonly executionId: string;
  readonly type: ArtifactType;
  readonly title: string;
  readonly content: string;
  readonly language?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
}

/**
 * Security clearance request payload emitted when an agent requires operator approval.
 */
export interface SseApprovalRequestPayload {
  readonly id: string;
  readonly executionId: string;
  readonly sessionId?: string;
  readonly agentId: string;
  readonly toolName: string;
  readonly target: string;
  readonly riskLevel: ApprovalRiskLevel;
  readonly blastRadius?: string;
  readonly parameters: Record<string, unknown>;
  readonly suggestedScope: PermissionScope;
  readonly createdAt: string;
}

/**
 * Intermediate tool call invocation event.
 */
export interface SseToolCallPayload {
  readonly executionId: string;
  readonly toolName: string;
  readonly input: Record<string, unknown>;
  readonly output?: unknown;
  readonly durationMs?: number;
  readonly status: SseToolCallStatus;
  readonly timestamp: string;
}

/**
 * Terminal execution completion payload.
 */
export interface SseDonePayload {
  readonly executionId: string;
  readonly status: SseDoneStatus;
  readonly totalTokens?: number;
  readonly durationMs?: number;
  readonly completedAt: string;
}

/**
 * Execution diagnostic error payload.
 */
export interface SseErrorPayload {
  readonly executionId: string;
  readonly error: string;
  readonly code?: string;
  readonly recoverable: boolean;
  readonly timestamp: string;
}

/**
 * Universal SSE Event Envelope discriminating payload shapes by event type.
 */
export type SseStreamPayloadMap = {
  [SseStreamEvent.CHUNK]: SseChunkPayload;
  [SseStreamEvent.MESSAGE]: SseMessagePayload;
  [SseStreamEvent.ARTIFACT]: SseArtifactPayload;
  [SseStreamEvent.APPROVAL_REQUEST]: SseApprovalRequestPayload;
  [SseStreamEvent.TOOL_CALL]: SseToolCallPayload;
  [SseStreamEvent.DONE]: SseDonePayload;
  [SseStreamEvent.ERROR]: SseErrorPayload;
};

/**
 * Discriminated SSE Event envelope for typed stream processing.
 */
export interface SseEventEnvelope<E extends SseStreamEvent = SseStreamEvent> {
  readonly event: E;
  readonly data: SseStreamPayloadMap[E];
  readonly id?: string;
  readonly retry?: number;
}
