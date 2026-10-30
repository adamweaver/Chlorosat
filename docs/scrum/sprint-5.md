# Sprint 5 (Oct 28 → Nov 11)

> **Current sprint.** Drafted on 2026-10-30 (day 3) from the backlog, because Sprint 4 ended
> without a written plan. The team confirms the goal, owners and estimates at planning.
> Owners of tasks that had none before (CS-033, CS-034, CS-036, CS-055, CS-056, CS-063, CS-064,
> CS-065, CS-067) are proposals. Lucas claimed CS-042 in #21.

**Sprint goal** (course scrum plan, [sprint-1-plan.pdf](sprint-1-plan.pdf)): *performance testing and bug fixing.* By Nov 11, the team has agreed on the v1.0 scope (CS-001), the live site has a performance check, the known phone, keyboard and region-tool bugs are fixed, and every unit test runs on each PR (done: CS-062).
**Capacity:** ~16 hrs per member (2 weeks × ~8). Roles rotate for now (may become fixed later).
**Course deadlines:** Ticket 5 code review on Oct 30 (unit tests and README setup steps: #22, #23, #24). Ticket 4 architecture design on Nov 13, two days after this sprint (CS-042 and CS-067 bring ARCHITECTURE and UML up to date).

## Done so far (Oct 28 → 30)
✅ done · ◐ partly done ([full legend](../BACKLOG.md)).

| ID | Owner | Result | PR |
|---|---|---|---|
| CS-042 | Lucas | ◐ Draw an outline on the globe and see the average NDVI inside it for the year on screen. Fixes and docs are planned below | #21 |
| CS-057 | Carter | ✅ `plotGivenYear` split into `selectYear` + `plotYearData`, 27 unit tests, `npm test`, and docs for it | #22, #23 |
| CS-061 | Adam | ✅ First versions of `selectYearRange` and `plotDataChange`, with tests (not on the map yet). #24 also adds starter `calculateRegionStats` and `containsPoint`, now used by the region tool, for Lucas to review under CS-060 | #24 |
| CS-062 | Adam | ✅ CI runs the web unit tests on every PR, so a failing test blocks the merge | #24 |
| CS-068 | Adam | ✅ Backlog and sprint plans match the merged work; README steps let a new student clone, install and run the tests | #24 |

## Tasks
| ID | Owner | Task | Est. hrs | Done when (acceptance criteria) | Depends on |
|---|---|---|---|---|---|
| CS-001 | Lucas | **Agree on the v1.0 scope** at planning, including whether year comparison (CS-023) still fits | 1.5 | Priorities in [BACKLOG](../BACKLOG.md) agreed; the decision is recorded in this file's Review section | None |
| CS-005 | Adam | **Team discusses the architecture decisions**, including averaging in the browser (#21) | 1 | No row in [ARCHITECTURE.md#decisions](../ARCHITECTURE.md#decisions) still says "team to discuss" | Planning meeting |
| CS-036 | Adam | **Performance testing:** Lighthouse run + uptime monitor for chlorosat.com | 3 | Alerts when the site is down; Lighthouse mobile performance ≥ 90 on `/map/`, or the gaps are listed as new backlog rows | None |
| CS-023 | Adam | **Year comparison**, only if CS-001 keeps it in v1.0: gained/lost layer on the globe (built on CS-061's functions), then a 3-person usability test | 8 | Picking two years shows gained/lost vegetation with its own legend; notes from 3 testers in `docs/design/usability-1.md` | CS-001 |
| CS-042 | Lucas | **Region tool fixes:** label visible without hovering; About page and docs describe it | 4 | See [BACKLOG](../BACKLOG.md) (CS-042) | CS-005 |
| CS-060 | Lucas | **Course unit tests:** review and extend the starter tests for `calculateRegionStats` and `containsPoint` | 2 | Lucas's tests cover both region functions (correct, incorrect, boundary, edge); `npm test` passes | None |
| CS-065 | Lucas | **Bug:** the region average doesn't follow the map's data rules | 4 | City no-data areas, failed tiles and very large outlines give a value consistent with the map, or the readout says what was left out | CS-060 |
| CS-022 | Kevin | **Bug:** year and opacity controls don't work by keyboard; stats panel | 10 | Year slider, opacity slider and show/hide toggle work by keyboard (visible focus; a screen reader reads the year) and at phone width; a stats panel shows numbers for the year on screen | None |
| CS-058 | Kevin | **Course unit tests:** `buildLabel`, in his own PR | 3 | Kevin's tests cover correct, incorrect, boundary and edge cases and pass with `npm test` | None |
| CS-033 | Carter | **Testing:** check every page at 360 px and fix overlaps | 3 | No horizontal scrolling and no overlapping controls at 360 × 640 and 640 × 360, including the phone menu and the region tool while drawing | CS-042 |
| CS-055 | Carter | **Bug:** the colors aren't colorblind-safe | 6 | Low, middle and high NDVI stay clearly different with color blindness emulated (e.g. Chrome DevTools → Rendering); legend matches | None |
| CS-063 | Carter, Lucas | **Code comments:** `[AI]` blocks + headers that match the code | 1.5 | See [BACKLOG](../BACKLOG.md) (CS-063) | None |
| CS-067 | Carter | **Docs:** AGENTS.md, SETUP.md, ARCHITECTURE and UML match the repo | 3 | See [BACKLOG](../BACKLOG.md) (CS-067) | CS-062 |
| CS-034 | David | **Bug:** the map doesn't show the NDVI date | 3 | Without hovering, the map names NASA MODIS and the mid-August composite for the year on screen | None |
| CS-064 | David | **Bug:** basemap, recenter, locate and region tool can't be used by keyboard | 6 | Tab reaches each control with a visible focus ring and Enter/Space use it; the region tool can add a corner and cancel by keyboard | None |
| CS-066 | David | **Aquatic layer:** team decision, then a PR or delete the branch | 2 | Decision recorded; if kept, a PR from an up-to-date branch passes CI | Planning meeting |
| CS-056 | David | **Cleanup:** remove unused loading-badge styles | 0.5 | Styles removed; build and phone layout unchanged | None |

**Not planned this sprint.** These stay in the [backlog](../BACKLOG.md); the team can pull any of them back in at planning.
- Delayed since Sprint 1: CS-002 (Kevin, pipeline data sources) and CS-003 (David, NDVI research). Delayed since Sprint 2: CS-010 (Kevin, pipeline fetch) and CS-014 (Lucas, wireframes; its feedback part could join CS-023's usability test). None was scheduled in Sprints 3–4.
- Future pipeline, delayed since Sprint 3: CS-020 (David), CS-021 (Lucas), CS-026 (Carter).
- Should/Could features for Sprint 6 or later: CS-031, CS-032, CS-037, CS-041, CS-043, CS-044, CS-047.

## After this sprint
Sprint 6 (Nov 11 → Nov 25) is *polishing and final revisions* in the course plan and finishes v1.0 (~Nov 9–22). It is planned at this sprint's review from whatever is delayed here, plus the Should items above.

## Ceremonies
| What | When | How |
|---|---|---|
| Sprint planning | Next team meeting | Confirm this draft: goal, owners, estimates. Agree on the v1.0 scope (CS-001) and the decisions (CS-005, CS-066). |
| Standup (async) | Mon / Wed / Fri | Group chat: **Did · Doing · Blocked?** |
| Sprint review | Nov 11 | Demo the fixes on chlorosat.com. Update the backlog. Plan Sprint 6. |
| Retrospective | Nov 11 | Fill in below. |

## Definition of Done
See [_template.md](_template.md#definition-of-done-applies-to-every-task).

## Outcome
Filled in at the review (Nov 11).

## Review
- Demoed:
- v1.0 scope decisions (CS-001):
- Delayed (→ Sprint 6):

## Retrospective
| Went well | Didn't go well | Change next sprint |
|---|---|---|
| | | |
