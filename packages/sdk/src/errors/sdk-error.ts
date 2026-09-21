/**
 * @file packages/sdk/src/errors/sdk-error.ts
 * @description Base SDK error class with HTTP status, domain code, and request trace correlation.
 */

/**
 * Base exception thrown by the OrchestrAI SDK across all failures.
 */
export class OrchestrAISDKError extends Error {
  /** HTTP response status code */
  public readonly statusCode: number;
  /** Machine-readable error code */
  public readonly code: string;
  /** Structured contextual error details */
  public readonly details?: unknown;
  /** Request correlation trace ID if returned by gateway */
  public readonly requestId?: string;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      details?: unknown;
      requestId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "OrchestrAISDKError";
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "SDK_ERROR";
    this.details = options.details;
    this.requestId = options.requestId;

    if (options.cause) {
      this.cause = options.cause;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
