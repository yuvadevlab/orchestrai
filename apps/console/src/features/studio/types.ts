/**
 * @file types.ts
 * @description Domain types for the Universal Autonomous Cowork Studio.
 * @module apps/console/features/studio
 */

/** Cowork operating mode. */
export type CoworkMode =
  "chat" | "plan" | "act" | "auto" | "autonomous" | "research" | "plan_execute" | "direct" | string;

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
  status: "pending" | "running" | "completed" | "failed";
  detail?: string;
}

/** Rich multi-domain artifact types. */
export interface CoworkArtifact {
  id: string;
  type: "document" | "code" | "terminal" | "search" | "data";
  title: string;
  content: string;
  filePath?: string;
  language?: string;
  metadata?: Record<string, unknown>;
  status: "running" | "success" | "error";
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
  status?: "pending" | "approved" | "rejected";
}

/** Chat/Execution message in a cowork session. */
export interface CoworkMessage {
  id: string;
  role: "user" | "agent" | "system";
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
  type: "think" | "plan" | "search" | "web" | "file" | "database" | "delegate" | "model";
}
