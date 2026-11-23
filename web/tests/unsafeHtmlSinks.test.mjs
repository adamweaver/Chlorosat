/* [AI] Purpose: Stop unsafe HTML APIs (CWE-79, cross-site scripting) from
 *      creeping into the website code.
 *      Does:    Reads every .js/.jsx/.mjs/.ts/.tsx file under web/src/ and
 *               fails if one of these appears: innerHTML, outerHTML,
 *               insertAdjacentHTML, dangerouslySetInnerHTML, document.write,
 *               setHTML, createContextualFragment, eval(, new Function(, or a
 *               javascript: URL. The failure lists each file and line.
 *      Context: React escapes text by default (see searchPlacesXss.test.mjs),
 *               so the site is safe today. This test keeps it that way: if you
 *               need one of these APIs, render the text as text instead, or
 *               escape it first. Lint rule react/no-danger does the same job
 *               for JSX (web/eslint.config.mjs). Its one blind spot: it matches
 *               names, so a name built at runtime would slip past it.
 *      Written: 2026-11-22 · Claude Haiku 5.5 · requested by Carter */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

// web/src, found from this file's own place (web/tests/ -> web/src/).
const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const CODE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);

// Each pattern is one API that can turn a string into live HTML or script.
const UNSAFE_PATTERNS = [
  /\binnerHTML\b/,
  /\bouterHTML\b/,
  /insertAdjacentHTML/,
  /dangerouslySetInnerHTML/,
  /document\.write/,
  /\bsetHTML\b/,
  /createContextualFragment/,
  /\beval\s*\(/,
  /new Function\s*\(/,
  /javascript:/i,
];

test("web/src has no unsafe HTML sinks (CWE-79)", () => {
  const problems = [];
  let filesScanned = 0;
  // Node 22 can list a whole folder tree in one call (paths are relative to SRC_DIR).
  for (const file of readdirSync(SRC_DIR, { recursive: true })) {
    if (!CODE_EXTENSIONS.has(extname(file))) continue;
    filesScanned++;
    const lines = readFileSync(join(SRC_DIR, file), "utf8").split("\n");
    lines.forEach((line, i) => {
      if (UNSAFE_PATTERNS.some((pattern) => pattern.test(line))) {
        problems.push(`${file}:${i + 1}: ${line.trim()}`);
      }
    });
  }
  // Guard against a path mistake that would scan nothing and pass anyway.
  assert.ok(filesScanned > 0, `no code files found in ${SRC_DIR}`);
  assert.deepEqual(problems, [], `Unsafe HTML API found (CWE-79):\n${problems.join("\n")}`);
});
