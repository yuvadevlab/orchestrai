import type { ActivityEvent } from "./types";

/**
 * Mock audit stream events for live telemetry page.
 */
export const MOCK_ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: "act_1",
    time: "12:44:02",
    type: "QUEUE_DRAIN",
    detail: "Worker pool drained 4 in-flight jobs gracefully",
    status: "SUCCESS",
  },
  {
    id: "act_2",
    time: "12:43:18",
    type: "AGENT_CHECKPOINT",
    detail: "DAG execution exec_01HQ89745 saved step 4 checkpoint to outbox",
    status: "SUCCESS",
  },
  {
    id: "act_3",
    time: "12:42:50",
    type: "OUTBOX_FLUSH",
    detail: "PostgreSQL outbox publisher dispatched 12 domain events to Kafka/BullMQ",
    status: "SUCCESS",
  },
  {
    id: "act_4",
    time: "12:40:11",
    type: "REDIS_RECONNECT",
    detail: "BullMQ queue connection pool verified alive on port 6379",
    status: "SUCCESS",
  },
];
