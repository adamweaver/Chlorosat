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
 * Run from web/:  npm test   (only this file: node --test tests/selectYear.test.mjs)
 * Against the stub (shows failing tests):
 *   $env:SEARCH_IMPL="stub"; node --test tests/selectYear.test.mjs */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
// Expected values always come from the real year list, even in stub mode.
import { NDVI_YEARS, MIN_YEAR, MAX_YEAR } from "../src/lib/map/plotGivenYear.js";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./plotGivenYear.stub.mjs"
  : "../src/lib/map/plotGivenYear.js";
const { selectYear } = await import(impl);

// One year outside each end of the range ("2018" and "2027").
const BEFORE_FIRST = String(Number(MIN_YEAR) - 1);
const AFTER_LAST = String(Number(MAX_YEAR) + 1);

describe("selectYear", () => {
  // ---- Correct ----
  // TC1.1 (Correct): a mid-range year as text comes back as that same year
  test("correct: a valid year as text returns that year", () => {
    assert.equal(selectYear("2020"), "2020");
  });

  // TC1.2 (Correct): the slider sends text, but a whole number also works.
  // It comes back as text so both forms give the same answer.
  test("correct: a valid year as a number returns it as text", () => {
    assert.equal(selectYear(2020), "2020");
  });

  // TC1.3 (Correct): every year in the range can be selected
  test("correct: every year in the range is selectable", () => {
    for (const year of NDVI_YEARS) {
      assert.equal(selectYear(year), year, `"${year}" should be selectable`);
      assert.equal(selectYear(Number(year)), year, `${year} should be selectable`);
    }
  });

  // ---- Incorrect ----
  // TC2.1 (Incorrect): years far outside the range are rejected
  test("incorrect: a year far outside the range returns null", () => {
    assert.equal(selectYear(1800), null);
    assert.equal(selectYear(3000), null);
    assert.equal(selectYear(-2020), null);
  });

  // TC2.2 (Incorrect): text that is not a year is rejected
  test("incorrect: text that is not a year returns null", () => {
    assert.equal(selectYear("abc"), null);
    assert.equal(selectYear("year 2020"), null);
  });

  // ---- Boundary ----
  // TC3.1 (Boundary): the exact first and last years are accepted
  test("boundary: first and last years are accepted", () => {
    assert.equal(selectYear(MIN_YEAR), MIN_YEAR);
    assert.equal(selectYear(MAX_YEAR), MAX_YEAR);
  });

  // TC3.2 (Boundary): one year before and one year after are rejected
  test("boundary: one year before and after the range are rejected", () => {
    assert.equal(selectYear(BEFORE_FIRST), null);
    assert.equal(selectYear(AFTER_LAST), null);
    assert.equal(selectYear(Number(BEFORE_FIRST)), null);
    assert.equal(selectYear(Number(AFTER_LAST)), null);
  });

  // ---- Edge ----
  // TC4.1 (Edge): empty, missing and wrong-type input is rejected, no crash
  test("edge: empty, missing and wrong-type input returns null without throwing", () => {
    const badInputs = [null, undefined, "", {}, [], true, NaN, Infinity];
    for (const input of badInputs) {
      assert.doesNotThrow(() => selectYear(input));
      assert.equal(selectYear(input), null, `${String(input)} should be rejected`);
    }
  });

  // TC4.2 (Edge): values that look like a year but aren't one are rejected
  test("edge: year-like but malformed values return null", () => {
    assert.equal(selectYear("20244"), null);  // 5 digits
    assert.equal(selectYear(2024.5), null);   // decimal
    assert.equal(selectYear("2024.0"), null); // decimal written as text
    assert.equal(selectYear("02024"), null);  // leading zero
    assert.equal(selectYear(" 2024 "), null); // spaces around it
  });

  // TC4.3 (Edge): a year inside the range that has no data is rejected.
  // A year list with a gap stands in for a data source that is missing 2020.
  test("edge: an in-range year with no data returns null", () => {
    const yearsWithGap = ["2019", "2021"];
    assert.equal(selectYear("2020", yearsWithGap), null);
    assert.equal(selectYear("2019", yearsWithGap), "2019");
  });
});
