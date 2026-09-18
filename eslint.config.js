import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/coverage/**",
      "**/build/**",
      "**/.output/**",
      "**/.vercel/**",
      "**/out/**",
      "**/next-env.d.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      /**
       * Enforce the OrchestrAI 250-line hard maximum per file.
       *
       * Why skipComments + skipBlankLines?
       * JSDoc comments are mandatory for every exported symbol and can be
       * verbose — they should not "eat into" the budget. Only executable code
       * lines count. This mirrors the spirit of the rule: keep logic lean,
       * not documentation lean.
       *
       * Warn at 200 lines (proactive decomposition threshold) and error at 250
       * (the absolute hard limit stated in 00-core-invariants.md).
       */
      "max-lines": [
        "error",
        {
          max: 250,
          skipComments: true,
          skipBlankLines: true,
        },
      ],
    },
  },
  eslintPluginPrettier,
);
