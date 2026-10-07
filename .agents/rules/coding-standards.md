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
  - Every exported function, class, interface, type, constant, page component, and Zod schema MUST have rich JSDoc comments.
  - Specify `@param`, `@returns`, and `@throws` where applicable.
  - Provide concise usage examples for domain abstractions.
- **Explanatory Inline Block Comments**:
  - Explain the **why**, not just the **what**.
  - Document all conditionals (`if`, `else`, `switch`), guard clauses, loop boundaries, async calls, calculations, and data transformations.
  - Explain why an invariant is being enforced or why a fallback strategy was chosen.
  - Explain non-obvious business logic, concurrency control, and error recovery branches to facilitate manual debugging of AI-generated code.

## 3. Module Architecture & Barrel Imports

- **Authoritative Barrel Files**:
  - Always import from module or package barrels (e.g., `import { ... } from "@orchestrai/shared-types"`, `import { ... } from "@/features/tools/api"`, `import { ... } from "@/services"`), rather than deep relative paths like `../folder/**` or `@/folder/sub/sub/file.ts`.
  - Every modular directory containing multiple domain files MUST have a single authoritative `index.ts` barrel file exporting its public symbols.
  - **Zero Duplicate / Conflicting Barrels**: Never introduce duplicate barrel files with overlapping names (e.g. do NOT maintain `constants.ts` alongside a `constants/index.ts` directory).

## 4. Standardized Structured Logging (`@yuva-devlab/logger`)

- **Instantiation**: Instantiate via `new Logger("ClassName")` or `loggerWithConfig(new Logger("ClassName"))`.
- **Log Message Pattern**: Every log message MUST follow the pattern:
  `"methodName: description of the action"`
  Example:
  ```typescript
  this.logger.info("listProviders: fetching registered LLM providers", { tenantId });
  ```
- **Zero Duplicate Class Names**: Do NOT prefix the message string with the class name (e.g. avoid `"[ClassName] methodName..."` or `"[MethodName]"`), because `@yuva-devlab/logger` automatically prefixes `[ClassName]` from its constructor.
- **Structured Metadata**: Always pass diagnostic contextual parameters (IDs, counts, flags, latency, errors) as a structured JSON object in the second parameter.

## 5. TypeScript Invariants

- **Strict Mode**: Never use `any`. Use `unknown` with runtime type narrowing via Zod or type guards.
- **Explicit Return Types**: Explicit return types for all public and exported functions.
- **Null Safety**: Avoid non-null assertions (`!`). Use optional chaining (`?.`) and nullish coalescing (`??`).
- **Index Access**: With `noUncheckedIndexedAccess`, always check if indexed array or object elements exist before accessing properties.

## 6. Zero Hardcoded Strings, Dynamic Constants & Strict Enum Usage

- **Never Use Hardcoded String Literals**: Domain statuses, event types, roles, modes, scopes, clearance levels, HTTP methods (`HttpMethod`), and step outcomes (`StepOutcome`) must NEVER be bare strings.
- **Always Reference `Enum.KEY`**: Every status check, branching statement, or assignment must use the shared enum key from `@orchestrai/shared-types` or `@orchestrai/core`.
- **Centralized Parameter Keys & Constants**: Route parameters, query parameters, header names, and entity keys (e.g. `QUERY_PARAMS.PROVIDER_ID`, `ROUTE_PARAMS.AGENT_ID`, `ADMIN_ROUTES.LLM_PROVIDER`) must be defined as shared constants in `@orchestrai/shared-types/constants` so changes can be maintained from a single source of truth.
- **Zero Mock / Fallback Responses**: Frontends, API hooks, and queries must NEVER contain static hardcoded fallback mock responses (e.g. static chip arrays). All data must be server-driven.
- **Zero Fallback Model Names**: Never hardcode fallback model strings (`"gemma4:31b-cloud"`, `"qwen2.5:7b"`) or `DEFAULT_FALLBACK_CANDIDATE`.
- **Centralized Regex**: All regular expressions across all apps and packages must be imported from `@orchestrai/regex`. Zero inline regexes.

## 7. Validation & Schemas

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

## 8. Error Handling & Custom Errors

- Inherit from standard `OrchestrAIError` with code, statusCode, and details.
- Always include contextual diagnostic metadata in errors for structured logging.

## 9. Testing Standards (Strict Implementation Policy)

- While implementing roadmap phases, DO NOT implement test cases (unit, e2e, integration) or Storybook stories until explicitly requested by the user.
- Production code must be verified with `pnpm typecheck` and `pnpm lint`.
