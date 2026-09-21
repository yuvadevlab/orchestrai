/**
 * @file apps/gateway/src/routes/http-helpers.ts
 * @description HTTP response serialization and request body stream parsing utilities.
 */

import type { IncomingMessage } from "node:http";
import type { GatewayResponse } from "./http-types";

/**
 * Sends a structured JSON payload with Content-Type header.
 *
 * @param res - Outbound server response
 * @param statusCode - HTTP status code
 * @param data - Serialisable data object
 */
export function sendJson(res: GatewayResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

/**
 * Parses inbound JSON streaming payload with byte threshold guard.
 *
 * @param req - Inbound Node.js request stream
 * @param maxBytes - Maximum permitted body payload size (default 2MB)
 * @returns Parsed JSON body or undefined if empty
 */
export async function parseJsonBody(
  req: IncomingMessage,
  maxBytes: number = 2 * 1024 * 1024,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    let totalBytes = 0;

    req.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      // Guard against oversized payload attacks
      if (totalBytes > maxBytes) {
        reject(new Error(`Payload exceeds maximum allowed size of ${maxBytes} bytes`));
        req.destroy();
        return;
      }
      raw += chunk.toString("utf-8");
    });

    req.on("end", () => {
      // If empty body received, return undefined cleanly
      if (!raw || raw.trim().length === 0) {
        resolve(undefined);
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Invalid JSON syntax in request body: ${(err as Error).message}`));
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Extracts query string parameters from request URL path.
 *
 * @param rawUrl - Raw URL string from request
 * @returns Key-value map of decoded query string arguments
 */
export function parseQueryParams(rawUrl: string | undefined): Record<string, string> {
  if (!rawUrl || !rawUrl.includes("?")) {
    return {};
  }

  const queryString = rawUrl.split("?")[1] || "";
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  return params;
}
