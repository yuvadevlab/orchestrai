/**
 * @file packages/sdk/src/transport/error-mapper.ts
 * @description HTTP error response deserializer mapping HTTP status codes to typed SDK errors.
 */

import {
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  GatewayTimeoutError,
  OrchestrAISDKError,
} from "@/errors";
import type { ApiErrorPayload } from "@/types";

/**
 * Parses an error response body and maps to specific OrchestrAISDKError subclass.
 */
export function mapHttpError(
  status: number,
  body: unknown,
  responseHeaders: Headers,
): OrchestrAISDKError {
  const payload = (
    body && typeof body === "object" && "error" in body
      ? (body as { error: ApiErrorPayload }).error
      : {}
  ) as ApiErrorPayload;

  const message = payload.message || `HTTP ${status} error occurred`;
  const requestId = payload.requestId || responseHeaders.get("x-request-id") || undefined;
  const retryHeader = responseHeaders.get("retry-after");
  const retryAfterSeconds = retryHeader ? parseInt(retryHeader, 10) : payload.retryAfterSeconds;

  switch (status) {
    case 400:
      return new ValidationError(message, { details: payload.details, requestId });
    case 401:
      return new AuthenticationError(message, { details: payload.details, requestId });
    case 403:
      return new PermissionDeniedError(message, { details: payload.details, requestId });
    case 404:
      return new NotFoundError(message, { details: payload.details, requestId });
    case 429:
      return new RateLimitError(message, {
        details: payload.details,
        requestId,
        retryAfterSeconds,
      });
    case 504:
      return new GatewayTimeoutError(message, { details: payload.details, requestId });
    default:
      return new OrchestrAISDKError(message, {
        statusCode: status,
        code: payload.code || "API_ERROR",
        details: payload.details,
        requestId,
      });
  }
}
