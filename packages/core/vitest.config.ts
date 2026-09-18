/**
 * @file packages/core/vitest.config.ts
 * @description Vitest configuration for @orchestrai/core.
 *
 * Configures the `@/*` path alias to resolve against the local `src/` directory,
 * mirroring the TypeScript path mapping in tsconfig.json so test imports are
 * consistent with source imports.
 */

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      /**
       * Map `@/` to the package's `src/` directory.
       * This mirrors the `paths` entry in tsconfig.json so that
       * test files can import via `@/messages`, `@/tools`, etc.
       */
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    /** Run in Node environment (no browser APIs needed for schema tests) */
    environment: "node",
    /**
     * Include test files from the `tests/` directory following the
     * standard `*.test.ts` naming convention.
     */
    include: ["tests/**/*.test.ts"],
  },
});
