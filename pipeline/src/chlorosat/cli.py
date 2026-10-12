"""Command-line entry point: `uv run chlorosat <command> ...`

Implemented command:
    ndvi --region okc-norman --year 2024 --red B04.tif --nir B08.tif [--offset 1000]

The full fetch/composite/stats pipeline is future work. It is intentionally
not advertised as a CLI command until it exists.
"""

import argparse

from chlorosat import process


# [AI] Purpose: Define the implemented commands so `chlorosat --help` stays truthful.
#      Does:    Builds an argparse parser with the working local-file `ndvi` command.
#      Context: Add future commands only when their underlying pipeline is implemented.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
#      Edited:  2026-09-24 · Claude Fable 5.1 (for Carter) · added `ndvi` (CS-011)
#      Edited:  2026-10-12 · GPT-5.6 Sol · requested by Lucas · removed unimplemented commands
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

    return parser


# [AI] Purpose: What runs when someone types `chlorosat`.
#      Does:    Parses arguments. With no command, prints help. `ndvi` runs process.ndvi_year.
#      Context: Keep logic out of this file. Future commands belong here only after implementation.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
#      Edited:  2026-09-24 · Claude Fable 5.1 (for Carter) · wired `ndvi` (CS-011)
#      Edited:  2026-10-12 · GPT-5.6 Sol · requested by Lucas · describe implemented scope
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
