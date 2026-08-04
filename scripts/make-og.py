#!/usr/bin/env python3
"""
Generate the Open Graph / Twitter share cards.

Everything is composed from the real brand assets and the real site fonts, so
the cards cannot drift from the site:

  * app/assets/logowork.png  - the orbital mark (dark-theme artwork)
  * app/assets/wordwork.png  - the COSMONAPSE wordmark
  * Inter / JetBrains Mono / Michroma, lifted out of the woff2 files that
    next/font already cached under .next/static/media

Colours mirror the dark-theme tokens in app/globals.css. If a token there
changes, change the matching constant here.

Usage:
    python3 scripts/make-og.py          # writes public/og/*.png

Requires: pillow, fonttools, brotli  (pip install pillow fonttools brotli)
Run it after at least one `npm run build`, so the font cache exists.
"""

from __future__ import annotations

import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "app", "assets")
FONT_CACHE = os.path.join(ROOT, ".next", "static", "media")
OUT_DIR = os.path.join(ROOT, "public", "og")
TMP = os.path.join(ROOT, ".next", "cache", "og-fonts")

W, H = 1200, 630
PAD = 76

# ── Dark-theme tokens (app/globals.css :root) ────────────────────────────
BG = (7, 8, 12)
TEXT = (230, 231, 236)
TEXT_DIM = (144, 151, 168)
TEXT_FAINT = (91, 98, 117)
ACCENT = (139, 92, 246)
ACCENT_SOFT = (167, 139, 250)
ACCENT_2 = (34, 211, 238)
GRID = 9  # grid line alpha out of 255


# ── Fonts ────────────────────────────────────────────────────────────────
def _extract_fonts() -> dict[str, str]:
    """Pull Inter / JetBrains Mono / Michroma out of the next/font woff2 cache.

    Matched on the family name inside each file rather than on the build hash,
    so a rebuild that renames the files does not break this.
    """
    os.makedirs(TMP, exist_ok=True)
    want = {"Inter": "inter", "JetBrains Mono": "mono", "Michroma": "michroma"}
    found: dict[str, str] = {}

    for path in sorted(glob.glob(os.path.join(FONT_CACHE, "*.woff2"))):
        try:
            font = TTFont(path, lazy=True)
            family = font["name"].getDebugName(1)
        except Exception:
            continue
        key = want.get(family)
        # Prefer the ".p" subset - that is the preloaded latin one.
        if key and (key not in found or path.endswith("-s.p.woff2")):
            found[key] = path

    missing = set(want.values()) - set(found)
    if missing:
        sys.exit(
            "Missing fonts in the next/font cache: %s\n"
            "Run `npm run build` once so next/font downloads them, then retry."
            % ", ".join(sorted(missing))
        )

    out: dict[str, str] = {}
    for key, src in found.items():
        dst = os.path.join(TMP, key + ".ttf")
        font = TTFont(src)
        font.flavor = None
        font.save(dst)
        out[key] = dst

    # Inter and JetBrains Mono ship as variable fonts; pin the weights we use
    # so Pillow (which ignores the wght axis) renders the right ones.
    for key, weights in (("inter", (500, 600, 700)), ("mono", (500,),)):
        for weight in weights:
            dst = os.path.join(TMP, f"{key}-{weight}.ttf")
            inst = instancer.instantiateVariableFont(TTFont(out[key]), {"wght": weight})
            inst.save(dst)
            out[f"{key}-{weight}"] = dst
    return out


FONTS = _extract_fonts()


def f(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONTS[name], size)


# ── Drawing helpers ──────────────────────────────────────────────────────
def ground() -> Image.Image:
    """Dark ground + hairline grid + two soft accent glows."""
    img = Image.new("RGB", (W, H), BG)

    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, W, 48):
        gd.line([(x, 0), (x, H)], fill=(255, 255, 255, GRID))
    for y in range(0, H, 48):
        gd.line([(0, y), (W, y)], fill=(255, 255, 255, GRID))
    img = Image.alpha_composite(img.convert("RGBA"), grid).convert("RGB")

    # Kept deliberately faint - the ground should still read as near-black,
    # the way the site does. Anything stronger turns the card grey-violet.
    for cx, cy, r, colour, strength in (
        (210, 300, 300, ACCENT, 0.20),
        (1080, 600, 300, ACCENT_2, 0.13),
        (860, 90, 220, ACCENT_SOFT, 0.07),
    ):
        layer = Image.new("L", (W, H), 0)
        ImageDraw.Draw(layer).ellipse(
            [cx - r, cy - r, cx + r, cy + r], fill=int(255 * strength)
        )
        layer = layer.filter(ImageFilter.GaussianBlur(radius=r * 0.55))
        img = Image.composite(Image.new("RGB", (W, H), colour), img, layer)
    return img


def fit(path: str, height: int) -> Image.Image:
    """Load an asset, trim its transparent margin, scale to a target height."""
    im = Image.open(path).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    w = round(im.width * height / im.height)
    return im.resize((w, height), Image.LANCZOS)


def tracked(draw: ImageDraw.ImageDraw, xy, text, font, fill, tracking=0.0):
    """Draw text with letter-spacing, which Pillow has no native support for."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def lockup(img: Image.Image, x: int, y: int, mark_h: int = 70) -> int:
    """The mark + wordmark, baseline-aligned. Returns the bottom edge."""
    mark = fit(os.path.join(ASSETS, "logowork.png"), mark_h)
    word = fit(os.path.join(ASSETS, "wordwork.png"), round(mark_h * 0.38))
    img.paste(mark, (x, y), mark)
    img.paste(word, (x + mark.width + 22, y + (mark_h - word.height) // 2), word)
    return y + mark_h


def card(eyebrow: str, headline: list[str], sub: list[str], url: str) -> Image.Image:
    img = ground()

    # Oversized mark bleeding off the right edge, barely there - it balances
    # the left-aligned type without competing with it.
    ghost = fit(os.path.join(ASSETS, "logowork.png"), 520)
    ghost.putalpha(ghost.getchannel("A").point(lambda a: int(a * 0.07)))
    img.paste(ghost, (W - ghost.width + 120, (H - ghost.height) // 2 - 20), ghost)

    d = ImageDraw.Draw(img)

    bottom = lockup(img, PAD, PAD - 8)

    y = bottom + 54
    tracked(d, (PAD, y), eyebrow, f("mono-500", 21), ACCENT_SOFT, tracking=1.6)

    y += 52
    head = f("inter-600", 58)
    for line in headline:
        d.text((PAD, y), line, font=head, fill=TEXT)
        y += 70

    y += 12
    body = f("inter-500", 25)
    for line in sub:
        d.text((PAD, y), line, font=body, fill=TEXT_DIM)
        y += 36

    # Footer rule + url, pinned to the bottom so every card lines up.
    d.line([(PAD, H - 96), (W - PAD, H - 96)], fill=(30, 33, 44), width=1)
    d.text((PAD, H - 74), url, font=f("mono-500", 22), fill=TEXT_FAINT)

    # Accent tick on the rule, left-aligned under the content.
    d.line([(PAD, H - 96), (PAD + 96, H - 96)], fill=ACCENT, width=2)
    return img


CARDS = {
    "cosmonapse": dict(
        eyebrow="// PLATFORM SUITE",
        headline=["Build AI systems,", "not another wrapper."],
        sub=[
            "Genesis to design them. The open Core protocol to run",
            "them. Prism to watch them. Apache 2.0.",
        ],
        url="cosmonapse.dev",
    ),
    "early-access": dict(
        eyebrow="// EARLY ACCESS PROGRAM",
        headline=["Build on Cosmonapse", "before 1.0."],
        sub=[
            "Architecture sessions with the team, and credits when",
            "the platform goes live. Limited slots.",
        ],
        url="cosmonapse.dev/early-access",
    ),
}


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, spec in CARDS.items():
        out = os.path.join(OUT_DIR, name + ".png")
        card(**spec).save(out, optimize=True)
        print("wrote %s (%.0f kB)" % (out, os.path.getsize(out) / 1024))


if __name__ == "__main__":
    main()
