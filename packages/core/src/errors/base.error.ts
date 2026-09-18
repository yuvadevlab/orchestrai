/**
 * @file packages/core/src/errors/base.error.ts
 * @description Base domain error class for OrchestrAI.
 * Enforces structured error codes, HTTP status mapping, and JSON serialization.
 *
 * Design notes:
 * - `OrchestrAIError` is generic on `TCode extends ErrorCode` so that each
 *   domain subclass narrows `code` to a single string literal. This enables
 *   exhaustive `switch (err.code)` discrimination at call sites.
 * - `ErrorCode` lives in `@orchestrai/shared-types` as the single source of
 *   truth; add new codes there whenever a new subclass is introduced.
 */

import type { ErrorCode } from "@orchestrai/shared-types";

/**
 * Serialized representation of an OrchestrAI error for API and logging boundaries.
 * The `code` field is a string (not the union type) so it survives JSON transport.
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
 *
 * @typeParam TCode - The specific `ErrorCode` literal this error instance carries.
 *                   Defaults to the full `ErrorCode` union for the base case.
 */
export class OrchestrAIError<TCode extends ErrorCode = ErrorCode> extends Error {
  /**
   * ISO timestamp when the error instance was instantiated.
   */
  public readonly timestamp: string;

  /**
   * Constructs an OrchestrAIError.
   *
   * @param message - Human-readable error description.
   * @param code - Machine-readable error code constrained to the `ErrorCode` union.
   * @param statusCode - HTTP status code equivalent (defaults to 500).
   * @param details - Optional contextual debug metadata or Zod issues.
   */
  constructor(
    message: string,
    public readonly code: TCode = "INTERNAL_SERVER_ERROR" as TCode,
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
   * Safe for network transport — the generic narrows the `code` at compile
   * time but the serialized form is always a plain `string`.
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
