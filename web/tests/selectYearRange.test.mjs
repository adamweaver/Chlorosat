/* [AI] Purpose: Starter unit tests for selectYearRange() in
 *      src/lib/map/vegetationChange.js (PlotVegetationChange, CS-061): which
 *      two years a comparison may use. Equivalence partitions
 *      (CS 3203 Activity 4-2, Chapter 9, Table 9.4):
 *        Correct:   two offered years, earlier first -> { start, end } as text.
 *        Incorrect: years in the wrong order, the same year twice, or values
 *                   that aren't years -> null (never throws).
 *        Boundary:  the first and last offered years work; one year outside
 *                   either end does not.
 *        Edge:      a year missing from the list (no data) -> null.
 *      Context: Run from web/:  npm test   (only this file:
 *               node --test tests/selectYearRange.test.mjs).
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver */
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectYearRange } from "../src/lib/map/vegetationChange.js";
import { MIN_YEAR, MAX_YEAR } from "../src/lib/map/plotGivenYear.js";

test("correct: two offered years, earlier first", () => {
  assert.deepEqual(selectYearRange("2019", "2024"), { start: "2019", end: "2024" });
});

test("correct: whole numbers are accepted and returned as text", () => {
  assert.deepEqual(selectYearRange(2020, 2023), { start: "2020", end: "2023" });
});

test("incorrect: later year first, or the same year twice, gives null", () => {
  assert.equal(selectYearRange("2024", "2019"), null);
  assert.equal(selectYearRange("2022", "2022"), null);
});

test("incorrect: values that aren't years give null without throwing", () => {
  assert.equal(selectYearRange(null, "2024"), null);
  assert.equal(selectYearRange("2019", "abc"), null);
  assert.equal(selectYearRange({}, []), null);
  assert.equal(selectYearRange(), null);
});

test("boundary: the first and last offered years can be compared", () => {
  assert.deepEqual(selectYearRange(MIN_YEAR, MAX_YEAR), { start: MIN_YEAR, end: MAX_YEAR });
});

test("boundary: one year outside either end gives null", () => {
  assert.equal(selectYearRange(String(Number(MIN_YEAR) - 1), MAX_YEAR), null);
  assert.equal(selectYearRange(MIN_YEAR, String(Number(MAX_YEAR) + 1)), null);
});

test("edge: a year with no data (missing from the list) gives null", () => {
  const yearsWithGap = ["2019", "2020", "2022"];
  assert.equal(selectYearRange("2019", "2021", yearsWithGap), null);
  assert.deepEqual(selectYearRange("2019", "2022", yearsWithGap), { start: "2019", end: "2022" });
});
