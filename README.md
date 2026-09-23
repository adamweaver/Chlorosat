# Vegetation Monitoring - Software Engineering CS3203

## Table of Contents

- [What is this?](#what-is-this)
- [What it does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Usage](#usage)
- [Branching Strategy](#branching-strategy)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [Team](#team)

## What is this?

A tool for monitoring local vegetation in the OKC area using satellite data and NDVI (Normalized Difference Vegetation Index) calculations!

## What it does

- Takes satellite visual and near-infrared data and calculates grenery/vegetation.
- Uses NDVI to measure vegetation health
- Displays hotspots and green areas in a heatmap format.



## Tech Stack

Frontend: Next.js, HTML, CSS, JavaScript

- Handles application routing and requests to backend API endpoints
- Builds the user interface and displays the vegetation/satellite data
- Dependencies: - Leaflet.js + Leaflet.heat

Backend: Python

- Parses satellite imagery and generates JSON containing point data

## Setup

```
# clone the repo
git clone <repo-url>

# TODO: add install/setup steps once finalized
```

## Usage

TODO: add example commands / screenshots once the app is runnable end-to-end.

## Branching Strategy

Process: Open a PR into main, get atleast 1 review, then merge. Delete branches after merging

- `main` — main production branch, never push directly to it
- `feature/<name>` — one branch per feature (e.g. `feature/ndvi-calculation`)
- `bugfix/<name>` — one branch per bug fix (e.g. `bugfix/<bug>`)
- If branching off a branch, branch from the feature branch (not `main`), then merge back into it when done.

## Commit Messages

Keep them short and straightforward (e.g. `Add NDVI calculation endpoint`, not `added stuff`).

## CI/CD

Planned for Sprint 2. 
Run a build test and lint PRs via GitHub Actions before merging to `main`.

## Contributing

1. Create a branch off `main` (see [Branching Strategy](#branching-strategy))
2. Make your changes and commit
3. Open a PR into `main` and request a review
4. Merge once approved

## Team

Group E — CS3203-001 Software Engineering

test ajsda dopasmdop asmodpamo sdmopma os,pd aosd, asd 