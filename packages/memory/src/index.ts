/**
 * @file packages/memory/src/index.ts
 * @description Master public API entrypoint for `@orchestrai/memory`.
 *
 * ─── Memory Architecture (Learning note for AI Engineers) ─────────
 * Memory is divided into 4 primary operational paradigms:
 * 1. Conversation: Short-term dialogue context buffer with token constraints.
 * 2. Working: Transient execution scratchpad for active agent reasoning.
 * 3. Episodic: Narrative event log of completed runs and learning reflections.
 * 4. Semantic: Long-term vector retrieval over facts, preferences, and knowledge.
 *
 * All memory operations are governed by relevance filtering, privacy
 * sanitization (redaction), and TTL-based retention policies.
 * ───────────────────────────────────────────────────────────────────
 */

export * from "./contracts";
export * from "./storage";
export * from "./conversation";
export * from "./working";
export * from "./episodic";
export * from "./semantic";
export * from "./lifecycle";
export * from "./manager";
