/* Feature:   PlotGivenYear · Developer: Carter Dayton
 * Unit:      plotYearData(selectedYear) in src/lib/map/plotGivenYear.js
 *            Plotting step: the NASA layer date to draw for a year.
 *            Offered year as text ("2024") -> "2024-08-13". Anything else -> null.
 * Equivalence partitions (CS 3203, Chapter 9, Table 9.4):
 *   Correct:   an offered year as text -> its mid-August layer date.
 *   Incorrect: null (what selectYear gives back for a bad year) or text
 *              that is not an offered year -> null.
 *   Boundary:  MIN_YEAR and MAX_YEAR -> plotted;
 *              MIN_YEAR - 1 and MAX_YEAR + 1 -> null.
 *   Edge:      a number instead of text, undefined, "", {}, [], NaN
 *              -> null without throwing.
 * In the test names, "rejected" means plotYearData returns null.
 * Run from web/:  npm test   (only this file: node --test tests/plotYearData.test.mjs)
 * Against the stub (shows failing tests):
 *   $env:SEARCH_IMPL="stub"; node --test tests/plotYearData.test.mjs */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
// Expected values always come from the real year list, even in stub mode.
import { NDVI_YEARS, MIN_YEAR, MAX_YEAR } from "../src/lib/map/plotGivenYear.js";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./plotGivenYear.stub.mjs"
  : "../src/lib/map/plotGivenYear.js";
const { plotYearData } = await import(impl);

// One year outside each end of the range ("2018" and "2027").
const BEFORE_FIRST = String(Number(MIN_YEAR) - 1);
const AFTER_LAST = String(Number(MAX_YEAR) + 1);

describe("plotYearData: turns a checked year into the date of NASA's map", () => {
  // ---- Correct ----
  test(`TC1.1 Correct: "2020" gives the map dated 2020-08-13`, () => {
    assert.equal(plotYearData("2020"), "2020-08-13");
  });

  test(`TC1.2 Correct: every year from ${MIN_YEAR} to ${MAX_YEAR} gives its own map date`, () => {
    for (const year of NDVI_YEARS) {
      assert.equal(plotYearData(year), `${year}-08-13`, `"${year}" should give ${year}-08-13`);
    }
  });

  // ---- Incorrect ----
  // null is what selectYear gives back for a year it rejected.
  test("TC2.1 Incorrect: null (selectYear's answer for a bad year) is rejected", () => {
    assert.equal(plotYearData(null), null);
  });

  test(`TC2.2 Incorrect: "abc", "1800" and "3000" are rejected`, () => {
    assert.equal(plotYearData("abc"), null);
    assert.equal(plotYearData("1800"), null);
    assert.equal(plotYearData("3000"), null);
  });

  // ---- Boundary ----
  test(`TC3.1 Boundary: first year ${MIN_YEAR} and last year ${MAX_YEAR} give a map date`, () => {
    assert.equal(plotYearData(MIN_YEAR), `${MIN_YEAR}-08-13`);
    assert.equal(plotYearData(MAX_YEAR), `${MAX_YEAR}-08-13`);
  });

  test(`TC3.2 Boundary: ${BEFORE_FIRST} and ${AFTER_LAST} (one past each end) are rejected`, () => {
    assert.equal(plotYearData(BEFORE_FIRST), null);
    assert.equal(plotYearData(AFTER_LAST), null);
  });

  // ---- Edge ----
  // plotYearData only takes the text form that selectYear returns.
  // plotGivenYear turns numbers into text with selectYear first.
  test("TC4.1 Edge: 2020 as a number instead of text is rejected", () => {
    assert.equal(plotYearData(2020), null);
  });

  test("TC4.2 Edge: blank, missing or non-year values are rejected without crashing", () => {
    const badInputs = [undefined, "", {}, [], NaN];
    for (const input of badInputs) {
      assert.doesNotThrow(() => plotYearData(input), `${inspect(input)} should not crash`);
      assert.equal(plotYearData(input), null, `${inspect(input)} should be rejected`);
    }
  });
});
