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
 * In the test names, "rejected" means plotGivenYear returns null.
 * Run from web/:  npm test   (only this file: node --test tests/plotGivenYear.test.mjs)
 * Against the stub (shows failing tests):
 *   $env:SEARCH_IMPL="stub"; node --test tests/plotGivenYear.test.mjs */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
// Expected values always come from the real year list, even in stub mode.
import { NDVI_YEARS, MIN_YEAR, MAX_YEAR } from "../src/lib/map/plotGivenYear.js";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./plotGivenYear.stub.mjs"
  : "../src/lib/map/plotGivenYear.js";
const { plotGivenYear } = await import(impl);

// One year outside each end of the range ("2018" and "2027").
const BEFORE_FIRST = String(Number(MIN_YEAR) - 1);
const AFTER_LAST = String(Number(MAX_YEAR) + 1);

describe("plotGivenYear: the whole feature (year in, map date out)", () => {
  // ---- Correct ----
  // Text is what the year slider sends.
  test(`TC1.1 Correct: "2024" gives the map dated 2024-08-13`, () => {
    assert.equal(plotGivenYear("2024"), "2024-08-13");
  });

  test("TC1.2 Correct: 2022 typed as a number gives the map dated 2022-08-13", () => {
    assert.equal(plotGivenYear(2022), "2022-08-13");
  });

  test(`TC1.3 Correct: every year from ${MIN_YEAR} to ${MAX_YEAR} gives its own map date`, () => {
    for (const year of NDVI_YEARS) {
      assert.equal(plotGivenYear(year), `${year}-08-13`, `"${year}" should give ${year}-08-13`);
      assert.equal(plotGivenYear(Number(year)), `${year}-08-13`, `${year} should give ${year}-08-13`);
    }
  });

  // ---- Incorrect ----
  test("TC2.1 Incorrect: 1800, 3000 and -2024 are rejected", () => {
    assert.equal(plotGivenYear(1800), null);
    assert.equal(plotGivenYear(3000), null);
    assert.equal(plotGivenYear(-2024), null);
  });

  test(`TC2.2 Incorrect: words like "abc" are rejected`, () => {
    assert.equal(plotGivenYear("abc"), null);
  });

  // ---- Boundary ----
  test(`TC3.1 Boundary: first year ${MIN_YEAR} and last year ${MAX_YEAR} give a map date`, () => {
    assert.equal(plotGivenYear(MIN_YEAR), `${MIN_YEAR}-08-13`);
    assert.equal(plotGivenYear(MAX_YEAR), `${MAX_YEAR}-08-13`);
  });

  test(`TC3.2 Boundary: ${BEFORE_FIRST} and ${AFTER_LAST} (one past each end) are rejected`, () => {
    assert.equal(plotGivenYear(BEFORE_FIRST), null);
    assert.equal(plotGivenYear(AFTER_LAST), null);
  });

  // ---- Edge ----
  // Not throwing matters: a bad value must not crash the map.
  test("TC4.1 Edge: blank, missing or non-year values are rejected without crashing", () => {
    const badInputs = [null, undefined, "", {}, [], ["2024"], NaN, Infinity];
    for (const input of badInputs) {
      assert.doesNotThrow(() => plotGivenYear(input), `${inspect(input)} should not crash`);
      assert.equal(plotGivenYear(input), null, `${inspect(input)} should be rejected`);
    }
  });

  test(`TC4.2 Edge: near-misses like "20244" and 2024.5 are rejected`, () => {
    assert.equal(plotGivenYear("20244"), null);  // 5 digits
    assert.equal(plotGivenYear(2024.5), null);   // decimal
    assert.equal(plotGivenYear("02024"), null);  // leading zero
    assert.equal(plotGivenYear(" 2024 "), null); // spaces around it
  });
});
