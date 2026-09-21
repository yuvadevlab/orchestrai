/**
 * @file apps/gateway/src/routes/http-types.ts
 * @description HTTP type definitions, request wrappers, and route handler signatures.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { RequestContext } from "../context/request-context";

/**
 * Supported HTTP methods for gateway endpoints.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

/**
 * Augmented HTTP IncomingMessage carrying typed context, route parameters, and parsed body.
 */
export interface GatewayRequest extends IncomingMessage {
  /** Request context carrying tenancy and auth metadata */
  context: RequestContext;
  /** Route URL parameters (e.g. :id) */
  params: Record<string, string>;
  /** Parsed JSON request payload */
  body?: unknown;
}

/**
 * Standard HTTP ServerResponse alias for gateway handlers.
 */
export type GatewayResponse = ServerResponse;

/**
 * Route handler function processing an incoming gateway request.
 */
export type RouteHandler = (
  req: GatewayRequest,
  res: GatewayResponse,
) => Promise<void | boolean> | void | boolean;

/**
 * Intermediate middleware function in request processing pipeline.
 */
export type MiddlewareFunction = (
  req: GatewayRequest,
  res: GatewayResponse,
) => Promise<boolean | void> | boolean | void;
