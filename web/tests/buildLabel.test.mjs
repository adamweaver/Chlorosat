/* [AI] Purpose: Unit tests for buildLabel() (the text shown for each search
 *      result) using equivalence partitions (CS 3203 Activity 4-2, Chapter 9,
 *      Table 9.4).
 *        Correct:   a place with its parts -> "name, city, state, country"
 *                   in that order; an address puts "number street" after
 *                   the name.
 *        Incorrect: no usable parts ({} or all empty) -> "" (SearchBar then
 *                   skips the result).
 *        Boundary:  one part -> no commas; a part repeated (city named like
 *                   the place, a country's own country field) -> shown once.
 *        Edge:      street without a house number -> street alone; house
 *                   number without a street -> left out; repeats that aren't
 *                   next to each other are also removed.
 *      Context: Run from web/:  node --test tests/buildLabel.test.mjs
 *               Against the stub:  $env:SEARCH_IMPL="stub"; node --test tests/buildLabel.test.mjs
 *      Written: 2026-10-13 · Claude Opus 5.5 · requested by David */
import { test } from "node:test";
import assert from "node:assert/strict";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./buildLabel.stub.mjs"
  : "../src/lib/map/geocode.js";
const { buildLabel } = await import(impl);

// ---- Correct ----
test("correct: city, state and country in order", () => {
  assert.equal(
    buildLabel({ name: "Norman", state: "Oklahoma", country: "United States" }),
    "Norman, Oklahoma, United States",
  );
});

test("correct: an address puts 'number street' after the name", () => {
  assert.equal(
    buildLabel({
      name: "Sam Noble Museum", housenumber: "2401", street: "Chautauqua Avenue",
      city: "Norman", state: "Oklahoma", country: "United States",
    }),
    "Sam Noble Museum, 2401 Chautauqua Avenue, Norman, Oklahoma, United States",
  );
});

// ---- Incorrect ----
test("incorrect: a place with no parts gives an empty label", () => {
  assert.equal(buildLabel({}), "");
});

test("incorrect: empty or missing parts are skipped", () => {
  assert.equal(buildLabel({ name: "", city: undefined, state: null, country: "" }), "");
});

// ---- Boundary ----
test("boundary: a single part has no commas", () => {
  assert.equal(buildLabel({ name: "France" }), "France");
});

test("boundary: a part repeated right after itself is shown once", () => {
  assert.equal(buildLabel({ name: "France", country: "France" }), "France");
  assert.equal(
    buildLabel({ name: "Norman", city: "Norman", state: "Oklahoma" }),
    "Norman, Oklahoma",
  );
});

// ---- Edge ----
test("edge: street without a house number is shown alone", () => {
  assert.equal(
    buildLabel({ name: "Main Street", street: "Main Street", city: "Norman" }),
    "Main Street, Norman",
  );
});

test("edge: house number without a street is left out", () => {
  assert.equal(buildLabel({ name: "Library", housenumber: "12", city: "Norman" }), "Library, Norman");
});

test("edge: repeats that aren't next to each other are removed too", () => {
  assert.equal(
    buildLabel({ name: "Singapore", city: "Central", state: "Singapore", country: "Singapore" }),
    "Singapore, Central",
  );
});
