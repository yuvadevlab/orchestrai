/**
 * @file packages/events/src/lock/index.ts
 * @description Distributed lock surface exports.
 */

// LockOptions schema and type definitions
export * from "./lock-options.schema";

// IDistributedLock interface and LockHandle
export * from "./distributed-lock.interface";

// Memory-backed distributed lock implementation
export * from "./memory-distributed-lock";

// Redis-backed distributed lock implementation with Lua scripts
export * from "./redis-distributed-lock";
