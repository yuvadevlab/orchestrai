/**
 * @file apps/gateway/src/modules/events/domain-event-publisher.ts
 * @description Wires @orchestrai/events into the gateway.
 * Publishes strongly-typed domain events at every execution lifecycle transition.
 * Uses the in-memory EventBus for local delivery and is ready to swap in
 * Redis Streams or Kafka for production scale.
 * @module apps/gateway/modules/events
 */

import { MemoryEventBus } from "@orchestrai/events";
import { createDomainEvent } from "@orchestrai/events";
import { DomainEventType, ToolResultStatus } from "@orchestrai/shared-types";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { ExecutionId, TenantId, AgentId } from "@orchestrai/core";

const logger = loggerWithConfig(new Logger("DomainEventPublisher"));

/**
 * Singleton in-memory event bus.
 * In production, swap this for RedisStreamPublisher or KafkaPublisher from @orchestrai/events.
 */
export const domainEventBus = new MemoryEventBus();

/**
 * Publishes EXECUTION_STARTED when an execution begins live streaming.
 * Triggers: realtime → SSE push to console Inspector Rail.
 */
export function publishExecutionStarted(
  executionId: ExecutionId,
  agentId: string,
  tenantId: TenantId,
): void {
  try {
    const event = createDomainEvent({
      eventType: DomainEventType.EXECUTION_STARTED,
      executionId,
      tenantId,
      payload: { executionId, agentId: agentId as AgentId, startedAt: new Date() },
    });
    void domainEventBus.publish(event);
    logger.debug("Published EXECUTION_STARTED", { executionId });
  } catch (err) {
    // Domain events are non-critical — log and continue, never block execution
    logger.warn("Failed to publish EXECUTION_STARTED", { executionId, err });
  }
}

/**
 * Publishes TOOL_CALLED each time the agent invokes a workspace tool.
 * Triggers: observability → trace span start.
 */
export function publishToolCalled(
  executionId: ExecutionId,
  callId: string,
  toolName: string,
  input: Record<string, unknown>,
  tenantId: TenantId,
): void {
  try {
    const event = createDomainEvent({
      eventType: DomainEventType.TOOL_CALLED,
      executionId,
      tenantId,
      payload: { executionId, callId, toolName, input },
    });
    void domainEventBus.publish(event);
  } catch (err) {
    logger.warn("Failed to publish TOOL_CALLED", { executionId, toolName, err });
  }
}

/**
 * Publishes TOOL_COMPLETED after a tool invocation resolves (success or error).
 * Triggers: observability → trace span end + Inspector Rail update.
 */
export function publishToolCompleted(
  executionId: ExecutionId,
  callId: string,
  toolName: string,
  status: ToolResultStatus,
  durationMs: number,
  tenantId: TenantId,
  output?: unknown,
  error?: string,
): void {
  try {
    const event = createDomainEvent({
      eventType: DomainEventType.TOOL_COMPLETED,
      executionId,
      tenantId,
      payload: {
        executionId,
        callId: callId as never,
        toolName,
        status,
        durationMs,
        output,
        error,
      },
    });
    void domainEventBus.publish(event);
  } catch (err) {
    logger.warn("Failed to publish TOOL_COMPLETED", { executionId, toolName, err });
  }
}

/**
 * Publishes EXECUTION_COMPLETED when an execution finishes successfully.
 * Triggers: billing → CostLedger record, memory → distillation, eval → quality gate.
 */
export function publishExecutionCompleted(
  executionId: ExecutionId,
  tenantId: TenantId,
  totalSteps: number,
  totalTokens: number,
  durationMs: number,
  output: string,
): void {
  try {
    const event = createDomainEvent({
      eventType: DomainEventType.EXECUTION_COMPLETED,
      executionId,
      tenantId,
      payload: { executionId, totalSteps, totalTokens, durationMs, output },
    });
    void domainEventBus.publish(event);
    logger.info("Published EXECUTION_COMPLETED", { executionId, totalTokens, durationMs });
  } catch (err) {
    logger.warn("Failed to publish EXECUTION_COMPLETED", { executionId, err });
  }
}

/**
 * Publishes EXECUTION_FAILED when a turn loop terminates with an error.
 * Triggers: observability → error trace, memory → failure episode record.
 */
export function publishExecutionFailed(
  executionId: ExecutionId,
  tenantId: TenantId,
  error: string,
  failedAtStep?: number,
): void {
  try {
    const event = createDomainEvent({
      eventType: DomainEventType.EXECUTION_FAILED,
      executionId,
      tenantId,
      payload: { executionId, error, failedAtStep },
    });
    void domainEventBus.publish(event);
    logger.info("Published EXECUTION_FAILED", { executionId, error });
  } catch (err) {
    logger.warn("Failed to publish EXECUTION_FAILED", { executionId, err });
  }
}

/**
 * Publishes EXECUTION_CANCELLED when the user stops an active execution.
 * Triggers: worker → dequeue any pending async jobs.
 */
export function publishExecutionCancelled(
  executionId: ExecutionId,
  tenantId: TenantId,
  reason = "User requested cancellation",
): void {
  try {
    const event = createDomainEvent({
      eventType: DomainEventType.EXECUTION_CANCELLED,
      executionId,
      tenantId,
      payload: { executionId, reason },
    });
    void domainEventBus.publish(event);
    logger.info("Published EXECUTION_CANCELLED", { executionId });
  } catch (err) {
    logger.warn("Failed to publish EXECUTION_CANCELLED", { executionId, err });
  }
}

/**
 * Publishes APPROVAL_REQUESTED when a tool invocation requires HITL clearance.
 * Triggers: realtime → HITL modal in console Studio.
 */
export function publishApprovalRequested(
  executionId: ExecutionId,
  tenantId: TenantId,
  approvalId: string,
  toolName: string,
  riskLevel: string,
  reason: string,
): void {
  try {
    const event = createDomainEvent({
      eventType: DomainEventType.APPROVAL_REQUESTED,
      executionId,
      tenantId,
      payload: { executionId, approvalId, toolName, riskLevel, reason },
    });
    void domainEventBus.publish(event);
  } catch (err) {
    logger.warn("Failed to publish APPROVAL_REQUESTED", { executionId, toolName, err });
  }
}
