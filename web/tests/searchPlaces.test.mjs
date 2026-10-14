/* [AI] Purpose: Unit tests for searchPlaces() (place search, CS-030) using
 *      equivalence partitions (CS 3203 Activity 4-2, Chapter 9, Table 9.4).
 *      Does:    Replaces fetch with a fake Photon so no network is used, then
 *               checks one input from each partition:
 *        Correct:   text is a place name of 3+ characters -> up to 5 places,
 *                   each { id, label, lng, lat }.
 *        Incorrect: empty, whitespace-only, null or non-text input -> [] and
 *                   Photon is never called.
 *        Boundary:  2 Latin characters -> [] (too short); 3 characters ->
 *                   searched. 2 non-Latin characters ("東京") -> searched.
 *        Edge:      text longer than 200 characters is cut to 200 before it
 *                   is sent; Photon returning 10 matches -> only 5 kept.
 *      Context: Run from web/:  node --test tests/
 *               Against the stub (shows failing tests):
 *                 SEARCH_IMPL=stub node --test tests/      (PowerShell:
 *                 $env:SEARCH_IMPL="stub"; node --test tests/)
 *               Each test uses different text because searchPlaces caches
 *               answers per text for the visit.
 *      Written: 2026-10-12 · Claude Opus 5.5 · requested by David */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

const impl = process.env.SEARCH_IMPL === "stub"
  ? "./searchPlaces.stub.mjs"
  : "../src/lib/map/geocode.js";
const { searchPlaces } = await import(impl);

// Fake Photon: answers every request with `count` cities called `name`.
let requests = [];
function fakePhoton(name, count = 1) {
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    const features = Array.from({ length: count }, (_, i) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [-97.44 + i, 35.22] },
      properties: {
        osm_type: "R", osm_id: 1000 + i, osm_key: "place", osm_value: "city",
        type: "city", name, state: `State ${i}`, country: "United States",
      },
    }));
    return { ok: true, status: 200, json: async () => ({ features }) };
  };
}

// The text Photon was asked for, from the request URL's q= parameter.
const sentQuery = (url) => new URL(url).searchParams.get("q");

const realFetch = globalThis.fetch;
beforeEach(() => { requests = []; });
afterEach(() => { globalThis.fetch = realFetch; });

// ---- Correct: a valid place name ----
test("correct: valid place name returns matching places", async () => {
  fakePhoton("Norman");
  const results = await searchPlaces("Norman");
  assert.ok(results.length >= 1);
  assert.equal(results[0].label, "Norman, State 0, United States");
  assert.equal(typeof results[0].lng, "number");
  assert.equal(typeof results[0].lat, "number");
});

// ---- Incorrect: not a usable search ----
test("incorrect: empty text returns [] without calling Photon", async () => {
  fakePhoton("Unused");
  assert.deepEqual(await searchPlaces(""), []);
  assert.equal(requests.length, 0);
});

test("incorrect: whitespace-only text returns []", async () => {
  fakePhoton("Unused");
  assert.deepEqual(await searchPlaces("     "), []);
  assert.equal(requests.length, 0);
});

test("incorrect: null / non-text input returns [] and does not throw", async () => {
  fakePhoton("Unused");
  assert.deepEqual(await searchPlaces(null), []);
  assert.deepEqual(await searchPlaces(undefined), []);
  assert.deepEqual(await searchPlaces(42), []);
  assert.equal(requests.length, 0);
});

// ---- Boundary: minimum length ----
test("boundary: 2 Latin characters is too short (not searched)", async () => {
  fakePhoton("Ok");
  assert.deepEqual(await searchPlaces("Ok"), []);
  assert.equal(requests.length, 0);
});

test("boundary: 3 characters is the minimum that is searched", async () => {
  fakePhoton("Ada");
  const results = await searchPlaces("Ada");
  assert.ok(requests.length >= 1);
  assert.equal(results[0].label, "Ada, State 0, United States");
});

test("boundary: 2 non-Latin characters are searched", async () => {
  fakePhoton("東京");
  const results = await searchPlaces("東京");
  assert.ok(requests.length >= 1);
  assert.ok(results.length >= 1);
});

// ---- Edge: too long, too many ----
test("edge: text longer than 200 characters is cut to 200", async () => {
  fakePhoton("Unused");
  await searchPlaces("a".repeat(201));
  assert.ok(requests.length >= 1);
  assert.equal(sentQuery(requests[0]).length, 200);
});

test("edge: at most 5 results even when Photon returns 10", async () => {
  fakePhoton("Springfield", 10);
  const results = await searchPlaces("Springfield");
  assert.equal(results.length, 5);
});
