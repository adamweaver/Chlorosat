/* [AI] Purpose: Starter unit tests for plotDataChange() and changeClass() in
 *      src/lib/map/vegetationChange.js (PlotVegetationChange, CS-061): turning
 *      vegetation change into colored pixels. Equivalence partitions
 *      (CS 3203 Activity 4-2, Chapter 9, Table 9.4):
 *        Correct:   gain, loss and no change -> teal, brown, transparent
 *                   (4 numbers per pixel: red, green, blue, alpha).
 *        Incorrect: not a grid of numbers -> null.
 *        Boundary:  +0.1 counts as gained; -0.1 is still "about the same"
 *                   (same edges as the pipeline's changeClasses).
 *        Edge:      no data (NaN) -> transparent; an empty grid -> no pixels;
 *                   the output of calculateDataChange plots directly.
 *      Context: Run from web/:  npm test   (only this file:
 *               node --test tests/plotDataChange.test.mjs).
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateDataChange, changeClass, plotDataChange, CHANGE_CLASSES } from "../src/lib/map/vegetationChange.js";

const GAINED = [...CHANGE_CLASSES.gained.color, 255];
const LOST = [...CHANGE_CLASSES.lost.color, 255];
const CLEAR = [0, 0, 0, 0];
// The 4 numbers for pixel i.
const pixel = (pixels, i) => Array.from(pixels.slice(i * 4, i * 4 + 4));

test("correct: gain is teal, loss is brown, no change is transparent", () => {
  const pixels = plotDataChange([0.5, -0.5, 0]);
  assert.ok(pixels instanceof Uint8ClampedArray);
  assert.equal(pixels.length, 12);
  assert.deepEqual(pixel(pixels, 0), GAINED);
  assert.deepEqual(pixel(pixels, 1), LOST);
  assert.deepEqual(pixel(pixels, 2), CLEAR);
});

test("incorrect: input that isn't a grid of numbers gives null", () => {
  assert.equal(plotDataChange(null), null);
  assert.equal(plotDataChange("0.5"), null);
  assert.equal(plotDataChange([0.5, "a"]), null);
});

test("boundary: +0.1 counts as gained, -0.1 is still about the same", () => {
  assert.equal(changeClass(0.1), "gained");
  assert.equal(changeClass(0.0999), "stable");
  assert.equal(changeClass(-0.1), "stable");
  assert.equal(changeClass(-0.1001), "lost");
  const pixels = plotDataChange([0.1, -0.1, -0.1001]);
  assert.deepEqual(pixel(pixels, 0), GAINED);
  assert.deepEqual(pixel(pixels, 1), CLEAR);
  assert.deepEqual(pixel(pixels, 2), LOST);
});

test("edge: no data (NaN) is transparent and has no class", () => {
  assert.equal(changeClass(NaN), null);
  assert.deepEqual(pixel(plotDataChange([NaN]), 0), CLEAR);
});

test("edge: an empty grid gives no pixels", () => {
  assert.equal(plotDataChange([]).length, 0);
});

test("edge: the output of calculateDataChange plots directly", () => {
  const change = calculateDataChange(Float32Array.from([0.2, 0.8]), Float32Array.from([0.8, 0.2]));
  const pixels = plotDataChange(change);
  assert.deepEqual(pixel(pixels, 0), GAINED);
  assert.deepEqual(pixel(pixels, 1), LOST);
});
