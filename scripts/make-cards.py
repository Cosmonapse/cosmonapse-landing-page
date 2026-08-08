#!/usr/bin/env python3
"""Render a JSON file of card specs to PNGs.

    python make-cards.py specs.json out/                 # dark (default)
    python make-cards.py specs.json out/ --theme light
    python make-cards.py specs.json out/ --theme both    # -> name.png, name-light.png

specs.json is a list of card objects; see CARDS.md for the format. Each needs
a "file" key (the output basename, no extension). Exits non-zero if any card
overflows its panel, so this is safe to run in CI.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cards import OVERFLOW, THEMES, render          # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("specs", help="JSON file: a list of card specs")
    ap.add_argument("outdir")
    ap.add_argument("--theme", default="dark",
                    choices=(*THEMES, "both"))
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    with open(args.specs, encoding="utf-8") as fh:
        specs = json.load(fh)
    if not isinstance(specs, list):
        raise SystemExit("specs file must contain a JSON list of card objects")

    themes = tuple(THEMES) if args.theme == "both" else (args.theme,)
    written = 0
    for i, spec in enumerate(specs):
        name = spec.get("file") or f"card-{i + 1:02d}"
        for theme in themes:
            suffix = "" if theme == themes[0] and len(themes) == 1 else f"-{theme}"
            path = os.path.join(args.outdir, f"{name}{suffix}.png")
            render(spec, path, theme=theme)
            written += 1
            if not args.quiet:
                print("wrote", path)

    print(f"\n{written} card(s), {len(OVERFLOW)} overflow issue(s)")
    for line in OVERFLOW:
        print("  ", line)
    return 1 if OVERFLOW else 0


if __name__ == "__main__":
    raise SystemExit(main())
