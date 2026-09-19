/**
 * Model health status state.
 */
export type ModelStatus = "ONLINE" | "DEGRADED" | "OFFLINE";

/**
 * Model routing definition entity.
 */
export interface ModelDefinition {
  id: string;
  provider: string;
  status: ModelStatus;
  cost: string;
  latency: string;
}
