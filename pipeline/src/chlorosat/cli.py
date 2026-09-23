"""Command-line entry point: `uv run chlorosat <command> ...`

Planned commands:
    fetch --region okc-norman --year 2024        (CS-010, S2) download bands for one year
    run   --region okc-norman --years 2019-2025  (CS-020, S3) full pipeline -> web/public/data/
          [--methods ndvi,visible]               (CS-026, S3) default: every method in methods.py
"""

import argparse


# [AI] Purpose: Define the commands + options so `chlorosat --help` documents itself.
#      Does:    Builds an argparse parser with `fetch` and `run` subcommands.
#      Context: Scaffold only; add options here as features land.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="chlorosat", description="Satellite bands -> vegetation layers + stats."
    )
    sub = parser.add_subparsers(dest="command")

    fetch = sub.add_parser("fetch", help="Download satellite bands for one region + year.")
    fetch.add_argument("--region", required=True, help="Region id from regions.toml")
    fetch.add_argument("--year", required=True, type=int)

    run = sub.add_parser("run", help="Full pipeline for a range of years.")
    run.add_argument("--region", required=True, help="Region id from regions.toml")
    run.add_argument("--years", required=True, help='Year range, e.g. "2019-2025"')
    run.add_argument("--methods", help='Comma list, e.g. "ndvi,visible" (default: all)')

    return parser


# [AI] Purpose: What runs when someone types `chlorosat`.
#      Does:    Parses arguments. With no command, prints help. Commands are TODO.
#      Context: TODO(CS-010: fetch, CS-020: run). Call functions from the other modules;
#               keep logic out of this file.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command is None:
        parser.print_help()
        return 0

    # parser.error() prints the message and exits with code 2.
    parser.error(f"'{args.command}' is not implemented yet (see docs/BACKLOG.md)")


if __name__ == "__main__":
    raise SystemExit(main())
