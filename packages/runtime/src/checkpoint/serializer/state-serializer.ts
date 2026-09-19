/**
 * @file packages/runtime/src/checkpoint/serializer/state-serializer.ts
 * @description Type-preserving JSON state serialization and hydration utility for graph checkpointing.
 */

/**
 * Type-tagged serialization wrapper for non-standard JSON types.
 */
interface TypedDescriptor {
  readonly __type: "Date" | "Set" | "Map" | "Error" | "RegExp";
  readonly value: unknown;
}

/**
 * Type guard verifying whether a value matches the TypedDescriptor pattern.
 */
function isTypedDescriptor(val: unknown): val is TypedDescriptor {
  return (
    typeof val === "object" &&
    val !== null &&
    "__type" in val &&
    "value" in val &&
    typeof (val as { __type: unknown }).__type === "string"
  );
}

/**
 * Custom JSON replacer preserving Date, Set, Map, RegExp, and Error instances.
 */
function stateReplacer(_key: string, value: unknown): unknown {
  // Handle Date instances
  if (value instanceof Date) {
    return { __type: "Date", value: value.toISOString() };
  }

  // Handle Set collections
  if (value instanceof Set) {
    return { __type: "Set", value: Array.from(value) };
  }

  // Handle Map collections
  if (value instanceof Map) {
    return { __type: "Map", value: Array.from(value.entries()) };
  }

  // Handle RegExp patterns
  if (value instanceof RegExp) {
    return { __type: "RegExp", value: value.source };
  }

  // Handle Error instances
  if (value instanceof Error) {
    return {
      __type: "Error",
      value: {
        name: value.name,
        message: value.message,
        stack: value.stack,
      },
    };
  }

  return value;
}

/**
 * Custom JSON reviver reconstructing rich JavaScript types from TypedDescriptors.
 */
function stateReviver(_key: string, value: unknown): unknown {
  // Guard: Only process objects that conform to the TypedDescriptor format
  if (!isTypedDescriptor(value)) {
    return value;
  }

  switch (value.__type) {
    case "Date":
      return new Date(value.value as string);
    case "Set":
      return new Set(value.value as unknown[]);
    case "Map":
      return new Map(value.value as [unknown, unknown][]);
    case "RegExp":
      return new RegExp(value.value as string);
    case "Error": {
      const errData = value.value as { name: string; message: string; stack?: string };
      const err = new Error(errData.message);
      err.name = errData.name;
      if (errData.stack) {
        err.stack = errData.stack;
      }
      return err;
    }
    default:
      return value;
  }
}

/**
 * Serializes arbitrary graph state into a type-preserved JSON string.
 *
 * @param state - Arbitrary runtime state object.
 * @returns JSON formatted string.
 */
export function serializeState<TState>(state: TState): string {
  return JSON.stringify(state, stateReplacer);
}

/**
 * Deserializes a type-preserved JSON string back into a hydrated runtime state object.
 *
 * @param rawJson - The serialized JSON string.
 * @returns Hydrated typed state.
 */
export function deserializeState<TState>(rawJson: string): TState {
  return JSON.parse(rawJson, stateReviver) as TState;
}
