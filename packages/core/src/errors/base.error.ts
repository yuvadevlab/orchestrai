/**
 * @file packages/core/src/errors/base.error.ts
 * @description Base domain error class for OrchestrAI.
 * Enforces structured error codes, HTTP status mapping, and JSON serialization.
 */

/**
 * Serialized representation of an OrchestrAI error for API and logging boundaries.
 */
export interface SerializedOrchestrAIError {
  readonly name: string;
  readonly message: string;
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;
  readonly timestamp: string;
}

/**
 * Root domain error for the OrchestrAI platform.
 * All domain, infrastructure, and runtime errors must extend this base class.
 */
export class OrchestrAIError extends Error {
  /**
   * ISO timestamp when the error instance was instantiated.
   */
  public readonly timestamp: string;

  /**
   * Constructs an OrchestrAIError.
   *
   * @param message - Human-readable error description.
   * @param code - Machine-readable constant string error code.
   * @param statusCode - HTTP status code equivalent (defaults to 500).
   * @param details - Optional contextual debug metadata or Zod issues.
   */
  constructor(
    message: string,
    public readonly code: string = "INTERNAL_SERVER_ERROR",
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();

    // Maintain proper V8 stack trace capture across inherited prototypes
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes the error to a standardized JSON-compatible object.
   *
   * @returns Serialized error representation safe for network transport.
   */
  public toJSON(): SerializedOrchestrAIError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
