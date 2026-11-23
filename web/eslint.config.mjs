import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  /* [AI] Purpose: Make dangerouslySetInnerHTML a lint error (CWE-79, XSS).
   *      Does:    Turns on react/no-danger for all linted files. The React
   *               plugin is already loaded by eslint-config-next, so this adds
   *               no dependency.
   *      Context: The site has no such uses today. The matching unit test is
   *               web/tests/unsafeHtmlSinks.test.mjs, which also covers
   *               innerHTML and document.write.
   *      Written: 2026-11-22 · Claude Haiku 5.5 · requested by Carter */
  {
    rules: {
      "react/no-danger": "error",
    },
  },
]);

export default eslintConfig;
