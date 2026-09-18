import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    },
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: "es2022",
  outDir: "dist",
  /** Use the build-specific tsconfig that locks rootDir to src/ */
  tsconfig: "tsconfig.build.json",
});
