/**
 * @file apps/gateway/src/middleware/error.middleware.ts
 * @description Global error handling converting exceptions to structured JSON responses.
 */

import { ZodError } from "zod";
import { OrchestrAIError } from "@orchestrai/core";
import type { GatewayRequest, GatewayResponse } from "@/routes";

/**
 * Handles uncaught errors, mapping Zod validation, OrchestrAI domain errors,
 * and generic exceptions to structured HTTP responses.
 *
 * @param error - Caught error object or unknown exception
 * @param res - Outbound gateway response
 * @param requestId - Optional request trace identifier
 */
export function handleError(error: unknown, res: GatewayResponse, requestId?: string): void {
  // If response headers were already sent, terminate immediately
  if (res.headersSent) {
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

  // Handle Zod schema validation errors
  if (error instanceof ZodError) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request payload failed schema validation",
          details: error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
          requestId,
        },
      }),
    );
    return;
  }

  // Handle OrchestrAI domain errors
  if (error instanceof OrchestrAIError) {
    res.statusCode = error.statusCode;
    res.end(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      }),
    );
    return;
  }

  // Handle JSON parse errors
  if (error instanceof SyntaxError && "body" in error) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: {
          code: "INVALID_JSON",
          message: "Failed to parse request JSON payload",
          requestId,
        },
      }),
    );
    return;
  }

  // Fallback 500 Internal Server Error
  const message = error instanceof Error ? error.message : "An unexpected server error occurred";
  res.statusCode = 500;
  res.end(
    JSON.stringify({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
        requestId,
      },
    }),
  );
}

/**
 * Alias for handleError matching standard naming conventions.
 */
export const handleGatewayError = (
  error: unknown,
  req: GatewayRequest,
  res: GatewayResponse,
): void => {
  handleError(error, res, req.context?.requestId);
};
