/**
 * @file packages/logger/src/types.ts
 * @description Master type definitions and configuration contracts for the logger package.
 */

/**
 * Supported severity levels for logging output.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Configuration options for initializing a logger instance.
 */
export interface LoggerConfig {
  /** Minimum log level to output (defaults to info) */
  readonly level?: LogLevel;
  /** Whether logging output is active (defaults to true) */
  readonly enabled?: boolean;
  /** Target file path for disk log persistence */
  readonly file?: string;
}

/**
 * Universal logger contract for OrchestrAI applications and services.
 */
export interface ILogger {
  /** Optional subsystem or class context tag */
  context?: string;

  /** General output (alias to info) */
  log(message: unknown, ...optionalParams: unknown[]): void;

  /** Informational application event */
  info(message: unknown, ...optionalParams: unknown[]): void;

  /** Recoverable or warning condition */
  warn(message: unknown, ...optionalParams: unknown[]): void;

  /** Unhandled or critical failure message */
  error(message: unknown, ...optionalParams: unknown[]): void;

  /** Verbose development diagnostic message */
  debug(message: unknown, ...optionalParams: unknown[]): void;
}
