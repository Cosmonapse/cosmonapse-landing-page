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
        mark="logowork-light.png", word_tint=_rgb("#25507a"),
        glows=((250, 340, 380, "accent", 0.10),
               (1420, 780, 360, "accent_3", 0.07)),
        ghost_alpha=0.05,
    ),
}

PRIMITIVE_KEY = {
    "neuron": "p_neuron", "axon": "p_neuron",
    "engram": "p_engram", "effector": "p_effector",
    "receptor": "p_receptor", "synapse": "p_synapse",
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
    w = r * 1.15
    if shape in ("neuron", "axon"):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=label_colour, width=3)
    elif shape == "engram":
        d.rounded_rectangle([cx - w, cy - r, cx + w, cy + r], radius=10,
                            outline=label_colour, width=3)
    elif shape == "effector":
        pts = [(cx + w * 1.0, cy), (cx + w * 0.5, cy - r), (cx - w * 0.5, cy - r),
               (cx - w * 1.0, cy), (cx - w * 0.5, cy + r), (cx + w * 0.5, cy + r)]
        d.polygon(pts, outline=label_colour, width=3)
    elif shape == "receptor":
        # a cup: open at the top, because a Receptor collects from outside.
        d.arc([cx - w, cy - r, cx + w, cy + r * 1.5], start=0, end=180,
              fill=label_colour, width=3)
        d.line([(cx - w, cy - r), (cx - w, cy + r * 0.25)], fill=label_colour, width=3)
        d.line([(cx + w, cy - r), (cx + w, cy + r * 0.25)], fill=label_colour, width=3)
    else:                                   # synapse - a ring
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=label_colour, width=3)
        d.ellipse([cx - r * 0.45, cy - r * 0.45, cx + r * 0.45, cy + r * 0.45],
                  outline=label_colour, width=2)


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
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2 - 26
        d.text((mx - d.textlength(label, font=fnt) / 2, my), label,
               font=fnt, fill=T["text_faint"])


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


KINDS = ("code", "term", "table", "split", "quote", "diagram")


def render(spec: dict, out_path: str, theme: str = "dark") -> str:
    """Render one card spec to a PNG. Returns the path written."""
    T = THEMES[spec.get("theme", theme)]
    kind = spec["kind"]
    if kind not in KINDS:
        raise ValueError(f"unknown card kind {kind!r}; expected one of {KINDS}")

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
        for n in nodes:
            cx, cy = pos[n["id"]]
            colour = T[PRIMITIVE_KEY.get(n.get("shape", "neuron"), "p_neuron")]
            _node_shape(d, T, cx, cy, r, n.get("shape", "neuron"), colour)
            fnt = f("mono-500", 22)
            d.text((cx - d.textlength(n["label"], font=fnt) / 2, cy + r + 16),
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
