/**
 * @file packages/logger/src/logger.ts
 * @description Standard Logger class with colored, timestamped, and contextual output.
 */

import type { ILogger, LogLevel } from "./types";
import { formatLogMessage } from "./format";

/**
 * Standard Logger implementation for OrchestrAI.
 */
export class Logger implements ILogger {
  public context?: string;
  private readonly fileStream?: NodeJS.WritableStream | null;
  private readonly minLevel: LogLevel;
  private readonly enabled: boolean;

  private static readonly LEVEL_RANK: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(
    context?: string,
    options: {
      minLevel?: LogLevel;
      enabled?: boolean;
      fileStream?: NodeJS.WritableStream | null;
    } = {},
  ) {
    this.context = context;
    this.minLevel = options.minLevel ?? "info";
    this.enabled = options.enabled ?? true;
    this.fileStream = options.fileStream;
  }

  /**
   * Evaluates if a given message level passes the active log level threshold.
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) {
      return false;
    }
    return Logger.LEVEL_RANK[level] >= Logger.LEVEL_RANK[this.minLevel];
  }

  /**
   * Writes the formatted log line to standard stream and optional file transport.
   */
  private output(level: LogLevel, line: string): void {
    const formattedWithNewline = line + "\n";

    // Write to appropriate stream based on severity
    if (level === "error" || level === "warn") {
      process.stderr.write(formattedWithNewline);
    } else {
      process.stdout.write(formattedWithNewline);
    }

    // Persist to file transport if enabled
    if (this.fileStream && "write" in this.fileStream) {
      this.fileStream.write(formattedWithNewline);
    }
  }

  public log(message: unknown, ...optionalParams: unknown[]): void {
    this.info(message, ...optionalParams);
  }

  public info(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.shouldLog("info")) return;
    const line = formatLogMessage("info", this.context, message, ...optionalParams);
    this.output("info", line);
  }

  public warn(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.shouldLog("warn")) return;
    const line = formatLogMessage("warn", this.context, message, ...optionalParams);
    this.output("warn", line);
  }

  public error(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.shouldLog("error")) return;
    const line = formatLogMessage("error", this.context, message, ...optionalParams);
    this.output("error", line);
  }

  public debug(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.shouldLog("debug")) return;
    const line = formatLogMessage("debug", this.context, message, ...optionalParams);
    this.output("debug", line);
  }
}
