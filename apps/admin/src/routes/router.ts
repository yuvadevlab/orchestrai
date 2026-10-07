/**
 * @file apps/admin/src/routes/router.ts
 * @description Lightweight HTTP router with parameterized path matching and JSON body parsing.
 * @module apps/admin/routes
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { ErrorCode } from "@orchestrai/shared-types";
import type { AdminRequestContext } from "@/context";

/**
 * Extended request interface including parsed route parameters and context.
 */
export interface AdminRequest extends IncomingMessage {
  context: AdminRequestContext;
  params: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
}

/**
 * Extended response interface.
 */
export type AdminResponse = ServerResponse;

/**
 * Route handler function signature.
 */
export type AdminRouteHandler = (req: AdminRequest, res: AdminResponse) => Promise<void> | void;

/**
 * Internal route registration entry.
 */
interface RouteEntry {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: AdminRouteHandler;
}

/**
 * Admin service HTTP router.
 */
export class AdminRouter {
  private readonly routes: RouteEntry[] = [];

  /**
   * Registers a route pattern for a given HTTP method.
   */
  public add(method: string, path: string, handler: AdminRouteHandler): void {
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });

    const pattern = new RegExp(`^${regexPath}$`);
    this.routes.push({
      method: method.toUpperCase(),
      pattern,
      paramNames,
      handler,
    });
  }

  public get(path: string, handler: AdminRouteHandler): void {
    this.add("GET", path, handler);
  }

  public post(path: string, handler: AdminRouteHandler): void {
    this.add("POST", path, handler);
  }

  public put(path: string, handler: AdminRouteHandler): void {
    this.add("PUT", path, handler);
  }

  public delete(path: string, handler: AdminRouteHandler): void {
    this.add("DELETE", path, handler);
  }

  /**
   * Dispatches incoming HTTP requests to the matching route handler.
   */
  public async handle(req: AdminRequest, res: AdminResponse): Promise<void> {
    const [pathname, search] = (req.url || "/").split("?");
    const cleanPath = pathname || "/";
    const method = (req.method || "GET").toUpperCase();

    // Parse URL query parameters
    const query: Record<string, string> = {};
    if (search) {
      const searchParams = new URLSearchParams(search);
      searchParams.forEach((val, key) => {
        query[key] = val;
      });
    }
    req.query = query;

    // Match route against registered patterns
    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }

      const match = cleanPath.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, idx) => {
          params[name] = match[idx + 1] || "";
        });
        req.params = params;

        // Parse JSON body for mutation methods
        if (method === "POST" || method === "PUT" || method === "PATCH") {
          req.body = await this.parseJsonBody(req);
        }

        await route.handler(req, res);
        return;
      }
    }

    // Unmatched path returns 404
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          code: ErrorCode.NOT_FOUND,
          message: `Endpoint ${method} ${cleanPath} not found on Admin service`,
          requestId: req.context?.requestId,
        },
      }),
    );
  }

  /**
   * Reads and parses UTF-8 JSON request payloads.
   */
  private async parseJsonBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve) => {
      let bodyData = "";
      req.on("data", (chunk: Buffer) => {
        bodyData += chunk.toString("utf8");
      });
      req.on("end", () => {
        if (!bodyData.trim()) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(bodyData));
        } catch {
          resolve({});
        }
      });
      req.on("error", () => resolve({}));
    });
  }
}
