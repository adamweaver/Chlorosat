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
 * Run from web/:  npm test   (only this file: node --test tests/plotYearData.test.mjs)
 * Against the stub (shows failing tests):
 *   $env:SEARCH_IMPL="stub"; node --test tests/plotYearData.test.mjs */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
// Expected values always come from the real year list, even in stub mode.
import { NDVI_YEARS, MIN_YEAR, MAX_YEAR } from "../src/lib/map/plotGivenYear.js";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./plotGivenYear.stub.mjs"
  : "../src/lib/map/plotGivenYear.js";
const { plotYearData } = await import(impl);

// One year outside each end of the range ("2018" and "2027").
const BEFORE_FIRST = String(Number(MIN_YEAR) - 1);
const AFTER_LAST = String(Number(MAX_YEAR) + 1);

describe("plotYearData", () => {
  // ---- Correct ----
  // TC1.1 (Correct): a mid-range year gives that year's mid-August layer
  test("correct: a valid year gives that year's layer date", () => {
    assert.equal(plotYearData("2020"), "2020-08-13");
  });

  // TC1.2 (Correct): every offered year gives a date in that same year
  test("correct: every year in the range gives its own layer date", () => {
    for (const year of NDVI_YEARS) {
      assert.equal(plotYearData(year), `${year}-08-13`);
    }
  });

  // ---- Incorrect ----
  // TC2.1 (Incorrect): null (selectYear rejected the year) plots nothing
  test("incorrect: null from selectYear returns null", () => {
    assert.equal(plotYearData(null), null);
  });

  // TC2.2 (Incorrect): text that is not an offered year plots nothing
  test("incorrect: text that is not an offered year returns null", () => {
    assert.equal(plotYearData("abc"), null);
    assert.equal(plotYearData("1800"), null);
    assert.equal(plotYearData("3000"), null);
  });

  // ---- Boundary ----
  // TC3.1 (Boundary): the exact first and last years are plotted
  test("boundary: first and last years are plotted", () => {
    assert.equal(plotYearData(MIN_YEAR), `${MIN_YEAR}-08-13`);
    assert.equal(plotYearData(MAX_YEAR), `${MAX_YEAR}-08-13`);
  });

  // TC3.2 (Boundary): one year before and one year after plot nothing
  test("boundary: one year before and after the range return null", () => {
    assert.equal(plotYearData(BEFORE_FIRST), null);
    assert.equal(plotYearData(AFTER_LAST), null);
  });

  // ---- Edge ----
  // TC4.1 (Edge): plotYearData only takes the text form that selectYear
  // returns. plotGivenYear turns numbers into text with selectYear first.
  test("edge: a year as a number (not text) returns null", () => {
    assert.equal(plotYearData(2020), null);
  });

  // TC4.2 (Edge): empty, missing and wrong-type input is rejected, no crash
  test("edge: empty, missing and wrong-type input returns null without throwing", () => {
    const badInputs = [undefined, "", {}, [], NaN];
    for (const input of badInputs) {
      assert.doesNotThrow(() => plotYearData(input));
      assert.equal(plotYearData(input), null, `${String(input)} should be rejected`);
    }
  });
});
