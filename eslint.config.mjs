import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Layer boundaries (ADR-011, rules R1–R7). Enforced from commit one.
// ponytail: dependency-cruiser for full acyclic-DAG checks once layer count grows;
// eslint no-restricted-imports + the R7 vitest sanity test cover R1–R7 for now.
const coreBoundary = {
  files: ["src/lib/core/**/*.{ts,tsx}"],
  rules: {
    // R5: Core engines are pure — no React/DOM.
    "no-restricted-imports": [
      "error",
      {
        paths: [
          { name: "react", message: "R5: Core engines must be pure — no React." },
          { name: "react-dom", message: "R5: Core engines must be pure — no react-dom." },
          { name: "better-sqlite3", message: "R2: Core must not touch the DB directly." },
        ],
        patterns: [
          { group: ["@/lib/db", "@/lib/db/*"], message: "R2: Core must not import the DB layer." },
          { group: ["@/components/*", "@ui/*", "@/app/*", "@editor/*", "@canvas/*"], message: "R6: Core must not import UI/Editor." },
        ],
      },
    ],
    // R5: no DOM globals inside Core.
    "no-restricted-globals": ["error", "window", "document", "localStorage", "fetch", "XMLHttpRequest"],
  },
};

// R2: components see resolved props + Runtime API only — never the DB.
const uiBoundary = {
  files: ["src/components/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          { group: ["@/lib/db", "@/lib/db/*"], message: "R2: Components must not know the DB." },
        ],
      },
    ],
  },
};

// Relax strict rules inherited from eslint-config-next for non-core files.
// These are pre-existing codebase conventions — not actively enforced as errors.
const relaxedRules = {
  // Allow `any` in DB mappers, route handlers, etc. — the DB schema is dynamic.
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-object-type": "warn",
    "react/no-unescaped-entities": "warn",
    "@next/next/no-html-link-for-pages": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    // React hooks v7 strict rules — pre-existing patterns, not actively enforced.
    "react-hooks/purity": "warn",
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/refs": "warn",
    "react-hooks/static-components": "warn",
    "react-hooks/preserve-manual-memoization": "warn",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  coreBoundary,
  uiBoundary,
  relaxedRules,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy reference files — not active source.
    "TEMPLATE-READY/**",
    // Vendor JS bundles — minified third-party scripts.
    "public/vino/**",
  ]),
]);

export default eslintConfig;
