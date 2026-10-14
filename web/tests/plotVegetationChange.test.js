// Unit 1: calculateDataChange(startNdvi, endNdvi)
// Correct: Two NDVI grids of the same size, for the start and end
// year.
// Incorrect: A grid is missing, null, not a list of numbers, or the two
// grids are different sizes.
// Boundary condition: NDVI at or below 0 (water, pavement)
// counts as 0.
// Edge case: A pixel with no data (NaN, e.g. clouds) in either year
// stays NaN



import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateDataChange } from "../src/lib/map/vegetationChange.js";
const grid = (...ndvi) => Float32Array.from(ndvi);
test("correct: gain, loss and no change", () => {
const change = calculateDataChange(grid(0.25, 0.75, 0.5), grid(0.75, 0.25, 0.5));
assert.deepEqual(change, grid(0.5, -0.5, 0));
});
test("incorrect: invalid grids", () => {
assert.equal(calculateDataChange(null, grid(0.5)), null);
assert.equal(calculateDataChange("0.5", grid(0.5)), null);
assert.equal(calculateDataChange(grid(0.5, 0.5), grid(0.5)), null);
});
test("boundary: zero floor and largest change", () => {
assert.deepEqual(calculateDataChange(grid(-0.25, 0), grid(0, 0.25)), grid(0, 0.25));
assert.deepEqual(calculateDataChange(grid(0, 1), grid(1, 0)), grid(1, -1));
});
test("edge: missing data", () => {
const change = calculateDataChange(grid(NaN, 0.5), grid(0.5, NaN));
assert.ok(Number.isNaN(change[0]) && Number.isNaN(change[1]));
});