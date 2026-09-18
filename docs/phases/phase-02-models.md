# Phase 2: `packages/models` — Models & LLM Adapters

## Objectives

Establish the provider-agnostic LLM adapter and registry layer for OrchestrAI, allowing the platform to seamlessly switch between local inference (Ollama) and cloud providers (OpenAI, Anthropic) behind a single unified interface (`ILlmAdapter`).

## Package Location

`packages/models/`

## Invariant Rules & Dependency Flow

1. Sits in the **Infrastructure Adapter Layer**.
2. Depends exclusively on `@orchestrai/core` for all shared contracts, schemas, and types.
3. Does **not** import from other domain packages (`@orchestrai/agent`, `@orchestrai/runtime`, etc.).
4. Strictly adheres to the **250-line rule** per file, with modular decomposition for mappers and schemas.

## Modules Implemented

```text
packages/models/src/
├── interfaces/
│   └── llm-adapter.interface.ts   # ILlmAdapter, LlmRequest, LlmResponse, LlmStreamChunk schemas
├── adapters/
│   ├── ollama/
│   │   ├── ollama.adapter.ts       # Local Ollama client adapter (invoke + stream generator)
│   │   ├── ollama.config.schema.ts # Host, defaultModel, timeout validation
│   │   └── ollama.mapper.ts        # Multimodal image & text converter to Ollama wire format
│   ├── openai/
│   │   ├── openai.adapter.ts       # OpenAI Chat Completions adapter
│   │   └── openai.config.schema.ts # API key, organization, baseURL validation
│   └── anthropic/
│       ├── anthropic.adapter.ts    # Anthropic Messages API adapter
│       └── anthropic.config.schema.ts
├── factory/
│   └── adapter-factory.ts         # createAdapter() factory function by ModelProvider
├── registry/
│   ├── model-registry.ts          # In-memory ModelRegistry for pooling and capability lookup
│   └── model-registry.types.ts    # ModelRegistryEntry and registry keys
├── utils/
│   ├── pricing.constants.ts       # Hardcoded token rates per 1k tokens for supported models
│   └── usage-aggregator.ts        # Pure functions for merging token counts & cost estimation
└── index.ts                       # Public API barrel export
```

## Key Architectural Decisions

1. **Static Async Factory Initialization (`create()`)**:
   Constructors in TypeScript cannot be asynchronous. Because peer dependencies like `ollama`, `openai`, and `@anthropic-ai/sdk` are optional and dynamically imported, adapters expose `static async create(config)` methods.
2. **Structural Typing / Shims for Optional Peer Dependencies**:
   Adapters use internal structural interfaces (`OllamaClientLike`, etc.) so the package compiles cleanly without forcing consumers to install all providers.
3. **Multimodal Content Handling**:
   - OpenAI & Anthropic accept rich content blocks within the message `content` array.
   - Ollama takes plain string `content` and extracts Base64 image strings into a separate top-level `images: []` array on each message.
4. **Token Usage & Cost Transparency**:
   Token usage is tracked across both blocking calls and streaming chunks, normalized to `@orchestrai/core`'s `ModelUsage` structure, with cost computed via `estimateCost()`.
