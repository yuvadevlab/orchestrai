/**
 * @file packages/tools/src/builtins/network/fetch.tool.ts
 * @description Safe HTTP network request tool with size limits and URL validation.
 *
 * ─── Network Calls in AI Agents (Learning note) ────────────────────
 * Network access allows an agent to query external documentation, APIs, and search endpoints.
 *
 * Security & Reliability measures:
 * 1. Permission tier: SENSITIVE — requires explicit agent clearance for external I/O.
 * 2. URL Protocol restriction: Strictly permits only `http:` and `https:`.
 * 3. Response truncation: Caps the maximum body size (default: 100 KB) so a large HTML
 *    page or binary blob does not crash the process or burn unnecessary LLM tokens.
 * 4. Cooperative cancellation: Passes the runner's `abortSignal` directly to `fetch`.
 * ───────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import { ToolPermissionLevel } from "@orchestrai/shared-types";
import { OrchestrAIError, type ToolDefinition } from "@orchestrai/core";
import type { ITool, ToolExecutionContext } from "@/interfaces";

/**
 * Input arguments schema for FetchTool.
 */
export const FetchInputSchema = z.object({
  url: z.string().url().describe("Target HTTP or HTTPS URL to query"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET").describe("HTTP method"),
  headers: z
    .record(z.string(), z.string())
    .optional()
    .describe("Optional HTTP request headers dictionary"),
  body: z.string().optional().describe("Optional raw string request payload"),
  maxBytes: z
    .number()
    .int()
    .positive()
    .default(100_000)
    .describe("Maximum response body size in bytes to prevent token overflow"),
});

export type FetchInput = z.infer<typeof FetchInputSchema>;

/**
 * Output shape returned by FetchTool.
 */
export interface FetchOutput {
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
  readonly body: string;
  readonly isTruncated: boolean;
}

/**
 * Tool for dispatching safe, bounded HTTP network requests.
 */
export class FetchTool implements ITool<FetchInput, FetchOutput> {
  public readonly definition: ToolDefinition = {
    name: "http_fetch",
    description:
      "Performs a bounded HTTP request (GET, POST, PUT, DELETE) to an external URL. Returns status and text body.",
    permissionLevel: ToolPermissionLevel.SENSITIVE,
    parametersSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Target URL" },
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE"],
          default: "GET",
        },
        headers: { type: "object", description: "Request headers" },
        body: { type: "string", description: "Request body" },
        maxBytes: {
          type: "integer",
          default: 100000,
          description: "Max response bytes",
        },
      },
      required: ["url"],
    },
    timeoutMs: 20_000,
    isDestructive: false,
  };

  public readonly inputSchema = FetchInputSchema;

  /**
   * Executes the HTTP request safely with size bounding and abort signal forwarding.
   */
  async execute(args: FetchInput, context: ToolExecutionContext): Promise<FetchOutput> {
    const parsedUrl = new URL(args.url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new OrchestrAIError(
        `Protocol "${parsedUrl.protocol}" is forbidden. Only "http:" and "https:" are allowed.`,
        "POLICY_VIOLATION",
        403,
        { url: args.url },
      );
    }

    const response = await fetch(args.url, {
      method: args.method,
      headers: args.headers,
      body: args.body,
      signal: context.abortSignal,
    });

    const rawText = await response.text();
    const isTruncated = Buffer.byteLength(rawText, "utf8") > args.maxBytes;
    const body = isTruncated ? rawText.slice(0, args.maxBytes) : rawText;

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body,
      isTruncated,
    };
  }
}
