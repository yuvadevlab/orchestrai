/**
 * Activity event audit level / outcome.
 */
export type ActivityStatus = "SUCCESS" | "WARNING" | "FAILURE";

/**
 * Activity audit event entity.
 */
export interface ActivityEvent {
  id: string;
  time: string;
  type: string;
  detail: string;
  status: ActivityStatus;
}
