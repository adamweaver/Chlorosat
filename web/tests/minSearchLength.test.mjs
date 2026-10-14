/* [AI] Purpose: Unit tests for minSearchLength() (how many characters the
 *      search box waits for before searching) using equivalence partitions
 *      (CS 3203 Activity 4-2, Chapter 9, Table 9.4).
 *        Correct:   Latin-alphabet text -> 3; non-Latin text (Japanese,
 *                   Chinese, Korean, Cyrillic...) -> 2.
 *        Incorrect: empty, null, undefined, a number -> 3 (the safe default),
 *                   and it never throws.
 *        Boundary:  ONE non-Latin character in otherwise Latin text is
 *                   enough to switch to 2; accented Latin ("Île") stays 3.
 *        Edge:      only digits, spaces, punctuation or symbols -> 3.
 *      Context: Run from web/:  node --test tests/minSearchLength.test.mjs
 *               Against the stub (always returns 3, so the non-Latin tests fail):
 *                 $env:SEARCH_IMPL="stub"; node --test tests/minSearchLength.test.mjs
 *      Written: 2026-10-12 · Claude Opus 5.5 · requested by David */
import { test } from "node:test";
import assert from "node:assert/strict";
const impl = process.env.SEARCH_IMPL === "stub"
  ? "./searchPlaces.stub.mjs"
  : "../src/lib/map/geocode.js";
const { minSearchLength } = await import(impl);

// ---- Correct ----
test("correct: Latin text waits for 3 characters", () => {
  assert.equal(minSearchLength("Norman"), 3);
});

test("correct: non-Latin text waits for 2 characters", () => {
  assert.equal(minSearchLength("東京"), 2);   // Japanese
  assert.equal(minSearchLength("서울"), 2);   // Korean
  assert.equal(minSearchLength("Москва"), 2); // Cyrillic
});

// ---- Incorrect ----
test("incorrect: empty / missing / non-text input gives the default 3", () => {
  assert.equal(minSearchLength(""), 3);
  assert.equal(minSearchLength(null), 3);
  assert.equal(minSearchLength(undefined), 3);
  assert.equal(minSearchLength(42), 3);
});

// ---- Boundary ----
test("boundary: one non-Latin character switches to 2", () => {
  assert.equal(minSearchLength("Tokyo 東"), 2);
});

test("boundary: accented Latin letters still count as Latin", () => {
  assert.equal(minSearchLength("Île-de-France"), 3);
  assert.equal(minSearchLength("Türkiye"), 3);
});

// ---- Edge ----
test("edge: only digits, spaces, punctuation or symbols gives 3", () => {
  assert.equal(minSearchLength("123"), 3);
  assert.equal(minSearchLength("   "), 3);
  assert.equal(minSearchLength("!?,."), 3);
  assert.equal(minSearchLength("$%+"), 3);
});
