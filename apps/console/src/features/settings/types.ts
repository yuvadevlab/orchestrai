/**
 * System settings state configuration.
 */
export interface SystemSettingsConfig {
  databaseUri: string;
  enableOutboxPoller: boolean;
  maxTimeoutSeconds: number;
  maxRetryLimit: number;
}
