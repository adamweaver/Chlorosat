"""Command-line entry point: `uv run chlorosat <command> ...`

Commands:
    ndvi  --region okc-norman --year 2024 --red B04.tif --nir B08.tif [--offset 1000]
                                                 (CS-011, S2) NDVI PNG + manifest from band files
Planned commands:
    fetch --region okc-norman --year 2024        (CS-010, S2) download bands for one year
    run   --region okc-norman --years 2019-2025  (CS-020, S3) full pipeline -> web/public/data/
          [--methods ndvi,visible]               (CS-026, S3) default: every method in methods.py
"""

import argparse

from chlorosat import process


# [AI] Purpose: Define the commands + options so `chlorosat --help` documents itself.
#      Does:    Builds an argparse parser with `ndvi`, `fetch` and `run` subcommands.
#      Context: Scaffold; add options here as features land.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
#      Edited:  2026-09-24 · Claude Fable 5.1 (for Carter) · added `ndvi` (CS-011)
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="chlorosat", description="Satellite bands -> vegetation layers + stats."
    )
    sub = parser.add_subparsers(dest="command")

    ndvi = sub.add_parser("ndvi", help="NDVI PNG + manifest for one year from band GeoTIFFs.")
    ndvi.add_argument("--region", required=True, help="Region id from regions.toml")
    ndvi.add_argument("--year", required=True, type=int)
    ndvi.add_argument("--red", required=True, help="Red band GeoTIFF (Sentinel-2 B04)")
    ndvi.add_argument("--nir", required=True, help="NIR band GeoTIFF (Sentinel-2 B08)")
    ndvi.add_argument(
        "--offset",
        type=float,
        default=0,
        help="Reflectance offset to remove (1000 for L2A scenes from 2022 on)",
    )

    fetch = sub.add_parser("fetch", help="Download satellite bands for one region + year.")
    fetch.add_argument("--region", required=True, help="Region id from regions.toml")
    fetch.add_argument("--year", required=True, type=int)

    run = sub.add_parser("run", help="Full pipeline for a range of years.")
    run.add_argument("--region", required=True, help="Region id from regions.toml")
    run.add_argument("--years", required=True, help='Year range, e.g. "2019-2025"')
    run.add_argument("--methods", help='Comma list, e.g. "ndvi,visible" (default: all)')

    return parser


# [AI] Purpose: What runs when someone types `chlorosat`.
#      Does:    Parses arguments. With no command, prints help. `ndvi` runs process.ndvi_year.
#      Context: TODO(CS-010: fetch, CS-020: run). Call functions from the other modules;
#               keep logic out of this file.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
#      Edited:  2026-09-24 · Claude Fable 5.1 (for Carter) · wired `ndvi` (CS-011)
def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command is None:
        parser.print_help()
        return 0

    if args.command == "ndvi":
        folder = process.ndvi_year(args.region, args.year, args.red, args.nir, args.offset)
        print(f"Wrote {folder / f'{args.year}.png'} and updated manifest.json")
        return 0

    # parser.error() prints the message and exits with code 2.
    parser.error(f"'{args.command}' is not implemented yet (see docs/BACKLOG.md)")


if __name__ == "__main__":
    raise SystemExit(main())
