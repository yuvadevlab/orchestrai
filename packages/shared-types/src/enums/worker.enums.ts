/**
 * @file packages/shared-types/src/enums/worker.enums.ts
 * @description Enumerations governing background worker job types, task classifications,
 * and health status reporting across the OrchestrAI worker fleet.
 *
 * All string values used in BullMQ job payloads, switch-case dispatch, and
 * maintenance job handlers must reference these enums — never inline literals.
 *
 * @module @orchestrai/shared-types/enums
 */

/**
 * Enumeration of maintenance task types processed by the maintenance job handler.
 * Each value maps directly to a BullMQ job payload `taskType` field.
 *
 * @example
 * ```ts
 * import { MaintenanceTaskType } from "@orchestrai/shared-types";
 * // ✅ Use enum instead of ❌ "dlq_inspection"
 * taskType: MaintenanceTaskType.DLQ_INSPECTION
 * ```
 */
export enum MaintenanceTaskType {
  /** Inspect dead-letter queue for poisoned jobs that cannot be retried automatically */
  DLQ_INSPECTION = "dlq_inspection",

  /** Remove stale or orphaned execution, session, and checkpoint records beyond the retention window */
  STALE_CLEANUP = "stale_cleanup",

  /** Aggregate runtime metrics, memory snapshots, and uptime telemetry */
  METRICS_AGGREGATION = "metrics_aggregation",
}

/**
 * Operational health status reported at the conclusion of a maintenance task run.
 * Maps to the `status` field of {@link MaintenanceJobResult}.
 */
export enum WorkerHealthStatus {
  /** All maintenance sub-tasks completed without errors */
  HEALTHY = "healthy",

  /** One or more sub-tasks reported warnings, but the job did not fail */
  DEGRADED = "degraded",
}
