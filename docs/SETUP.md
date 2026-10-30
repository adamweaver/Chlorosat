# Developer setup

## Website

Install Git and Node.js 22, then:

```bash
git clone https://github.com/adamweaver/Chlorosat.git
cd Chlorosat/web
npm ci
npm run dev
```

Routes:

- `http://localhost:3000/`
- `http://localhost:3000/map/`
- `http://localhost:3000/about/`

Checks:

```bash
npm run lint
npm test
npm run build
```

`npm test` runs every unit test in `web/tests/` with Node's built-in test
runner. It needs no network or browser.

The build is a static export in `web/out/`. Preview it with:

```bash
python3 -m http.server -d out 8000
```

The globe is browser-only because MapLibre needs `window` and WebGL.
`PersistentMap.js` loads `MapApp` with `next/dynamic` and `ssr: false`.

The live map needs network access to NASA, Esri, OpenFreeMap and Photon.
Remote-service failures can leave individual map layers unavailable even
when the local build is correct.

An optional `NEXT_PUBLIC_ESRI_API_KEY` may be placed in `web/.env.local`.
It is a browser-visible public-application key and must be restricted by
referrer in Esri. Never commit `.env.local`.

## Future pipeline

The pipeline is not used by the live website. Install `uv` only when working
on that future offline path:

```bash
cd pipeline
uv sync
uv run ruff check
uv run pytest
uv run chlorosat --help
```

Only the local-file `ndvi` command is implemented. See
[pipeline/README.md](../pipeline/README.md).

Raw imagery belongs under `pipeline/data/` and must not be committed.

## Workflow

1. Branch from an up-to-date `main`.
2. Make one focused change.
3. Run checks for the affected area.
4. Open a pull request.
5. Merge after CI passes and one teammate approves.
