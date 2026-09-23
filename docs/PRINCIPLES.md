# Goals & Principles

## Mission
Make local vegetation health easy to **see, compare, and understand** for people who are not GIS experts.

## Audiences
| Who | What they need from Chlorosat |
|---|---|
| Policymakers | Area-level stats and change over time, to support decisions (parks, tree planting, zoning). |
| Environmental activists | Clear, shareable visuals of green loss or gain. |
| Environmental scientists | Transparency: data source, dates, resolution, method. |
| Homebuyers | A simple "how green is this neighborhood, and is it changing?" |

## Goals
Week numbers assume **week 5 = Sep 21–27** (correct this if the class counts differently).

| When | Goal |
|---|---|
| Week 6 (Sep 30, end of Sprint 2) | **Bare-bones version:** one year of real NDVI on the map (locally); placeholder site live over HTTPS. |
| Week 7 (~Oct 7, mid-Sprint 3) | **Somewhat usable & live:** multiple years + year picker + legend on the real domain. |
| Week 8 (Oct 14, end of Sprint 3) | **v0.1:** + visible-light method, year comparison, basic stats, auto-deploy on every merge. |
| Week 12–13 (~Nov 9–22) | **v1.0 complete:** polished, tested, documented, performant. |

## Non-goals (for now)
- User accounts, logins, saved data.
- Real-time or on-demand satellite processing on the server.
- Worldwide coverage out of the box (the design supports it; we only process our region).
- Professional GIS tooling (raw downloads, band math UI).

## Principles

### 1. Plain language first
- Say "greenness" or "vegetation health" before "NDVI". Explain terms where they appear.
- Every map color has a legend with words, not just numbers.
- Method names are plain too: "Infrared" and "Visible light", with a one-line explanation each.

### 2. Light & fast (small VPS: 1 core, 4 GB RAM, shared with Adam's personal site)
- **The server does no computing.** It only serves pre-built files. All heavy work happens in the pipeline, on laptops.
- Budgets: JS < ~300 KB gzipped on first load; each overlay PNG < ~2 MB; page usable in < 3 s on average mobile.
- Load data only when needed (e.g. a year's PNG when that year is picked).

### 3. Accessible
- Map color scales must be **colorblind-friendly** (e.g. brown → teal, not red → green).
- Text contrast meets WCAG AA. Controls work with a keyboard. Layout works on phones.

### Design
**Restrained branding:**
- Brand greens (`#15503a`, `#2e9e63`, `#56c27f`, `#a8e0be`) are **accents only**: header, buttons, links, focus rings.
- Backgrounds and text are neutral (white/near-black/grays).
- Keep the map **data colors separate from brand colors**, so the UI never gets confused with the data.
- Clean, minimal layout. The map is the star.

### 4. Scale by configuration
- A new region = a new entry in `pipeline/regions.toml` + running the pipeline. No code changes.
- The frontend reads regions from `manifest.json`. No hard-coded region logic.

### 5. Transparent & honest data
- Show the data source, date range, resolution, and **which method** next to every map and stat.
- Our two methods (infrared vs visible light) can disagree. Don't hide it: explain why in plain words.
- Clearly mark sample/placeholder data.

### 6. Learn-first AI use
- AI helps us understand and move faster. We still write, read, and understand our code.
- AI-written code is tagged (`[AI]` comment block, see [AGENTS.md](../AGENTS.md)).
