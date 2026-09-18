# Coding Standards & Best Practices

## 1. TypeScript Standards

- **Strict Mode**: Never use `any`. Use `unknown` with runtime type narrowing via Zod or type guards.
- **Export Discipline**: Explicit return types for public/exported functions and API routes.
- **Null Safety**: Avoid non-null assertions (`!`). Use optional chaining (`?.`) and nullish coalescing (`??`).
- **Index Access**: With `noUncheckedIndexedAccess`, always check if indexed array/object elements exist before accessing properties.

## 2. Validation & Data Modeling

- Every external input (HTTP request body, query params, WebSocket message, queue job data, environment variable) MUST be validated with Zod.
- In `@orchestrai/core`, export both the Zod schema and the inferred TypeScript type:
  ```typescript
  export const ExecutionContextSchema = z.object({
    executionId: z.string().uuid(),
    traceId: z.string(),
    startedAt: z.date(),
  });
  export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;
  ```

## 3. Error Handling & Custom Errors

- Inherit from a standard `OrchestrAIError` base class:
  ```typescript
  export class OrchestrAIError extends Error {
    constructor(
      message: string,
      public readonly code: string,
      public readonly statusCode: number = 500,
      public readonly details?: unknown,
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace?.(this, this.constructor);
    }
  }
  ```
- Specific domains define domain errors: `ToolExecutionError`, `ModelTimeoutError`, `PolicyViolationError`, `CheckpointError`.

## 4. Testing

- Use Vitest for unit and integration testing.
- Test suites live adjacent to source files (`*.test.ts`) or in a `tests/` subdirectory.
- Unit tests must be fast, deterministic, and mock external network calls.
