/* Feature:   PlotGivenYear · Developer: Carter Dayton
 * Unit:      selectYear(year, years) in src/lib/map/plotGivenYear.js
 *            Year validation, kept apart from plotting.
 *            Valid year -> that year as 4-digit text ("2024"). Invalid -> null.
 * Equivalence partitions (CS 3203, Chapter 9, Table 9.4):
 *   Correct:   a year the app offers (MIN_YEAR-MAX_YEAR, 2019-2026), as
 *              text or a number -> that year as text.
 *   Incorrect: a year far outside the range (1800, 3000, negative) or text
 *              that is not a year -> null.
 *   Boundary:  MIN_YEAR and MAX_YEAR -> accepted;
 *              MIN_YEAR - 1 and MAX_YEAR + 1 -> null.
 *   Edge:      null, undefined, "", {}, [], NaN, Infinity, "20244", 2024.5
 *              -> null without throwing; an in-range year with no data -> null.
 * In the test names, "rejected" means selectYear returns null.
 * Run from web/:  npm test   (only this file: node --test tests/selectYear.test.mjs)
 * Against the stub (shows failing tests):
 *   $env:SEARCH_IMPL="stub"; node --test tests/selectYear.test.mjs */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
// Expected values always come from the real year list, even in stub mode.
import { NDVI_YEARS, MIN_YEAR, MAX_YEAR } from "../src/lib/map/plotGivenYear.js";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./plotGivenYear.stub.mjs"
  : "../src/lib/map/plotGivenYear.js";
const { selectYear } = await import(impl);

// One year outside each end of the range ("2018" and "2027").
const BEFORE_FIRST = String(Number(MIN_YEAR) - 1);
const AFTER_LAST = String(Number(MAX_YEAR) + 1);

describe(`selectYear: checks the year is one the map has (${MIN_YEAR} to ${MAX_YEAR})`, () => {
  // ---- Correct ----
  test(`TC1.1 Correct: "2020" is accepted`, () => {
    assert.equal(selectYear("2020"), "2020");
  });

  // The year slider sends text, but a whole number also works. It comes back
  // as text so both forms give the same answer.
  test("TC1.2 Correct: 2020 typed as a number is accepted", () => {
    assert.equal(selectYear(2020), "2020");
  });

  test(`TC1.3 Correct: every year from ${MIN_YEAR} to ${MAX_YEAR} is accepted`, () => {
    for (const year of NDVI_YEARS) {
      assert.equal(selectYear(year), year, `"${year}" should be accepted`);
      assert.equal(selectYear(Number(year)), year, `${year} should be accepted`);
    }
  });

  // ---- Incorrect ----
  test("TC2.1 Incorrect: 1800, 3000 and -2020 are rejected", () => {
    assert.equal(selectYear(1800), null);
    assert.equal(selectYear(3000), null);
    assert.equal(selectYear(-2020), null);
  });

  test(`TC2.2 Incorrect: words like "abc" are rejected`, () => {
    assert.equal(selectYear("abc"), null);
    assert.equal(selectYear("year 2020"), null);
  });

  // ---- Boundary ----
  test(`TC3.1 Boundary: first year ${MIN_YEAR} and last year ${MAX_YEAR} are accepted`, () => {
    assert.equal(selectYear(MIN_YEAR), MIN_YEAR);
    assert.equal(selectYear(MAX_YEAR), MAX_YEAR);
  });

  test(`TC3.2 Boundary: ${BEFORE_FIRST} and ${AFTER_LAST} (one past each end) are rejected`, () => {
    assert.equal(selectYear(BEFORE_FIRST), null);
    assert.equal(selectYear(AFTER_LAST), null);
    assert.equal(selectYear(Number(BEFORE_FIRST)), null);
    assert.equal(selectYear(Number(AFTER_LAST)), null);
  });

  // ---- Edge ----
  test("TC4.1 Edge: blank, missing or non-year values are rejected without crashing", () => {
    const badInputs = [null, undefined, "", {}, [], true, NaN, Infinity];
    for (const input of badInputs) {
      assert.doesNotThrow(() => selectYear(input), `${inspect(input)} should not crash`);
      assert.equal(selectYear(input), null, `${inspect(input)} should be rejected`);
    }
  });

  test(`TC4.2 Edge: near-misses like "20244" and 2024.5 are rejected`, () => {
    assert.equal(selectYear("20244"), null);  // 5 digits
    assert.equal(selectYear(2024.5), null);   // decimal
    assert.equal(selectYear("2024.0"), null); // decimal written as text
    assert.equal(selectYear("02024"), null);  // leading zero
    assert.equal(selectYear(" 2024 "), null); // spaces around it
  });

  // A year list with a gap stands in for a data source that is missing 2020.
  test("TC4.3 Edge: a year in range that has no data is rejected", () => {
    const yearsWithGap = ["2019", "2021"];
    assert.equal(selectYear("2020", yearsWithGap), null);
    assert.equal(selectYear("2019", yearsWithGap), "2019");
  });
});
