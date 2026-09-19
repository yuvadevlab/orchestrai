/**
 * Workflow DAG execution status state.
 */
export type WorkflowStatus = "ACTIVE" | "DRAFT" | "PAUSED" | "ARCHIVED";

/**
 * Workflow definition entity for DAG canvas.
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: number;
  status: WorkflowStatus;
  description?: string;
}
