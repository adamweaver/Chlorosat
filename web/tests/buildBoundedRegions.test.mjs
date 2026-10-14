/* [AI] Purpose: Unit tests for buildBoundedRegions() using equivalence
 *      partitions (CS 3203 Activity 4-2, Chapter 9, Table 9.4).
 *        Correct:   an array of 3 or more valid points builds a region.
 *        Incorrect: empty or null points return null and do not throw.
 *        Boundary:  2 points are too few; 3 is the minimum accepted.
 *        Edge:      out-of-range latitude or longitude throws an error.
 *      Context: Run from web/:  node --test tests/buildBoundedRegions.test.mjs
 *               Implementation under test: ../src/lib/region.js
 *      Written: 2026-10-14 · Composer · requested by Lucas */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBoundedRegions } from "../src/lib/region.js";

const square = [
  { lat: 0, lng: 0 }, { lat: 0, lng: 10 },
  { lat: 10, lng: 10 }, { lat: 10, lng: 0 },
];

// TC1 (Correct): an array of 3 or more valid points builds a region
test("correct: build region from valid points", () => {
  const result = buildBoundedRegions(square);
  assert.ok(result !== undefined && result !== null);
});

// TC2 (Incorrect): empty or null points return null and do not throw
test("incorrect: empty points", () => {
  assert.doesNotThrow(() => buildBoundedRegions([]));
  assert.equal(buildBoundedRegions([]), null);
});

test("incorrect: null points", () => {
  assert.doesNotThrow(() => buildBoundedRegions(null));
  assert.equal(buildBoundedRegions(null), null);
});

// TC3 (Boundary): 2 points are too few, 3 is the minimum
test("boundary: 2 points rejected, 3 points accepted", () => {
  assert.equal(buildBoundedRegions(square.slice(0, 2)), null);
  assert.ok(buildBoundedRegions(square.slice(0, 3)) != null);
});

// TC4 (Edge): out of range coordinates throw an error
test("edge: latitude out of range", () => {
  assert.throws(() => buildBoundedRegions([...square, { lat: 95, lng: 5 }]));
});

test("edge: longitude out of range", () => {
  assert.throws(() => buildBoundedRegions([...square, { lat: 5, lng: 200 }]));
});
