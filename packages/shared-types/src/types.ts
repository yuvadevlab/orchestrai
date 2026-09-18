/**
 * @file packages/shared-types/src/types.ts
 * @description Universal TypeScript utility contracts, pagination shapes, and result containers.
 */

/**
 * Standard pagination query options for collection endpoints.
 */
export interface PaginationOptions {
  readonly page?: number;
  readonly limit?: number;
  readonly cursor?: string;
}

/**
 * Standard paginated response envelope.
 */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

/**
 * Success result container wrapping payload value.
 */
export interface OkResult<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * Error result container wrapping diagnostic message and code.
 */
export interface ErrResult<E = string> {
  readonly success: false;
  readonly error: E;
  readonly code?: string;
}

/**
 * Discriminated result container representing either success or failure without throwing.
 */
export type Result<T, E = string> = OkResult<T> | ErrResult<E>;

/**
 * Deeply immutable type utility.
 *
 * Recursion stops at three leaves:
 *  - Arrays → `ReadonlyArray` of deeply-frozen elements
 *  - Callables → returned as-is (functions have no data fields to freeze)
 *  - Primitives → returned as-is
 * Everything else gets all keys wrapped in `readonly`.
 */
export type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : // Callables pass through unchanged — explicitly typed to satisfy @typescript-eslint/ban-types
    T extends (...args: unknown[]) => unknown
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;
