/* [AI] Purpose: Starter unit tests for the region math added to
 *      src/lib/region.js (SelectedRegionStats, CS-060): calculateRegionStats,
 *      containsPoint, and the bounding box buildBoundedRegions now returns.
 *      Same equivalence-partition style as buildBoundedRegions.test.mjs
 *      (CS 3203 Activity 4-2, Chapter 9, Table 9.4):
 *        Correct:   real NDVI values -> mean, min, max, count; a spot inside
 *                   or outside an outline.
 *        Incorrect: no list, text or a number instead of a list -> null; a
 *                   missing region or a non-number spot -> false. Never throws.
 *        Boundary:  one value; no usable values; a point that isn't a number.
 *        Edge:      NaN / Infinity / non-numbers are skipped; NDVI at or below
 *                   0 is kept; an outline across the date line.
 *      Context: Run from web/:  npm test   (only this file:
 *               node --test tests/calculateRegionStats.test.mjs). Lucas owns
 *               this unit and should review and extend these tests.
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBoundedRegions, calculateRegionStats, containsPoint } from "../src/lib/region.js";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} should be about ${expected}`);
const square = [
  { lat: 0, lng: 0 }, { lat: 0, lng: 10 },
  { lat: 10, lng: 10 }, { lat: 10, lng: 0 },
];

// ---- calculateRegionStats ----
test("correct: stats for a list of NDVI values", () => {
  const stats = calculateRegionStats([0.2, 0.4, 0.6]);
  close(stats.mean, 0.4);
  assert.equal(stats.min, 0.2);
  assert.equal(stats.max, 0.6);
  assert.equal(stats.count, 3);
});

test("correct: works on a Float32Array (the engine's tile format)", () => {
  const stats = calculateRegionStats(Float32Array.from([0.25, 0.75]));
  close(stats.mean, 0.5);
  assert.equal(stats.count, 2);
});

test("incorrect: not a list gives null and does not throw", () => {
  assert.equal(calculateRegionStats(null), null);
  assert.equal(calculateRegionStats(undefined), null);
  assert.equal(calculateRegionStats("0.5"), null);
  assert.equal(calculateRegionStats(42), null);
  assert.equal(calculateRegionStats({}), null);
});

test("boundary: one value is its own mean, min and max", () => {
  assert.deepEqual(calculateRegionStats([0.3]), { mean: 0.3, min: 0.3, max: 0.3, count: 1 });
});

test("boundary: an empty list or only missing data gives null", () => {
  assert.equal(calculateRegionStats([]), null);
  assert.equal(calculateRegionStats([NaN, NaN]), null);
});

test("edge: NaN, Infinity and non-numbers are skipped as missing data", () => {
  const stats = calculateRegionStats([0.5, NaN, Infinity, "0.9", null, 0.3]);
  close(stats.mean, 0.4);
  assert.equal(stats.count, 2);
});

test("edge: NDVI at or below 0 (water, pavement) is kept as it is", () => {
  const stats = calculateRegionStats([-0.2, 0, 0.2]);
  close(stats.mean, 0);
  assert.equal(stats.min, -0.2);
  assert.equal(stats.count, 3);
});

// ---- containsPoint ----
test("correct: a spot inside the outline is inside; one outside is not", () => {
  const region = buildBoundedRegions(square);
  assert.equal(containsPoint(region, 5, 5), true);
  assert.equal(containsPoint(region, 5, 15), false);
  assert.equal(containsPoint(region, -5, 5), false);
});

test("incorrect: a missing region or a non-number spot is never inside", () => {
  const region = buildBoundedRegions(square);
  assert.equal(containsPoint(null, 5, 5), false);
  assert.equal(containsPoint(region, NaN, 5), false);
  assert.equal(containsPoint(region, "5", 5), false);
});

test("edge: an outline across the date line contains both sides of it", () => {
  const region = buildBoundedRegions([
    { lat: -10, lng: 170 }, { lat: -10, lng: -170 },
    { lat: 10, lng: -170 }, { lat: 10, lng: 170 },
  ]);
  assert.equal(region.crossesDateline, true);
  assert.equal(containsPoint(region, 0, 179), true);
  assert.equal(containsPoint(region, 0, -179), true);
  assert.equal(containsPoint(region, 0, 0), false);
});

// ---- buildBoundedRegions: the region it returns ----
test("correct: the region has a bounding box around its corners", () => {
  const region = buildBoundedRegions(square);
  assert.deepEqual(region.bbox, { west: 0, south: 0, east: 10, north: 10 });
  assert.equal(region.crossesDateline, false);
  assert.deepEqual(region.points, square);
});

test("boundary: a corner that isn't a pair of numbers throws", () => {
  assert.throws(() => buildBoundedRegions([...square, { lat: "5", lng: 5 }]));
  assert.throws(() => buildBoundedRegions([...square, { lat: NaN, lng: 5 }]));
  assert.throws(() => buildBoundedRegions([...square, null]));
});
