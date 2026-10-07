/**
 * @file packages/sdk/src/errors/http-errors.ts
 * @description Strongly-typed error subclasses representing distinct HTTP and policy failures.
 */

import { ErrorCode } from "@orchestrai/shared-types";
import { OrchestrAISDKError } from "./sdk-error";

/**
 * Thrown when credentials (API key, Bearer token, or HMAC signature) are invalid or missing (401).
 */
export class AuthenticationError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 401, code: ErrorCode.UNAUTHORIZED, ...options });
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when caller lacks permissions for the requested tenant or resource (403).
 */
export class PermissionDeniedError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 403, code: ErrorCode.PERMISSION_DENIED, ...options });
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when the target agent, execution, or session cannot be found (404).
 */
export class NotFoundError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 404, code: ErrorCode.NOT_FOUND, ...options });
    this.name = this.constructor.name;
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
    super(message, { statusCode: 429, code: ErrorCode.RATE_LIMIT_EXCEEDED, ...options });
    this.name = this.constructor.name;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

/**
 * Thrown when request payload fails schema validation (400).
 */
export class ValidationError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 400, code: ErrorCode.VALIDATION_ERROR, ...options });
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when execution costs exceed the declared financial or token budget guardrail.
 */
export class BudgetExceededError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 402, code: ErrorCode.BUDGET_EXCEEDED, ...options });
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when gateway or upstream LLM provider timed out (504).
 */
export class GatewayTimeoutError extends OrchestrAISDKError {
  constructor(message: string, options: { details?: unknown; requestId?: string } = {}) {
    super(message, { statusCode: 504, code: ErrorCode.GATEWAY_TIMEOUT, ...options });
    this.name = this.constructor.name;
  }
}
