/* Feature:   PlotGivenYear · Developer: Carter Dayton
 * Unit:      plotGivenYear(year) in src/lib/map/plotGivenYear.js
 *            Checks the year (selectYear), then picks its layer (plotYearData).
 *            Used by setYear() in the globe engine.
 *            Valid year -> "YYYY-08-13". Invalid year -> null.
 * Equivalence partitions (CS 3203, Chapter 9, Table 9.4):
 *   Correct:   a year the app offers (MIN_YEAR-MAX_YEAR, 2019-2026), as
 *              text or a number -> "YYYY-08-13" for that year.
 *   Incorrect: a year far outside the range (1800, 3000, negative) or text
 *              that is not a year -> null.
 *   Boundary:  MIN_YEAR and MAX_YEAR -> plotted;
 *              MIN_YEAR - 1 and MAX_YEAR + 1 -> null.
 *   Edge:      null, undefined, "", {}, [], ["2024"], NaN, Infinity, "20244",
 *              2024.5 -> null without throwing. (An in-range year with no
 *              data is tested in selectYear.test.mjs.)
 * Run from web/:  npm test   (only this file: node --test tests/plotGivenYear.test.mjs)
 * Against the stub (shows failing tests):
 *   $env:SEARCH_IMPL="stub"; node --test tests/plotGivenYear.test.mjs */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
// Expected values always come from the real year list, even in stub mode.
import { NDVI_YEARS, MIN_YEAR, MAX_YEAR } from "../src/lib/map/plotGivenYear.js";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./plotGivenYear.stub.mjs"
  : "../src/lib/map/plotGivenYear.js";
const { plotGivenYear } = await import(impl);

// One year outside each end of the range ("2018" and "2027").
const BEFORE_FIRST = String(Number(MIN_YEAR) - 1);
const AFTER_LAST = String(Number(MAX_YEAR) + 1);

describe("plotGivenYear", () => {
  // ---- Correct ----
  // TC1.1 (Correct): year as text, which is what the year slider sends
  test("correct: year as text gives that year's mid-August layer", () => {
    assert.equal(plotGivenYear("2024"), "2024-08-13");
  });

  // TC1.2 (Correct): year as a whole number gives the same answer
  test("correct: year as a number works too", () => {
    assert.equal(plotGivenYear(2022), "2022-08-13");
  });

  // TC1.3 (Correct): every offered year plots a layer from that same year
  test("correct: every year in the range plots its own layer", () => {
    for (const year of NDVI_YEARS) {
      assert.equal(plotGivenYear(year), `${year}-08-13`);
      assert.equal(plotGivenYear(Number(year)), `${year}-08-13`);
    }
  });

  // ---- Incorrect ----
  // TC2.1 (Incorrect): years far outside the range plot nothing
  test("incorrect: a year far outside the range returns null", () => {
    assert.equal(plotGivenYear(1800), null);
    assert.equal(plotGivenYear(3000), null);
    assert.equal(plotGivenYear(-2024), null);
  });

  // TC2.2 (Incorrect): text that is not a year plots nothing
  test("incorrect: non-year text returns null", () => {
    assert.equal(plotGivenYear("abc"), null);
  });

  // ---- Boundary ----
  // TC3.1 (Boundary): the exact first and last years are plotted
  test("boundary: first and last offered years are plotted", () => {
    assert.equal(plotGivenYear(MIN_YEAR), `${MIN_YEAR}-08-13`);
    assert.equal(plotGivenYear(MAX_YEAR), `${MAX_YEAR}-08-13`);
  });

  // TC3.2 (Boundary): one year before and one year after plot nothing
  test("boundary: one year outside the range returns null", () => {
    assert.equal(plotGivenYear(BEFORE_FIRST), null);
    assert.equal(plotGivenYear(AFTER_LAST), null);
  });

  // ---- Edge ----
  // TC4.1 (Edge): empty, missing and wrong-type input plots nothing and does
  // not throw, so a bad value can't crash the map
  test("edge: empty, missing and wrong-type input returns null without throwing", () => {
    const badInputs = [null, undefined, "", {}, [], ["2024"], NaN, Infinity];
    for (const input of badInputs) {
      assert.doesNotThrow(() => plotGivenYear(input));
      assert.equal(plotGivenYear(input), null, `${String(input)} should be rejected`);
    }
  });

  // TC4.2 (Edge): values that look like a year but aren't one plot nothing
  test("edge: year-like but malformed values return null", () => {
    assert.equal(plotGivenYear("20244"), null);  // 5 digits
    assert.equal(plotGivenYear(2024.5), null);   // decimal
    assert.equal(plotGivenYear("02024"), null);  // leading zero
    assert.equal(plotGivenYear(" 2024 "), null); // spaces around it
  });
});
