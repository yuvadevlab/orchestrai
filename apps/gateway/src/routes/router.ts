/**
 * @file apps/gateway/src/routes/router.ts
 * @description Lightweight parameterized HTTP request router with URL pattern matching.
 */

import type { GatewayRequest, GatewayResponse, HttpMethod, RouteHandler } from "./http-types";
import { parseJsonBody, sendJson } from "./http-helpers";

interface RegisteredRoute {
  method: HttpMethod;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

/**
 * Lightweight Zero-Framework HTTP Router supporting parameterised routes.
 */
export class Router {
  private readonly routes: RegisteredRoute[] = [];

  /**
   * Registers a route pattern for a specific HTTP method.
   *
   * @param method - HTTP verb
   * @param path - URL path pattern (e.g. /api/v1/executions/:id)
   * @param handler - Handler function
   */
  public register(method: HttpMethod, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    // Convert parameterized tokens (:param) to capturing regex groups
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)";
    });

    this.routes.push({
      method,
      pattern: new RegExp(`^${regexPath}$`),
      paramNames,
      handler,
    });
  }

  public get(path: string, handler: RouteHandler): void {
    this.register("GET", path, handler);
  }

  public post(path: string, handler: RouteHandler): void {
    this.register("POST", path, handler);
  }

  public put(path: string, handler: RouteHandler): void {
    this.register("PUT", path, handler);
  }

  public delete(path: string, handler: RouteHandler): void {
    this.register("DELETE", path, handler);
  }

  /**
   * Dispatches an incoming request to matching registered handler.
   *
   * @param req - Inbound gateway request
   * @param res - Outbound gateway response
   * @returns True if route handled; false if 404 Not Found
   */
  public async handle(req: GatewayRequest, res: GatewayResponse): Promise<boolean> {
    const urlPath = (req.url || "/").split("?")[0] || "/";
    const method = req.method as HttpMethod;

    for (const route of this.routes) {
      // Fast path: method match check
      if (route.method !== method) {
        continue;
      }

      const match = urlPath.match(route.pattern);
      if (match) {
        // Extract matched parameterized tokens
        req.params = {};
        for (let i = 0; i < route.paramNames.length; i++) {
          const name = route.paramNames[i];
          const val = match[i + 1];
          if (name && val !== undefined) {
            req.params[name] = decodeURIComponent(val);
          }
        }

        // Parse JSON body for mutation verbs if not already parsed
        if (["POST", "PUT", "PATCH"].includes(method) && req.body === undefined) {
          req.body = await parseJsonBody(req);
        }

        await route.handler(req, res);
        return true;
      }
    }

    // No matching route registered
    sendJson(res, 404, {
      error: {
        code: "NOT_FOUND",
        message: `Endpoint ${method} ${urlPath} not found`,
        requestId: req.context.requestId,
      },
    });
    return false;
  }
}
