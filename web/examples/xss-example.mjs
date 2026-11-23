/* [AI] Purpose: Show, in one short file, why React text is safe from XSS
 *      (CWE-79) and why dangerouslySetInnerHTML is not.
 *      Does:    Renders one hostile place name two ways, prints the HTML each
 *               way produces, then runs a few checks. Exit code 0 = all pass.
 *      Context: Uses the react and react-dom that web/ already installs.
 *               Run from web/ after npm ci:
 *                 node examples/xss-example.mjs
 *               Node can't run an onerror handler, so this shows the markup
 *               only. In a browser, the unsafe output would run alert(1).
 *               Lint note: react/no-danger only checks JSX, so it does not
 *               flag this createElement form. tests/unsafeHtmlSinks.test.mjs
 *               catches it by name instead. Same idea as
 *               tests/searchPlacesXss.test.mjs.
 *      Written: 2026-11-22 · Claude Haiku 5.5 · requested by Carter */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// A place name an attacker could put into a search result.
const hostileName = "<img src=x onerror=alert(1)>";
const label = `${hostileName}, Oklahoma, United States`;

// UNSAFE: the string is inserted as raw HTML, with no escaping.
const unsafe = renderToStaticMarkup(
  createElement("li", { dangerouslySetInnerHTML: { __html: label } })
);

// SAFE: the string is a text child. React escapes < > & " ' before writing it.
const safe = renderToStaticMarkup(createElement("li", null, label));

console.log("Unsafe output:", unsafe);
console.log("Safe output:  ", safe);
console.log("");

// Small check helper: prints PASS or FAIL and counts the failures.
let failures = 0;
function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures++;
}

check("unsafe render contains a live <img> tag", unsafe.includes("<img"));
check("safe render has no live <img> tag", !safe.includes("<img"));
check("safe render shows the text as escaped characters", safe.includes("&lt;img"));

// Control: a normal name should come out unchanged.
const normal = renderToStaticMarkup(createElement("li", null, "Norman, Oklahoma, United States"));
check("control: normal name renders unchanged", normal === "<li>Norman, Oklahoma, United States</li>");

process.exitCode = failures ? 1 : 0;
