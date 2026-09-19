/**
 * @file packages/logger/src/transports/file.transport.ts
 * @description File stream transport appending logs to disk.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Creates a writable file stream appending UTF-8 lines to the specified path.
 *
 * @param filePath - Target file destination.
 * @returns Writable file stream or null on failure.
 */
export function createFileTransport(filePath: string): NodeJS.WritableStream | null {
  const dir = path.dirname(filePath);
  try {
    fs.mkdirSync(dir, { recursive: true });
    return fs.createWriteStream(filePath, { flags: "a", encoding: "utf8" });
  } catch {
    // Directory not writable or disk failure — return null for best-effort fallback
    return null;
  }
}
