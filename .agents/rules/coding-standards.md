# Coding Standards & Best Practices

## 1. File Size, Modularity & Code Splitting (Zero Exceptions)

- **Hard 250-Line Limit**: NO file may exceed **250 lines of code**.
- **Proactive Decomposition at 200 Lines**: When a file reaches ~200 lines, decompose it immediately into smaller, focused modules.
- **Single Clear Purpose**: Each file must do one thing well (e.g., one schema definition, one LangGraph node, one tool runner, one utility).
- **Code Splitting Patterns**:
  - Prefer exporting from dedicated feature directories via clean barrel files (`index.ts`).
  - Separate schemas (`*.schema.ts`), types (`*.types.ts`), constants (`*.constants.ts`), and helpers (`*.utils.ts`).

## 2. Documentation & Commenting Standards

- **Detailed JSDoc**:
  - Every exported function, class, interface, type, constant, and Zod schema MUST have rich JSDoc comments.
  - Specify `@param`, `@returns`, and `@throws` where applicable.
  - Provide concise usage examples for domain abstractions.
- **Explanatory Inline Comments**:
  - Explain the **why**, not just the **what**.
  - Document all conditionals (`if`, `else`, `switch`), guard clauses, and loop boundaries.
  - Explain why an invariant is being enforced or why a fallback strategy was chosen.
  - Explain non-obvious business logic, concurrency control, and error recovery branches.

## 3. TypeScript Invariants

- **Strict Mode**: Never use `any`. Use `unknown` with runtime type narrowing via Zod or type guards.
- **Explicit Return Types**: Explicit return types for all public and exported functions.
- **Null Safety**: Avoid non-null assertions (`!`). Use optional chaining (`?.`) and nullish coalescing (`??`).
- **Index Access**: With `noUncheckedIndexedAccess`, always check if indexed array or object elements exist before accessing properties.

## 4. Validation & Schemas

- Every external boundary (HTTP request body, query params, WebSocket frame, queue job, environment variable) MUST be validated with Zod.
- In `@orchestrai/core`, export both the Zod schema and the inferred TypeScript type:
  ```typescript
  /**
   * Zod schema validating execution runtime context.
   */
  export const ExecutionContextSchema = z.object({
    executionId: z.string().uuid().describe("Unique execution trace UUID"),
    traceId: z.string().describe("OpenTelemetry trace correlation ID"),
    startedAt: z.date().describe("Timestamp when the execution started"),
  });

  /**
   * Inferred TypeScript type for ExecutionContext.
   */
  export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;
  ```

## 5. Error Handling & Custom Errors

- Inherit from standard `OrchestrAIError` with code, statusCode, and details.
- Always include contextual diagnostic metadata in errors for structured logging.

## 6. Testing Standards

- Tests live adjacent to source files (`*.test.ts`).
- Aim for 100% pure unit test coverage on core schemas, mathematical models, and state transitions.
- All unit tests must be deterministic, fast, and mock external network calls.
