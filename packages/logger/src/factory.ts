/**
 * @file packages/logger/src/factory.ts
 * @description Factory functions creating configured Logger instances from environment or options.
 */

import type { LoggerConfig, LogLevel } from "./types";
import { Logger } from "./logger";
import { createFileTransport } from "./transports/file.transport";

/**
 * Parses and validates raw environment log level string.
 *
 * @param raw - Environment variable value.
 * @returns Validated LogLevel (defaulting to info).
 */
export function parseLogLevel(raw?: string): LogLevel {
  if (!raw) return "info";
  const normalized = raw.toLowerCase().trim();
  return ["debug", "info", "warn", "error"].includes(normalized)
    ? (normalized as LogLevel)
    : "info";
}

/**
 * Creates a Logger configured from environment variables and explicit options.
 *
 * Supported environment variables:
 * - `LOG_ENABLED`: "false" disables output.
 * - `LOG_LEVEL`: Minimum log level ("debug" | "info" | "warn" | "error").
 * - `LOG_PERSIST`: Set to "true" to write logs to disk.
 * - `LOG_FILE`: File path for log output.
 *
 * @param context - Optional context tag (e.g. "Worker", "Queue").
 * @param config - Explicit configuration overrides.
 * @returns Configured Logger instance.
 */
export function createLogger(context?: string, config?: LoggerConfig): Logger {
  const enabled =
    config?.enabled ?? (process.env.LOG_ENABLED ? process.env.LOG_ENABLED !== "false" : true);
  const minLevel = config?.level ?? parseLogLevel(process.env.LOG_LEVEL);
  const filePath = config?.file ?? process.env.LOG_FILE;

  const fileStream =
    filePath && (process.env.LOG_PERSIST === "true" || config?.file !== undefined)
      ? createFileTransport(filePath)
      : null;

  return new Logger(context, {
    minLevel,
    enabled,
    fileStream,
  });
}

/**
 * Wraps an existing Logger instance to apply new configuration options.
 *
 * @param base - Base logger to wrap.
 * @param config - New configuration overrides.
 * @returns Configured Logger instance sharing base context.
 */
export function loggerWithConfig(base: Logger, config?: LoggerConfig): Logger {
  return createLogger(base.context, config);
}

/**
 * Global default logger instance configured from ambient environment variables.
 */
export const defaultLogger: Logger = createLogger();
