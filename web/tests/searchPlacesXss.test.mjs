/* [AI] Purpose: Check that HTML inside place names or search text stays plain
 *      text, so it can't run as a script (CWE-79, cross-site scripting).
 *      Does:    Fakes Photon so it returns hostile place names, runs
 *               searchPlaces(), and renders each label the way SearchBar.js
 *               does (as a React text child). Checks that the markup has no
 *               live tags, that a normal name comes out unchanged (control),
 *               and that hostile search text is sent to Photon URL-encoded.
 *      Context: Same partitions as searchPlaces.test.mjs. Renders with
 *               react-dom/server instead of SearchBar.js itself, because
 *               SearchBar imports a CSS module that Node can't load. So this
 *               proves React's escaping for the label, not the component.
 *               Each test uses different text because searchPlaces caches
 *               answers for the visit.
 *      Written: 2026-11-22 · Claude Haiku 5.5 · requested by Carter */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { searchPlaces } = await import("../src/lib/map/geocode.js");

// Fake Photon: answers every request with one city called `name`.
let requests = [];
function fakePhoton(name, state = "Oklahoma") {
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    const features = [{
      type: "Feature",
      geometry: { type: "Point", coordinates: [-97.44, 35.22] },
      properties: {
        osm_type: "R", osm_id: 1, osm_key: "place", osm_value: "city",
        type: "city", name, state, country: "United States",
      },
    }];
    return { ok: true, status: 200, json: async () => ({ features }) };
  };
}

// Renders one label the same way SearchBar.js does: {place.label} in an <li>.
const renderLabel = (label) => renderToStaticMarkup(createElement("li", null, label));

const realFetch = globalThis.fetch;
beforeEach(() => { requests = []; });
afterEach(() => { globalThis.fetch = realFetch; });

// ---- Correct: a normal place name (control) ----
test("correct: normal place name renders unchanged", async () => {
  fakePhoton("Norman");
  const [first] = await searchPlaces("Norman, OK");
  assert.equal(first.label, "Norman, Oklahoma, United States");
  assert.equal(renderLabel(first.label), "<li>Norman, Oklahoma, United States</li>");
});

// ---- Incorrect: hostile place names ----
test("incorrect: <img onerror> in a place name stays text", async () => {
  const payload = "<img src=x onerror=alert(1)>";
  fakePhoton(payload);
  const [first] = await searchPlaces("Payload img");
  assert.equal(first.label, `${payload}, Oklahoma, United States`); // the data is kept as-is
  const html = renderLabel(first.label);
  assert.ok(!html.includes("<img"), `live <img> tag in: ${html}`);
  assert.ok(html.includes("&lt;img"), `expected escaped text in: ${html}`);
});

test("incorrect: quote-and-script breakout in a place name stays text", async () => {
  fakePhoton('"><script>alert(1)</script>');
  const [first] = await searchPlaces("Payload script");
  const html = renderLabel(first.label);
  assert.ok(!html.includes("<script"), `live <script> tag in: ${html}`);
  assert.ok(html.includes("&lt;script&gt;"), `expected escaped text in: ${html}`);
});

// ---- Edge: hostile search text ----
test("edge: hostile search text is URL-encoded in the Photon request", async () => {
  const typed = '"><img src=x onerror=alert(1)>';
  fakePhoton("Anything");
  await searchPlaces(typed);
  const sent = requests[0];
  assert.equal(new URL(sent).searchParams.get("q"), typed); // arrives as the query value...
  assert.ok(!sent.includes("<") && !sent.includes('"'), `raw characters in URL: ${sent}`); // ...never raw
});
