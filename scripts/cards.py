#!/usr/bin/env python3
"""Cosmonapse social/doc cards - the shared visual system.

A companion to make-og.py. Where make-og.py renders the site's Open Graph
images, this renders *content* cards: a code snippet, a terminal transcript,
a comparison table, a before/after split, a single statement, or a small
node-and-edge diagram, on the same ground with the same tokens.

Nothing here invents a colour. The palettes below are transcribed from
app/globals.css (:root and [data-theme="light"]) and from prism-ui/src/
theme.ts for the per-primitive hues, so a card cannot drift from the site
or from Prism. If you change a token there, change it here.

Usage
-----
    from cards import render
    render({"kind": "code", "eyebrow": "0.1.11 - RECEPTOR",
            "headline": "The signature is the CLI",
            "title": "receptors/terminal.py",
            "body": ["from cosmonapse import CliReceptor", ...]},
           "out.png", theme="dark")

or from the command line, over a JSON file of specs:

    python make-cards.py specs.json out/ --theme dark

See CARDS.md for the spec format.
"""
from __future__ import annotations

import os
import re
from typing import Any

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
LP = os.path.dirname(HERE)
ASSETS = os.path.join(LP, "app", "assets")
FONT_CACHE = os.path.join(LP, ".next", "cache", "og-fonts")
TMP = os.path.join(os.environ.get("TMPDIR", "/tmp"), "cosmonapse-cards-fonts")

W, H = 1600, 900
PAD = 78


# ---------------------------------------------------------------- palettes
def _rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


THEMES: dict[str, dict[str, Any]] = {
    # app/globals.css :root
    "dark": dict(
        bg=_rgb("#07080c"), bg_card=_rgb("#0f111a"), rule=_rgb("#1e212c"),
        border=(34, 38, 52), grid=9, glow=0.20,
        text=_rgb("#e6e7ec"), text_dim=_rgb("#9097a8"), text_faint=_rgb("#5b6275"),
        accent=_rgb("#8b5cf6"), accent_soft=_rgb("#a78bfa"),
        accent_2=_rgb("#22d3ee"), accent2_soft=_rgb("#67e8f9"),
        accent_3=_rgb("#f472b6"),
        code_text=_rgb("#d4d7e0"),
        tk_kw=_rgb("#c084fc"), tk_fn=_rgb("#67e8f9"), tk_str=_rgb("#86efac"),
        tk_cm=_rgb("#5b6275"), tk_num=_rgb("#fbbf24"), tk_op=_rgb("#f472b6"),
        ok=_rgb("#86efac"), warn=_rgb("#fbbf24"), err=_rgb("#f87171"),
        # prism-ui/src/theme.ts - per-primitive silhouette hues
        p_neuron=_rgb("#8b5cf6"), p_engram=_rgb("#a78bfa"),
        p_effector=_rgb("#f59e0b"), p_receptor=_rgb("#a3e635"),
        p_synapse=_rgb("#22d3ee"),
        grad=(_rgb("#a78bfa"), _rgb("#c084fc"), _rgb("#f472b6")),
        mark="logowork.png", word_tint=None,
        glows=((250, 340, 380, "accent", 0.20),
               (1420, 780, 360, "accent_2", 0.12),
               (1120, 80, 280, "accent_soft", 0.06)),
        ghost_alpha=0.06,
    ),
    # app/globals.css [data-theme="light"]
    "light": dict(
        bg=_rgb("#ffffff"), bg_card=_rgb("#f8fafc"), rule=_rgb("#dbe3ec"),
        border=(214, 223, 233), grid=7, glow=0.16,
        text=_rgb("#16324c"), text_dim=_rgb("#4d6580"), text_faint=_rgb("#6b7f95"),
        accent=_rgb("#25507a"), accent_soft=_rgb("#25507a"),
        accent_2=_rgb("#c4442a"), accent2_soft=_rgb("#c4442a"),
        accent_3=_rgb("#e25539"),
        code_text=_rgb("#1f3a52"),
        tk_kw=_rgb("#7c3aed"), tk_fn=_rgb("#0e7490"), tk_str=_rgb("#15803d"),
        tk_cm=_rgb("#8296ab"), tk_num=_rgb("#b45309"), tk_op=_rgb("#c4442a"),
        ok=_rgb("#15803d"), warn=_rgb("#b45309"), err=_rgb("#c02626"),
        p_neuron=_rgb("#6d28d9"), p_engram=_rgb("#6d28d9"),
        p_effector=_rgb("#b45309"), p_receptor=_rgb("#4d7c0f"),
        p_synapse=_rgb("#0e7490"),
        grad=(_rgb("#25507a"), _rgb("#3a76ad"), _rgb("#e25539")),
        mark="logowork-light.png", word_tint=_rgb("#25507a"),
        glows=((250, 340, 380, "accent", 0.10),
               (1420, 780, 360, "accent_3", 0.07)),
        ghost_alpha=0.05,
    ),
}

# Two palettes, because two things are being drawn.
#
# "suite" is what assets/diagrams/*.svg and the Genesis page use, and its
# comment is the rule: "Neurons accent, Engrams --p-engram, Effectors
# accent-3, Receptors accent-2. A component wears one colour across the
# suite." Use it for any figure that explains the primitives.
#
# "prism" is what the live Constellation paints nodes with (prism-ui/src/
# theme.ts). Use it only when the card is depicting an actual Prism view.
PALETTES = {
    "suite": {"neuron": "accent", "axon": "accent", "engram": "p_engram",
              "effector": "accent_3", "receptor": "accent_2",
              "synapse": "accent_2"},
    "prism": {"neuron": "p_neuron", "axon": "p_neuron", "engram": "p_engram",
              "effector": "p_effector", "receptor": "p_receptor",
              "synapse": "p_synapse"},
}


# ------------------------------------------------------------------ fonts
def _extract_fonts() -> dict[str, str]:
    """Reuse make-og.py's font cache; pin the weights Pillow can't vary."""
    os.makedirs(TMP, exist_ok=True)
    if not os.path.isdir(FONT_CACHE):
        raise SystemExit(
            f"font cache not found at {FONT_CACHE}\n"
            "run `npm run build` (or scripts/make-og.py) once to populate it."
        )
    out = {k: os.path.join(FONT_CACHE, k + ".ttf")
           for k in ("inter", "mono", "michroma")}
    for key, weights in (("inter", (500, 600, 700)), ("mono", (400, 500, 600))):
        for wt in weights:
            dst = os.path.join(TMP, f"{key}-{wt}.ttf")
            if not os.path.exists(dst):
                try:
                    instancer.instantiateVariableFont(
                        TTFont(out[key]), {"wght": wt}).save(dst)
                except Exception:          # not a variable font; use as-is
                    dst = out[key]
            out[f"{key}-{wt}"] = dst
    return out


_FONTS: dict[str, str] = {}
_FCACHE: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}


def f(name: str, size: int) -> ImageFont.FreeTypeFont:
    global _FONTS
    if not _FONTS:
        _FONTS = _extract_fonts()
    key = (name, size)
    if key not in _FCACHE:
        _FCACHE[key] = ImageFont.truetype(_FONTS[name], size)
    return _FCACHE[key]


# ------------------------------------------------------------- primitives
def ground(T: dict) -> Image.Image:
    """Ground + hairline grid + soft accent glows, exactly as make-og.py."""
    img = Image.new("RGB", (W, H), T["bg"])
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    line = (0, 0, 0, T["grid"]) if T is THEMES["light"] else (255, 255, 255, T["grid"])
    for x in range(0, W, 48):
        gd.line([(x, 0), (x, H)], fill=line)
    for y in range(0, H, 48):
        gd.line([(0, y), (W, y)], fill=line)
    img = Image.alpha_composite(img.convert("RGBA"), grid).convert("RGB")
    for cx, cy, r, key, strength in T["glows"]:
        layer = Image.new("L", (W, H), 0)
        ImageDraw.Draw(layer).ellipse([cx - r, cy - r, cx + r, cy + r],
                                      fill=int(255 * strength))
        layer = layer.filter(ImageFilter.GaussianBlur(radius=r * 0.55))
        img = Image.composite(Image.new("RGB", (W, H), T[key]), img, layer)
    return img


def fit(path: str, height: int) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    w = max(1, round(im.width * height / im.height))
    return im.resize((w, height), Image.LANCZOS)


def tint(im: Image.Image, colour: tuple[int, int, int] | None) -> Image.Image:
    """Recolour an alpha-masked asset. The wordmark ships white, so the
    light theme needs it in the brand blue rather than invisible."""
    if colour is None:
        return im
    solid = Image.new("RGBA", im.size, colour + (255,))
    solid.putalpha(im.getchannel("A"))
    return solid


def gradient(im: Image.Image, stops: list[tuple[int, int, int]]) -> Image.Image:
    """Fill an alpha-masked asset with a left-to-right gradient. The site's
    wordmark gradient is --grad-1 -> --grad-2 -> --grad-3; the asset ships as
    a white silhouette, so the colour has to be painted on here."""
    w, h = im.size
    ramp = Image.new("RGB", (w, 1))
    px = ramp.load()
    seg = max(1, len(stops) - 1)
    for x in range(w):
        t = x / max(1, w - 1) * seg
        i = min(int(t), seg - 1)
        f = t - i
        px[x, 0] = tuple(round(stops[i][c] + (stops[i + 1][c] - stops[i][c]) * f)
                         for c in range(3))
    out = ramp.resize((w, h), Image.NEAREST).convert("RGBA")
    out.putalpha(im.getchannel("A"))
    return out


def wordmark(text: str, size: int, stops: list[tuple[int, int, int]],
             tracking_em: float = 0.06) -> Image.Image:
    """Set the wordmark in the site's brand face.

    globals.css `.brand-word` is Michroma at `letter-spacing: 0.06em`, supplied
    as the --font-brand next/font variable. Setting it here rather than pasting
    wordwork.png means the type stays live: a size change re-renders instead of
    resampling, and the gradient lands on the glyphs at full resolution.
    """
    fnt = ImageFont.truetype(_FONTS_get("michroma"), size)
    tracking = size * tracking_em
    probe = ImageDraw.Draw(Image.new("L", (1, 1)))
    width = sum(probe.textlength(c, font=fnt) + tracking for c in text)
    mask = Image.new("L", (int(width) + size, int(size * 2)), 0)
    md = ImageDraw.Draw(mask)
    x = size * 0.25
    for ch in text:
        md.text((x, size * 0.25), ch, font=fnt, fill=255)
        x += md.textlength(ch, font=fnt) + tracking
    mask = mask.crop(mask.getbbox())
    out = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    out.putalpha(mask)
    return gradient(out, stops)


def _FONTS_get(name: str) -> str:
    global _FONTS
    if not _FONTS:
        _FONTS = _extract_fonts()
    return _FONTS[name]


def pill(d, T, x, y, text, accent=False, pad=22, height=52):
    """A bordered capsule, as used under the hero wordmark."""
    fnt = f("mono-500", 22)
    w = d.textlength(text, font=fnt) + pad * 2
    edge = T["accent"] if accent else T["border"]
    d.rounded_rectangle([x, y, x + w, y + height], radius=height // 2,
                        outline=edge, width=1, fill=T["bg_card"])
    d.text((x + pad, y + (height - 28) // 2), text, font=fnt,
           fill=T["accent_soft"] if accent else T["text_dim"])
    return w


def tracked(d, xy, text, font, fill, tracking=0.0):
    """Letter-spaced text; Pillow has no native tracking."""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + tracking
    return x


def lockup(img: Image.Image, T: dict, x: int, y: int, mark_h: int = 52) -> int:
    mark = fit(os.path.join(ASSETS, T["mark"]), mark_h)
    word = tint(fit(os.path.join(ASSETS, "wordwork.png"), round(mark_h * 0.38)),
                T["word_tint"])
    img.paste(mark, (x, y), mark)
    img.paste(word, (x + mark.width + 18, y + (mark_h - word.height) // 2), word)
    return x + mark.width + 18 + word.width


def panel(img: Image.Image, T: dict, box, radius: int = 16) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(
        box, radius=radius, fill=T["bg_card"] + (235,),
        outline=T["border"], width=1)
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"),
              (0, 0))


def chrome(d, T: dict, box, title: str, dots: bool = True, tone=None) -> float:
    """Window title bar inside a panel. Returns the content top y."""
    x0, y0, x1, _ = box
    bar = y0 + 54
    d.line([(x0 + 1, bar), (x1 - 1, bar)], fill=T["rule"], width=1)
    tx = x0 + 26
    if dots:
        base = T["text_faint"]
        for i in range(3):
            cx = x0 + 28 + i * 20
            fade = 1 - i * 0.25
            d.ellipse([cx - 6, y0 + 21, cx + 6, y0 + 33],
                      fill=tuple(int(c * fade) for c in base))
        tx = x0 + 100
    d.text((tx, y0 + 17), title, font=f("mono-500", 21),
           fill=tone or T["accent_soft"])
    return bar + 26


# ------------------------------------------------------- python highlight
KW = {"async", "await", "def", "class", "return", "import", "from", "if",
      "else", "elif", "for", "while", "with", "as", "in", "not", "and", "or",
      "None", "True", "False", "try", "except", "finally", "yield", "raise",
      "lambda", "pass", "is", "assert", "global", "del"}
BUILTIN = {"str", "int", "dict", "list", "bool", "float", "print", "self",
           "Any", "tuple", "set", "bytes"}

_TOKEN = re.compile(r"""
    (?P<cm>\#.*$)
  | (?P<str>(?:f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*'))
  | (?P<dec>@[A-Za-z_][\w.]*)
  | (?P<num>\b\d+(?:\.\d+)?\b)
  | (?P<word>[A-Za-z_]\w*)
  | (?P<op>[=+\-*/<>!|&%^~,.:;\[\]{}()])
  | (?P<ws>\s+)
  | (?P<any>.)
""", re.X)


def tokenize(line: str, T: dict) -> list[tuple[str, tuple[int, int, int]]]:
    out = []
    for m in _TOKEN.finditer(line):
        kind, txt = m.lastgroup, m.group()
        if kind == "cm":
            out.append((txt, T["tk_cm"]))
        elif kind == "str":
            out.append((txt, T["tk_str"]))
        elif kind == "dec":
            out.append((txt, T["accent_soft"]))
        elif kind == "num":
            out.append((txt, T["tk_num"]))
        elif kind == "word":
            if txt in KW:
                out.append((txt, T["tk_kw"]))
            elif txt in BUILTIN:
                out.append((txt, T["accent2_soft"]))
            elif m.end() < len(line) and line[m.end()] == "(":
                out.append((txt, T["tk_fn"]))
            else:
                out.append((txt, T["code_text"]))
        elif kind == "op":
            out.append((txt, T["tk_op"] if txt in "=+-*/<>!|&%^~" else T["text_faint"]))
        else:
            out.append((txt, T["code_text"]))
    return out


def draw_code(d, T, x, y, lines, size=27, lh=40, gutter=False):
    fnt, n = f("mono", size), 1
    for line in lines:
        cx = x
        if gutter:
            d.text((x, y), f"{n:>2}", font=f("mono", size - 3), fill=T["rule"])
            cx = x + 46
        for txt, col in tokenize(line, T):
            d.text((cx, y), txt, font=fnt, fill=col)
            cx += d.textlength(txt, font=fnt)
        y += lh
        n += 1
    return y


#: line prefixes understood by ``kind: "term"``
TERM_PREFIX = {"$ ": "prompt", "# ": "comment", "> ": "note",
               "! ": "warn", "x ": "error", "+ ": "ok"}


def draw_term(d, T, x, y, lines, size=27, lh=40):
    fnt, bold = f("mono", size), f("mono-600", size)
    for line in lines:
        head, rest = line[:2], line[2:]
        role = TERM_PREFIX.get(head)
        if role == "prompt":
            d.text((x, y), "$", font=bold, fill=T["accent"])
            d.text((x + d.textlength("$  ", font=fnt) - 6, y), rest,
                   font=bold, fill=T["text"])
        elif role == "comment":
            d.text((x, y), line, font=fnt, fill=T["tk_cm"])
        else:
            colour = {"note": T["accent2_soft"], "warn": T["warn"],
                      "error": T["err"], "ok": T["ok"]}.get(role, T["text_dim"])
            d.text((x, y), rest if role else line, font=fnt, fill=colour)
        y += lh
    return y


# -------------------------------------------------------------- diagrams
def _node_shape(d, T, cx, cy, r, shape, label_colour):
    """One primitive silhouette, matching what Prism draws on the canvas."""
    if shape in ("neuron", "axon"):                       # circle
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=label_colour, width=3)
    elif shape == "engram":                               # diamond
        d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)],
                  outline=label_colour, width=3)
    elif shape == "effector":                             # triangle
        d.polygon([(cx, cy - r), (cx + r * 0.866, cy + r * 0.5),
                   (cx - r * 0.866, cy + r * 0.5)], outline=label_colour, width=3)
    elif shape == "receptor":
        # A cup, open at the top: a Receptor collects from outside the fabric
        # rather than servicing something inside it.
        d.arc([cx - r, cy - r, cx + r, cy + r], start=0, end=180,
              fill=label_colour, width=3)
        d.arc([cx - r * 0.62, cy - r * 0.62, cx + r * 0.62, cy + r * 0.62],
              start=0, end=180, fill=label_colour, width=3)
        for sx in (-1, 1):
            d.line([(cx + sx * r, cy), (cx + sx * r * 0.62, cy)],
                   fill=label_colour, width=3)
    else:                                                 # synapse - the bar
        d.rounded_rectangle([cx - r * 1.9, cy - 9, cx + r * 1.9, cy + 9],
                            radius=9, outline=label_colour, width=3)


def _arrow(d, T, a, b, colour, label=None):
    import math
    (x0, y0), (x1, y1) = a, b
    ang = math.atan2(y1 - y0, x1 - x0)
    d.line([a, b], fill=colour, width=2)
    for s in (2.6, -2.6):
        d.line([b, (x1 - 14 * math.cos(ang + s * 0.32 * 3.1416 / 2.6),
                    y1 - 14 * math.sin(ang + s * 0.32 * 3.1416 / 2.6))],
               fill=colour, width=2)
    if label:
        fnt = f("mono", 19)
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        wide = d.textlength(label, font=fnt)
        if abs(y1 - y0) > abs(x1 - x0):      # vertical-ish: label to the side,
            d.text((mx + 16, my - 10), label, font=fnt, fill=T["text_faint"])
        else:                                # horizontal: label above the line
            d.text((mx - wide / 2, my - 26), label, font=fnt, fill=T["text_faint"])


# ------------------------------------------------------------------ layout
OVERFLOW: list[str] = []


def _centre(top: float, bottom: float, n: int, lh: int) -> float:
    return top + max(0.0, ((bottom - top) - n * lh) * 0.42)


def _fit_v(n: int, size: int, lh: int, avail: float) -> tuple[int, int]:
    """Shrink type until n lines fit the panel. Never grows."""
    while n * lh > avail and lh > 22:
        lh -= 2
        size = min(size, int(lh * 0.68))
    return size, lh


def _check_h(d, spec, x, lines, size, limit):
    fnt = f("mono", size)
    for line in lines:
        w = d.textlength(line, font=fnt)
        if x + w > limit:
            OVERFLOW.append(
                f"{spec.get('file', spec.get('headline', '?'))}: "
                f"+{int(x + w - limit)}px  {line[:52]}")


def _wrap(d, text: str, font, width: float) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if d.textlength(trial, font=font) <= width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def _base(T, eyebrow: str, headline: str):
    img = ground(T)
    ghost = fit(os.path.join(ASSETS, T["mark"]), 700)
    ghost.putalpha(ghost.getchannel("A").point(
        lambda a: int(a * T["ghost_alpha"])))
    img.paste(ghost, (W - ghost.width + 170, (H - ghost.height) // 2), ghost)
    lockup(img, T, PAD, PAD - 10)
    d = ImageDraw.Draw(img)
    if eyebrow:
        tracked(d, (PAD, PAD + 62), eyebrow, f("mono-600", 20),
                T["accent_soft"], 1.8)
    head = f("inter-600", 44)
    for i, line in enumerate(_wrap(d, headline, head, W - 2 * PAD - 240)[:2]):
        d.text((PAD, PAD + 96 + i * 54), line, font=head, fill=T["text"])
    return img, d


def _footer(d, T, note: str, right: str):
    d.line([(PAD, H - 92), (W - PAD, H - 92)], fill=T["rule"], width=1)
    d.line([(PAD, H - 92), (PAD + 108, H - 92)], fill=T["accent"], width=2)
    fnt = f("mono-500", 21)
    d.text((PAD, H - 70), note, font=fnt, fill=T["text_faint"])
    d.text((W - PAD - d.textlength(right, font=fnt), H - 70), right,
           font=fnt, fill=T["text_faint"])


KINDS = ("code", "term", "table", "split", "quote", "diagram", "hero")


def render(spec: dict, out_path: str, theme: str = "dark") -> str:
    """Render one card spec to a PNG. Returns the path written."""
    T = THEMES[spec.get("theme", theme)]
    kind = spec["kind"]
    if kind not in KINDS:
        raise ValueError(f"unknown card kind {kind!r}; expected one of {KINDS}")

    if kind == "hero":
        return _hero(spec, T, out_path)

    two_line = len(_wrap(ImageDraw.Draw(Image.new("RGB", (1, 1))),
                         spec.get("headline", ""), f("inter-600", 44),
                         W - 2 * PAD - 240)) > 1
    img, d = _base(T, spec.get("eyebrow", ""), spec.get("headline", ""))
    top, bottom = (268 + (46 if two_line else 0)), H - 128
    box = (PAD, top, W - PAD, bottom)

    if kind == "quote":
        # No panel: the statement is the card.
        fnt = f("inter-600", 72)
        lines = _wrap(d, spec["body"], fnt, W - 2 * PAD - 120)
        y = _centre(top + 20, bottom, len(lines), 92)
        d.line([(PAD, y + 6), (PAD, y + len(lines) * 92 - 18)],
               fill=T["accent"], width=4)
        for line in lines:
            d.text((PAD + 34, y), line, font=fnt, fill=T["text"])
            y += 92
        if spec.get("attribution"):
            d.text((PAD + 34, y + 14), spec["attribution"],
                   font=f("mono-500", 24), fill=T["text_faint"])

    elif kind == "diagram":
        panel(img, T, box)
        d = ImageDraw.Draw(img)
        y0 = chrome(d, T, box, spec.get("title", ""), dots=False,
                    tone=T["accent2_soft"]) if spec.get("title") else top + 30
        pal = PALETTES[spec.get("palette", "suite")]
        nodes, cols = spec["nodes"], {}
        for n in nodes:
            cols.setdefault(n.get("col", 0), []).append(n)
        ncols = max(cols) + 1
        span = (W - 2 * PAD - 200) / max(1, ncols - 1) if ncols > 1 else 0
        pos, r = {}, 46
        band_top, band_bot = y0 + 34, bottom - 46
        for c, group in cols.items():
            group.sort(key=lambda n: n.get("row", 0))
            cx = PAD + 100 + c * span
            # Guarantee clearance for the silhouette plus its label, then
            # centre the column in the band rather than spreading to fill it.
            step = max(2 * r + 66, (band_bot - band_top) / max(1, len(group)))
            start = (band_top + band_bot) / 2 - step * (len(group) - 1) / 2
            for i, n in enumerate(group):
                pos[n["id"]] = (cx, start + i * step)
        for src, dst, *lbl in spec.get("edges", []):
            (x0, yy0), (x1, yy1) = pos[src], pos[dst]
            import math
            ang = math.atan2(yy1 - yy0, x1 - x0)
            a = (x0 + (r + 8) * math.cos(ang), yy0 + (r + 8) * math.sin(ang))
            b = (x1 - (r + 14) * math.cos(ang), yy1 - (r + 14) * math.sin(ang))
            _arrow(d, T, a, b, T["text_faint"], lbl[0] if lbl else None)
        # A node with an edge dropping straight down would have that arrow
        # run through its own label, so label those above instead.
        label_above = {a for a, b, *_ in spec.get("edges", [])
                       if abs(pos[b][0] - pos[a][0]) < r and pos[b][1] > pos[a][1]}
        for n in nodes:
            cx, cy = pos[n["id"]]
            colour = T[pal.get(n.get("shape", "neuron"), "accent")]
            _node_shape(d, T, cx, cy, r, n.get("shape", "neuron"), colour)
            fnt = f("mono-500", 22)
            ly = cy - r - 38 if n["id"] in label_above else cy + r + 16
            d.text((cx - d.textlength(n["label"], font=fnt) / 2, ly),
                   n["label"], font=fnt, fill=T["text"])

    elif kind == "split":
        mid, gap = W // 2, 18
        boxes = ((PAD, top, mid - gap, bottom), (mid + gap, top, W - PAD, bottom))
        for b in boxes:
            panel(img, T, b)
        d = ImageDraw.Draw(img)
        size, lh = spec.get("size", 23), spec.get("lh", 34)
        for b, title, lines, tone in (
            (boxes[0], spec["left_title"], spec["left"], T["accent_3"]),
            (boxes[1], spec["right_title"], spec["right"], T["ok"]),
        ):
            yy = chrome(d, T, b, title, dots=False, tone=tone)
            _check_h(d, spec, b[0] + 30, lines, size, b[2] - 22)
            s, l = _fit_v(len(lines), size, lh, (bottom - 28) - yy)
            yy = _centre(yy, bottom - 28, len(lines), l)
            (draw_term if spec.get("mode") == "term" else draw_code)(
                d, T, b[0] + 30, yy, lines, size=s, lh=l)

    else:                                    # code / term / table
        panel(img, T, box)
        d = ImageDraw.Draw(img)
        y = chrome(d, T, box, spec.get("title", ""), dots=(kind != "table"),
                   tone=T["accent2_soft"] if kind == "term" else T["accent_soft"])
        x, body = PAD + 40, spec["body"]
        size, lh = spec.get("size", 27), spec.get("lh", 40)
        n = len(body) + (2 if kind == "table" else 0)
        size, lh = _fit_v(n, size, lh, (bottom - 28) - y)
        y = _centre(y, bottom - 28, n, lh)
        if kind in ("code", "term"):
            _check_h(d, spec, x, body, size, W - PAD - 30)
            (draw_code if kind == "code" else draw_term)(
                d, T, x, y, body, size=size, lh=lh,
                **({"gutter": spec.get("gutter", False)} if kind == "code" else {}))
        else:
            cols = spec["cols"]
            if x + sum(cols) > W - PAD - 30:
                OVERFLOW.append(f"{spec.get('file', '?')}: cols sum {sum(cols)} too wide")
            cx = x
            for i, head in enumerate(spec["headers"]):
                d.text((cx, y), head, font=f("mono-600", size), fill=T["accent_soft"])
                cx += cols[i]
            y += lh + 6
            d.line([(x, y - 14), (W - PAD - 40, y - 14)], fill=T["rule"], width=1)
            for row in body:
                cx = x
                for i, cell in enumerate(row):
                    d.text((cx, y), cell, font=f("mono", size),
                           fill=T["text"] if i == 0 else T["text_dim"])
                    cx += cols[i]
                y += lh

    _footer(d, T, spec.get("note", "pip install cosmonapse"),
            spec.get("note_right", "cosmonapse  ·  Apache 2.0"))
    os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
    img.save(out_path, optimize=True)
    return out_path


def _hero(spec: dict, T: dict, out_path: str) -> str:
    """The title card: centred mark, gradient wordmark, tagline, pills.

    Deliberately the one layout with no left-aligned lockup - it *is* the
    lockup, at size. Everything else on the card hangs off the centre line.
    """
    img = ground(T)
    d = ImageDraw.Draw(img)
    cx = W // 2

    mark_h = spec.get("mark_h", 188)
    mark = fit(os.path.join(ASSETS, T["mark"]), mark_h)

    # Measure first, then centre. A hero with no sub-line or no pills should
    # still sit on the optical centre rather than drift upward.
    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    block = mark.height + 40 + round(spec.get("word_size", 92) * 0.72) + 46
    if spec.get("tagline"):
        block += 58 * len(_wrap(probe, spec["tagline"], f("inter-600", 44), W - 320)) + 8
    if spec.get("sub"):
        block += 38 * len(_wrap(probe, spec["sub"], f("inter-500", 27), W - 380))
    if spec.get("pills"):
        block += 86
    if spec.get("strip"):
        block += 68
    y = spec.get("top", max(60, (H - block) // 2))
    img.paste(mark, (cx - mark.width // 2, y), mark)
    y += mark.height + 40

    word = wordmark(spec.get("wordmark", "COSMONAPSE"),
                    spec.get("word_size", 92), list(T["grad"]))
    if word.width > W - 220:                 # never let it touch the edges
        h = round(word.height * (W - 220) / word.width)
        word = word.resize((W - 220, h), Image.LANCZOS)
    img.paste(word, (cx - word.width // 2, y), word)
    y += word.height + 46

    d = ImageDraw.Draw(img)
    if spec.get("tagline"):
        fnt = f("inter-600", 44)
        for line in _wrap(d, spec["tagline"], fnt, W - 320):
            d.text((cx - d.textlength(line, font=fnt) / 2, y), line,
                   font=fnt, fill=T["text"])
            y += 58
        y += 8
    if spec.get("sub"):
        fnt = f("inter-500", 27)
        for line in _wrap(d, spec["sub"], fnt, W - 380):
            d.text((cx - d.textlength(line, font=fnt) / 2, y), line,
                   font=fnt, fill=T["text_dim"])
            y += 38

    pills = spec.get("pills", [])
    if pills:
        y += 34
        gap, fnt = 16, f("mono-500", 22)
        widths = [d.textlength(p["label"], font=fnt) + 44 for p in pills]
        x = cx - (sum(widths) + gap * (len(pills) - 1)) / 2
        for p, w in zip(pills, widths):
            pill(d, T, x, y, p["label"], accent=p.get("accent", False))
            x += w + gap
        y += 52

    if spec.get("strip"):
        fnt = f("mono-500", 22)
        y += 40
        d.text((cx - d.textlength(spec["strip"], font=fnt) / 2, y),
               spec["strip"], font=fnt, fill=T["text_faint"])

    os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
    img.save(out_path, optimize=True)
    return out_path
