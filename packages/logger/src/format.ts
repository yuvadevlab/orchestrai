/**
 * @file packages/logger/src/format.ts
 * @description ANSI terminal color formatting and message serialization utilities.
 */

import type { LogLevel } from "./types";

/**
 * ANSI escape codes for terminal color highlighting.
 */
const COLOR_MAP: Record<LogLevel, string> = {
  debug: "\x1b[35m", // Magenta
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
};

const COLOR_RESET = "\x1b[0m";

/**
 * Serializes arbitrary parameter objects safely into readable strings.
 *
 * @param param - Any parameter passed to logger.
 * @returns Serialized string representation.
 */
function serializeParam(param: unknown): string {
  if (param instanceof Error) {
    return param.stack ?? param.message;
  }
  if (typeof param === "object" && param !== null) {
    try {
      return JSON.stringify(param);
    } catch {
      return "[Circular Object]";
    }
  }
  return String(param);
}

/**
 * Formats a log line with ISO timestamp, colored severity level, context, and parameters.
 *
 * @param level - Log severity level.
 * @param context - Optional context tag.
 * @param message - Main message payload.
 * @param optionalParams - Additional metadata or objects.
 * @returns Fully formatted log line.
 */
export function formatLogMessage(
  level: LogLevel,
  context: string | undefined,
  message: unknown,
  ...optionalParams: unknown[]
): string {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` [${context}]` : "";
  const color = COLOR_MAP[level] ?? "";
  const levelStr = `${color}${level.toUpperCase()}${COLOR_RESET}`;

  const extra =
    optionalParams.length > 0 ? ` ${optionalParams.map((p) => serializeParam(p)).join(" ")}` : "";

  return `[${timestamp}] ${levelStr}${ctx}: ${serializeParam(message)}${extra}`;
}
