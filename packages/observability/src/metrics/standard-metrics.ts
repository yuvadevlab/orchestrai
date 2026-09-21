/**
 * @file packages/observability/src/metrics/standard-metrics.ts
 * @description Standard platform metrics registered according to Section 72 specification.
 */

import type { MetricRegistry } from "./metric-registry";
import type { ICounter, IGauge, IHistogram } from "./metric.types";

export interface StandardMetrics {
  // Agent
  agentExecutionsTotal: ICounter;
  agentExecutionDuration: IHistogram;
  agentFailuresTotal: ICounter;
  activeExecutions: IGauge;

  // LLM
  llmRequestsTotal: ICounter;
  llmDuration: IHistogram;
  llmErrorsTotal: ICounter;
  llmTokensInputTotal: ICounter;
  llmTokensOutputTotal: ICounter;

  // Tools
  toolCallsTotal: ICounter;
  toolDuration: IHistogram;
  toolFailuresTotal: ICounter;

  // Queue
  queueDepth: IGauge;
  jobDuration: IHistogram;
  jobFailuresTotal: ICounter;

  // Realtime
  realtimeActiveConnections: IGauge;
  realtimeMessagesTotal: ICounter;
  realtimeDisconnectsTotal: ICounter;
  realtimeMessageLatency: IHistogram;
}

/**
 * Initializes and registers standard platform telemetry metrics.
 */
export function registerStandardMetrics(registry: MetricRegistry): StandardMetrics {
  return {
    agentExecutionsTotal: registry.counter(
      "agent_executions_total",
      "Total number of agent execution runs initiated",
    ),
    agentExecutionDuration: registry.histogram(
      "agent_execution_duration_ms",
      "End-to-end agent execution duration in milliseconds",
      [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000],
    ),
    agentFailuresTotal: registry.counter(
      "agent_failures_total",
      "Total number of failed agent execution runs",
    ),
    activeExecutions: registry.gauge(
      "active_executions",
      "Current number of in-flight running executions",
    ),

    llmRequestsTotal: registry.counter(
      "llm_requests_total",
      "Total number of model inference API calls dispatched",
    ),
    llmDuration: registry.histogram(
      "llm_duration_ms",
      "Model inference latency in milliseconds",
      [100, 250, 500, 1000, 2000, 5000, 10000, 20000],
    ),
    llmErrorsTotal: registry.counter(
      "llm_errors_total",
      "Total number of failed model inference API requests",
    ),
    llmTokensInputTotal: registry.counter(
      "llm_tokens_input_total",
      "Cumulative prompt tokens consumed",
    ),
    llmTokensOutputTotal: registry.counter(
      "llm_tokens_output_total",
      "Cumulative completion tokens generated",
    ),

    toolCallsTotal: registry.counter(
      "tool_calls_total",
      "Total number of tool invocations dispatched",
    ),
    toolDuration: registry.histogram(
      "tool_duration_ms",
      "Tool invocation execution duration in milliseconds",
      [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    ),
    toolFailuresTotal: registry.counter(
      "tool_failures_total",
      "Total number of tool executions resulting in errors",
    ),

    queueDepth: registry.gauge(
      "queue_depth",
      "Current depth of waiting background execution jobs in queue",
    ),
    jobDuration: registry.histogram(
      "job_duration_ms",
      "Queue worker job processing latency in milliseconds",
    ),
    jobFailuresTotal: registry.counter("job_failures_total", "Total number of failed worker jobs"),

    realtimeActiveConnections: registry.gauge(
      "realtime_active_connections",
      "Current active WebSocket and SSE client connections",
    ),
    realtimeMessagesTotal: registry.counter(
      "realtime_messages_total",
      "Total number of realtime streaming events broadcasted",
    ),
    realtimeDisconnectsTotal: registry.counter(
      "realtime_disconnects_total",
      "Total number of realtime client disconnections",
    ),
    realtimeMessageLatency: registry.histogram(
      "realtime_message_latency_ms",
      "Latency of realtime message delivery in milliseconds",
      [1, 5, 10, 25, 50, 100, 250],
    ),
  };
}
