# Phase 3: `packages/tools` — Tools & Execution Security

## Objectives

Establish the tool execution and safety perimeter layer for OrchestrAI, providing agents with the ability to safely interact with local filesystems, external APIs, and shell environments behind a sandboxed runner, hierarchical permission gates, and Human-in-the-Loop (HITL) approval thresholds.

## Package Location

`packages/tools/`

## Invariant Rules & Dependency Flow

1. Sits in the **Infrastructure / Tool Execution Layer**.
2. Depends exclusively on `@orchestrai/core` and `@orchestrai/shared-types`.
3. Does **not** import from `@orchestrai/models`, `@orchestrai/agent`, or `@orchestrai/runtime`.
4. Strictly adheres to the **250-line rule** per file, with modular separation of concerns.

## Modules Implemented

```text
packages/tools/src/
├── interfaces/
│   ├── tool.interface.ts          # ITool<TInput, TOutput> and ToolExecutionContext
│   └── index.ts
├── security/
│   ├── path-sanitizer.ts          # Path jail preventing directory traversal out of workspace
│   ├── permission-evaluator.ts    # Clearance level hierarchy and HITL approval check
│   └── index.ts
├── registry/
│   ├── tool-registry.ts           # Tool discovery, querying, and LLM schema converters
│   ├── tool-registry.types.ts     # OpenAI, Anthropic, and Ollama tool wire shapes
│   └── index.ts
├── runner/
│   ├── tool-runner.ts             # Sandboxed execution: Zod validation, timeouts, error boundary
│   └── index.ts
├── builtins/
│   ├── filesystem/
│   │   ├── read-file.tool.ts      # ReadFileTool (READ_ONLY, line-windowing)
│   │   ├── write-file.tool.ts     # WriteFileTool (WRITE_SAFE, recursive dir creation)
│   │   ├── list-dir.tool.ts       # ListDirectoryTool (READ_ONLY, bounded entry count)
│   │   └── index.ts
│   ├── network/
│   │   ├── fetch.tool.ts          # FetchTool (SENSITIVE, URL validation, size caps)
│   │   └── index.ts
│   ├── system/
│   │   ├── bash.tool.ts           # BashTool (DANGEROUS, HITL mandatory, subprocess spawn)
│   │   └── index.ts
│   └── index.ts                   # Builtins master barrel
└── index.ts                       # Public API barrel export
```

## Key Architectural Decisions

1. **Dual Schema & Type Binding (`ITool`)**:
   Tools declare both an LLM-facing `definition.parametersSchema` (JSON Schema) and an execution-facing `inputSchema` (Zod). This guarantees strict runtime validation before running tool code, preventing LLM hallucinations from causing runtime errors.
2. **Sandbox Path Jail (`PathSanitizer`)**:
   All filesystem and working directory operations resolve candidate paths against `workspaceRoot` and verify that the target starts with the canonical root, actively blocking directory traversal (`../../etc/passwd`).
3. **Hierarchical Permission Clearance**:
   Permissions are ranked (`READ_ONLY` < `WRITE_SAFE` < `SENSITIVE` < `DANGEROUS`). Tools declared as `DANGEROUS` unconditionally require human approval before execution.
4. **Execution Boundary & Error Containment (`ToolRunner`)**:
   The runner intercepts all exceptions, validation errors, and timeout aborts, returning a normalized `ToolResult` with status `SUCCESS` or `ERROR` and duration in milliseconds. The worker process is never crashed by failing tools.
