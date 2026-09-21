/**
 * @file packages/sdk/src/errors/http-errors.ts
 * @description Strongly-typed error subclasses representing distinct HTTP and policy failures.
 */

import { OrchestrAISDKError } from "./sdk-error";

/**
 * Thrown when credentials (API key, Bearer token, or HMAC signature) are invalid or missing (401).
 */
export class AuthenticationError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 401, code: "UNAUTHORIZED", ...options });
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when caller lacks permissions for the requested tenant or resource (403).
 */
export class PermissionDeniedError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 403, code: "PERMISSION_DENIED", ...options });
    this.name = "PermissionDeniedError";
  }
}

/**
 * Thrown when the target agent, execution, or session cannot be found (404).
 */
export class NotFoundError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 404, code: "NOT_FOUND", ...options });
    this.name = "NotFoundError";
  }
}

/**
 * Thrown when request rate limits are exceeded (429).
 */
export class RateLimitError extends OrchestrAISDKError {
  public readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    options: { details?: unknown; requestId?: string; retryAfterSeconds?: number } = {},
  ) {
    super(message, { statusCode: 429, code: "RATE_LIMIT_EXCEEDED", ...options });
    this.name = "RateLimitError";
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

/**
 * Thrown when request payload fails schema validation (400).
 */
export class ValidationError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 400, code: "VALIDATION_ERROR", ...options });
    this.name = "ValidationError";
  }
}

/**
 * Thrown when execution costs exceed the declared financial or token budget guardrail.
 */
export class BudgetExceededError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 402, code: "BUDGET_EXCEEDED", ...options });
    this.name = "BudgetExceededError";
  }
}

/**
 * Thrown when gateway or upstream LLM provider timed out (504).
 */
export class GatewayTimeoutError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 504, code: "GATEWAY_TIMEOUT", ...options });
    this.name = "GatewayTimeoutError";
  }
}
