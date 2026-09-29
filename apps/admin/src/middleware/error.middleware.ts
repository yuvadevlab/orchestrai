/**
 * @file apps/admin/src/middleware/error.middleware.ts
 * @description Standardized error response serialization for Operator Control Plane.
 * @module apps/admin/middleware
 */

import type { ServerResponse } from "node:http";
import { ZodError } from "zod";

/**
 * Serializes application or validation errors into RFC 7807 compatible JSON format.
 *
 * @param err - Thrown error or unhandled rejection
 * @param res - Outbound HTTP response
 * @param requestId - Correlation request ID
 */
export function handleAdminError(err: unknown, res: ServerResponse, requestId: string): void {
  // If response headers were already sent, cannot mutate
  if (res.headersSent) {
    return;
  }

  res.setHeader("Content-Type", "application/json");

  // Handle schema validation failures
  if (err instanceof ZodError) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request payload failed schema validation",
          details: err.issues,
          requestId,
        },
      }),
    );
    return;
  }

  // Handle standard HTTP / operational exceptions
  const message = err instanceof Error ? err.message : "Internal operator service error";
  res.statusCode = 500;
  res.end(
    JSON.stringify({
      error: {
        code: "INTERNAL_ERROR",
        message,
        requestId,
      },
    }),
  );
}
