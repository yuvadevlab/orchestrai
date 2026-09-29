/**
 * @file apps/gateway/src/modules/streaming/index.ts
 * @description Streaming module barrel — live SSE and BullMQ queue producer.
 * @module apps/gateway/modules/streaming
 */
export { liveExecutionManager } from "./live-execution.manager";
export { agentQueueProducerManager } from "@/modules/streaming/agent-execution-queue.producer";
