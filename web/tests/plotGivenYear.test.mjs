/* [AI] Purpose: Unit tests for plotGivenYear() (which NDVI layer to plot
 *      for a chosen year) using equivalence partitions (CS 3203 Activity
 *      4-2, Chapter 9, Table 9.4).
 *        Correct:   a year the app offers, as text or a number
 *                   -> "YYYY-08-13".
 *        Incorrect: not a year (text, empty, null, decimal, array)
 *                   -> null.
 *        Boundary:  2019 and 2026 (first/last) -> plotted;
 *                   2018 and 2027 (one outside) -> null.
 *        Edge:      year-like values that aren't valid: 5 digits, leading
 *                   zero, negative, spaces around it -> null.
 *      Context: Run from web/:  node --test tests/plotGivenYear.test.mjs
 *               Against the stub (shows failing tests):
 *                 $env:SEARCH_IMPL="stub"; node --test tests/plotGivenYear.test.mjs
 *      Written: 2026-10-12 · Claude Opus 5.5 · requested by David */
import { test } from "node:test";
import assert from "node:assert/strict";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./plotGivenYear.stub.mjs"
  : "../src/lib/map/plotGivenYear.js";
const { plotGivenYear } = await import(impl);

// ---- Correct ----
test("correct: year as text gives that year's mid-August layer", () => {
  assert.equal(plotGivenYear("2024"), "2024-08-13");
});

test("correct: year as a number works too", () => {
  assert.equal(plotGivenYear(2022), "2022-08-13");
});

// ---- Incorrect ----
test("incorrect: non-year text returns null", () => {
  assert.equal(plotGivenYear("abc"), null);
  assert.equal(plotGivenYear(""), null);
});

test("incorrect: null, undefined, decimal and array return null", () => {
  assert.equal(plotGivenYear(null), null);
  assert.equal(plotGivenYear(undefined), null);
  assert.equal(plotGivenYear(2024.5), null);
  assert.equal(plotGivenYear(["2024"]), null);
});

// ---- Boundary ----
test("boundary: first and last offered years are plotted", () => {
  assert.equal(plotGivenYear("2019"), "2019-08-13");
  assert.equal(plotGivenYear("2026"), "2026-08-13");
});

test("boundary: one year outside the range returns null", () => {
  assert.equal(plotGivenYear("2018"), null);
  assert.equal(plotGivenYear("2027"), null);
});

// ---- Edge ----
test("edge: year-like but malformed values return null", () => {
  assert.equal(plotGivenYear("20244"), null);
  assert.equal(plotGivenYear("02024"), null);
  assert.equal(plotGivenYear(-2024), null);
  assert.equal(plotGivenYear(" 2024 "), null);
});
