import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import tailwindcss from "eslint-plugin-tailwindcss";
import globals from "globals";
import path from "node:path";
import tseslint from "typescript-eslint";

const rootDir = import.meta.dirname;

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
    // Scope tailwindcss rules strictly to frontend apps that contain Tailwind CSS
    ...tailwindcss.configs.recommended,
    files: ["apps/console/**/*.{ts,tsx}"],
    rules: {
      ...tailwindcss.configs.recommended.rules,
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off",
    },
    settings: {
      tailwindcss: {
        callees: ["cn", "cva"],
        cssConfigPath: path.resolve(rootDir, "apps/console/src/app/globals.css"),
      },
    },
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
       */
      "max-lines": [
        "error",
        {
          max: 250,
          skipComments: true,
          skipBlankLines: true,
        },
      ],
      /**
       * Maximum line length rule (100 characters).
       * Ignores long URLs, strings, template literals, and comments.
       */
      "max-len": [
        "warn",
        {
          code: 100,
          tabWidth: 2,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      "tailwindcss/no-custom-classname": "off",
    },
  },
  eslintPluginPrettier,
);
