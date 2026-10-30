# Sprint 4 (historical: Oct 14 → Oct 28)

> No detailed plan was written when this sprint started, so this file was recorded afterwards
> (2026-10-30) from the merged PRs. Its tasks are the ones delayed from Sprint 3, plus the course
> unit-test activity. Current status of every task: [BACKLOG.md](../BACKLOG.md).

**Sprint goal** (course scrum plan, [sprint-1-plan.pdf](sprint-1-plan.pdf)): *refine features and code review.* In practice, the team wrote unit tests for the course code review (Activity 4-2), most of them committed by David on Oct 14 (#18), and the tasks delayed from Sprint 3 waited.
**Capacity:** ~16 hrs per member (2 weeks × ~8). Roles rotate for now (may become fixed later).

## Tasks
No estimates were made.

**Delayed from Sprint 3** (acceptance criteria as they stood then; current ones are in the [backlog](../BACKLOG.md))

| ID | Owner | Task | Est. hrs | Done when (acceptance criteria) | Depends on |
|---|---|---|---|---|---|
| CS-020 | David | **Pipeline:** cloud-masked seasonal composites + multi-year `run` command | — | `run --region okc-norman --years 2019-2025` writes one layer + stats per year | CS-010 |
| CS-021 | Lucas | **Pipeline:** yearly stats + change maps | — | Stats/change output with tests on tiny hand-made arrays | CS-011 |
| CS-022 | Kevin | **Web:** map controls + stats panel | — | Year, legend and opacity controls work by keyboard and at phone width; a stats panel shows numbers for the year on screen | None |
| CS-023 | Adam | **Web:** compare two years, About page check, usability test | — | Two years can be compared on the globe; About page checked by a non-technical person; notes from 3 testers in `docs/design/usability-1.md` | None |
| CS-026 | Carter | **Visible-light method:** implementation | — | Tests pass; index choice approved by the team; 3–5 real spots where it disagrees with NDVI written up | CS-010 |

**Course unit tests** (Activity 4-2: each member tests one feature's functions with correct, incorrect, boundary and edge inputs)

| ID | Owner | Task | Est. hrs | Done when (acceptance criteria) | Depends on |
|---|---|---|---|---|---|
| CS-057 | Carter | PlotGivenYear: `selectYear`, `plotYearData` | — | Tests for each partition pass | None |
| CS-058 | Kevin | SearchResultLabel: `buildLabel` | — | Tests for each partition pass | None |
| CS-059 | David | PlaceSearch: `searchPlaces`, `minSearchLength` | — | Tests for each partition pass | None |
| CS-060 | Lucas | SelectedRegionStats: `buildBoundedRegions`, `calculateRegionStats` | — | Tests for each partition pass | None |
| CS-061 | Adam | PlotVegetationChange: `selectYearRange`, `calculateDataChange`, `plotDataChange` | — | Tests for each partition pass | None |

## Ceremonies
| What | When | How |
|---|---|---|
| Sprint planning | Oct 14 | No detailed plan was written (this file was recorded afterwards). |
| Standup (async) | Mon / Wed / Fri | Group chat: **Did · Doing · Blocked?** |
| Sprint review | Oct 28 | Demo what works. Update backlog. |
| Retrospective | Oct 28 | Fill in below. |

## Definition of Done
See [_template.md](_template.md#definition-of-done-applies-to-every-task).

## Outcome (recorded 2026-10-30)
✅ done · ○ not started · ⏸ delayed: planned for this sprint, not finished, carried over (what got done is noted; see Review for where each went).
#18 merged on Oct 14, the first day of this sprint (and Sprint 3's review day), so it counts here.

**Delayed from Sprint 3**

| ID | Owner | Result | PR |
|---|---|---|---|
| CS-020 | David | ⏸ Delayed: not started | |
| CS-021 | Lucas | ⏸ Delayed: not started | |
| CS-022 | Kevin | ⏸ Delayed: not started | |
| CS-023 | Adam | ⏸ Delayed: the change math is written and tested (`calculateDataChange`, CS-061) but not on the globe; About page check and usability test not done | #18 |
| CS-026 | Carter | ⏸ Delayed: implementation not started | |

**Course unit tests**

| ID | Owner | Result | PR |
|---|---|---|---|
| CS-057 | Carter | ⏸ Delayed: a first `plotGivenYear` with tests was committed by David; Carter's own version landed in Sprint 5 (#22) | #18 |
| CS-058 | Kevin | ⏸ Delayed: `buildLabel` tests exist (9 pass), but David wrote and committed them | #18 |
| CS-059 | David | ✅ Done: 15 tests, with the search service faked (no network). Also 7 pipeline tests for the NDVI class colors | #18 |
| CS-060 | Lucas | ⏸ Delayed: `buildBoundedRegions` + 6 tests done; `calculateRegionStats` not written | #18 |
| CS-061 | Adam | ⏸ Delayed: `calculateDataChange` + 4 tests done (David committed the test cases); `selectYearRange` and `plotDataChange` not written | #18 |

**Unplanned work this sprint**

| ID | Owner | Result | PR |
|---|---|---|---|
| CS-035 | David | ✅ Fix: the vegetation layer loads at the 100% the opacity slider shows (it was 70%). #19, a first try, was closed unmerged | #20 |
| CS-066 | David | ○ Started (unplanned): an Aquatic (algae / chlorophyll) layer on the draft branch `feature/algae-bloom` (Oct 14); no PR yet | |

## Review
- Demoed:
- Delayed (→ [Sprint 5](sprint-5.md)): CS-022, CS-023, CS-057, CS-058, CS-060, CS-061 (see Outcome above)
- Delayed, not scheduled in Sprint 5 (they stay in the [backlog](../BACKLOG.md)): CS-020, CS-021, CS-026

## Retrospective
| Went well | Didn't go well | Change next sprint |
|---|---|---|
| | | |
