/**
 * @file types.ts
 * @description Domain types for the Universal Autonomous Cowork Studio.
 * @module apps/console/features/studio
 */

import {
  PermissionScope,
  ApprovalRiskLevel,
  ArtifactType,
  ArtifactStatus,
  PlanStepStatus,
  ApprovalStatus,
  CoworkMode,
  StudioEventType,
  CoworkMessageRole,
  SseStreamEvent,
  MessageSegmentType,
} from "@orchestrai/shared-types";

export {
  PermissionScope,
  ApprovalRiskLevel,
  ArtifactType,
  ArtifactStatus,
  PlanStepStatus,
  ApprovalStatus,
  CoworkMode,
  StudioEventType,
  CoworkMessageRole,
  SseStreamEvent,
  MessageSegmentType,
};

/** Specialist Persona definition. */
export interface SpecialistPersona {
  id: string;
  name: string;
  domain: string;
  role: string;
  description: string;
  avatarIcon?: string;
  defaultModel?: string;
}

/** Step in a structured execution plan. */
export interface PlanStep {
  id: string;
  title: string;
  status: PlanStepStatus;
  detail?: string;
}

/** Rich multi-domain artifact types. */
export interface CoworkArtifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  filePath?: string;
  language?: string;
  metadata?: Record<string, unknown>;
  status: ArtifactStatus;
  durationMs?: number;
}

/** Interactive Human-in-the-Loop clearance ticket */
export interface StudioApprovalRequest {
  id: string;
  executionId: string;
  tool: string;
  target: string;
  reason: string;
  suggestedPrefix?: string;
  isSensitive?: boolean;
  riskLevel?: ApprovalRiskLevel;
  status?: ApprovalStatus;
  /**
   * Set after the operator makes a decision via the live activity bar.
   * Drives the inline decision log chip in the message thread.
   */
  resolvedScope?: PermissionScope;
  /** ISO timestamp of when the decision was made */
  resolvedAt?: string;
}

/** Sequential, chronologically ordered segment within an agent message turn. */
export type MessageSegment =
  | {
      id: string;
      type: MessageSegmentType.THINKING;
      text: string;
      durationSeconds?: number;
      collapsed?: boolean;
    }
  | {
      id: string;
      type: MessageSegmentType.PLAN;
      steps: PlanStep[];
    }
  | {
      id: string;
      type: MessageSegmentType.ARTIFACT;
      artifact: CoworkArtifact;
    }
  | {
      id: string;
      type: MessageSegmentType.APPROVAL;
      request: StudioApprovalRequest;
    }
  | {
      id: string;
      type: MessageSegmentType.TEXT;
      content: string;
    };

/** Chat/Execution message in a cowork session. */
export interface CoworkMessage {
  id: string;
  role: CoworkMessageRole;
  content: string;
  timestamp: string;
  specialistName?: string;
  model?: string;
  executionId?: string;
  thinking?: {
    text: string;
    durationSeconds: number;
    collapsed: boolean;
  };
  plan?: PlanStep[];
  artifacts?: CoworkArtifact[];
  approvalRequest?: StudioApprovalRequest;
  /** Chronologically ordered parts (thinking, artifacts, approvals, text) */
  segments?: MessageSegment[];
  tokensIn?: number;
  tokensOut?: number;
  isStreaming?: boolean;
}

/** Threaded cowork session. */
export interface CoworkSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  specialistId: string;
  model?: string;
  mode: CoworkMode;
  messages: CoworkMessage[];
}

/** Live SSE audit event. */
export interface StudioEvent {
  id: string;
  agent: string;
  title: string;
  detail: string;
  meta: string;
  type: StudioEventType;
}
