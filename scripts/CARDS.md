# Cosmonapse cards

`cards.py` renders content cards - a code snippet, a terminal transcript, a
comparison table, a before/after split, a single statement, a title card, or a small
node-and-edge diagram - on the same ground the Open Graph images use.

It is a companion to `make-og.py`, not a replacement: `make-og.py` renders the
site's social previews, `cards.py` renders the things you put *in* a post, a
release note, or a README.

**No colour is invented here.** The palettes in `cards.py` are transcribed from
`app/globals.css` (`:root` and `[data-theme="light"]`) and, for the
per-primitive silhouette hues, from `packages/prism-ui/src/theme.ts`. If you
change a token in either place, change it here too - that is the one manual
link in the chain, and it is deliberate: a Python renderer cannot import CSS
custom properties.

## Running it

```bash
pip install pillow fonttools brotli

python make-cards.py specs.json out/                 # dark
python make-cards.py specs.json out/ --theme light
python make-cards.py specs.json out/ --theme both    # name.png + name-light.png
```

Fonts come from `.next/cache/og-fonts/`, populated by `make-og.py`. Run the
site build (or `make-og.py`) once before the first card render.

Exit code is non-zero if any card overflows its panel, so this is safe to wire
into CI as a regression check on a committed spec file.

## Card kinds

Every spec is an object with `kind`, plus the keys that kind needs. These are
common to all of them:

| key | default | meaning |
| --- | --- | --- |
| `file` | `card-NN` | output basename, no extension |
| `eyebrow` | none | small tracked label above the headline |
| `headline` | none | the claim; wraps to two lines, then truncates |
| `theme` | CLI `--theme` | per-card override |
| `note` | `pip install cosmonapse` | footer left |
| `note_right` | `cosmonapse  ·  Apache 2.0` | footer right |

Type auto-shrinks to fit the panel, so `size` / `lh` are a starting point
rather than a guarantee. Horizontal overflow is *reported*, not fixed - if a
line is too wide, shorten the line.

### `code`

Syntax-highlighted Python in a window frame.

```json
{ "kind": "code", "title": "receptors/terminal.py",
  "body": ["from cosmonapse import CliReceptor", "", "RECEPTOR = CliReceptor(...)"],
  "size": 27, "lh": 40, "gutter": false }
```

`gutter: true` adds line numbers. The highlighter is deliberately small -
keywords, strings, comments, numbers, decorators, and call sites. It is not a
parser and does not need to be.

### `term`

A terminal transcript. The first two characters of each line pick its role:

| prefix | renders as |
| --- | --- |
| `$ ` | a prompt, in accent, bold |
| `# ` | a comment, dimmed |
| `> ` | a note, in accent-2 |
| `+ ` | success |
| `! ` | a warning |
| `x ` | an error |
| (none) | plain output |

The prefix is stripped before drawing, except for `# `, which keeps its hash.

### `table`

```json
{ "kind": "table", "title": "the dispatch trio",
  "headers": ["MODE", "RECEPTOR", "RETURNS"],
  "cols": [190, 300, 400],
  "body": [["send", "rx.send(x)", "the emitted TASK"]] }
```

`cols` are pixel offsets, not widths that wrap - the renderer warns if their
sum exceeds the panel. An empty row `["", ""]` is a spacer.

### `split`

Two panels, for before/after and this-versus-that. `mode: "term"` renders both
sides as transcripts instead of code.

```json
{ "kind": "split",
  "left_title": "without a Receptor",  "left": ["..."],
  "right_title": "with a Receptor",    "right": ["..."],
  "mode": null, "size": 23, "lh": 34 }
```

The left panel is titled in accent-3 and the right in the success colour, so
"the bad one" and "the good one" read at a glance. Put the *old* thing left.

### `quote`

One statement in large type, with an accent rule and no panel. For punchy
posts and section breaks.

```json
{ "kind": "quote",
  "body": "Neurons think. Engrams remember. Effectors act. Receptors listen.",
  "attribution": "cosmonapse 0.1.11 - the interface primitive" }
```

`body` is a single string and wraps on its own. Keep it under about 90
characters or the type gets small enough to defeat the point.

### `hero`

The title card: centred mark, gradient wordmark, tagline, pills. The one
layout with no left-aligned lockup and no footer - it *is* the lockup, at
size, and everything hangs off the centre line. The block is measured and
then vertically centred, so a hero with no `sub` or no `pills` still sits on
the optical centre.

```json
{ "kind": "hero",
  "tagline": "A distributed agent-to-agent protocol",
  "sub": "Agents are peers. Coordination is messages on a shared bus.",
  "pills": [{"label": "Apache 2.0"}, {"label": "Python"},
            {"label": "$ pip install cosmonapse", "accent": true}],
  "strip": "Neurons think  ·  Engrams remember  ·  Effectors act  ·  Receptors listen" }
```

`accent: true` on a pill outlines it in the accent instead of the border
colour - use it on exactly one pill, the call to action.

The wordmark is **set in Michroma**, the same face `globals.css .brand-word`
uses, at its `letter-spacing: 0.06em`. It is live type rather than a paste of
`wordwork.png`, so a size change re-renders instead of resampling and the
`--grad-1 -> --grad-2 -> --grad-3` ramp lands on the glyphs at full
resolution. Michroma ships in one weight; there is no bold.

`wordmark` sets the string (default `"COSMONAPSE"`), `word_size` its point
size, and `mark_h` / `top` override the logo height and vertical origin. The
wordmark auto-shrinks if it would reach the card edges.

### `diagram`

Nodes and edges, using the Prism silhouettes and per-primitive colours.

```json
{ "kind": "diagram", "title": "Constellation",
  "nodes": [
    {"id": "rx", "label": "terminal",  "shape": "receptor", "col": 0},
    {"id": "n",  "label": "assistant", "shape": "neuron",   "col": 1},
    {"id": "e",  "label": "search",    "shape": "effector", "col": 2, "row": 0},
    {"id": "g",  "label": "store",     "shape": "engram",   "col": 2, "row": 1}
  ],
  "edges": [["rx", "n", "entry"], ["n", "e", "TOOL_CALL"], ["n", "g", "RECALL"]] }
```

`col` places a node left-to-right, `row` orders it within its column. Layout is
otherwise automatic and columns are centred vertically. Shapes:

Shapes and colours match `cosmonapse-core/assets/diagrams/primitives-*.svg`,
the canonical figure, whose own comment is the rule: *"Neurons accent, Engrams
--p-engram, Effectors accent-3, Receptors accent-2. A component wears one
colour across the suite."*

| `shape` | silhouette | colour (`palette: "suite"`) |
| --- | --- | --- |
| `neuron` / `axon` | circle | `--accent` |
| `engram` | diamond | `--p-engram` |
| `effector` | triangle | `--accent-3` |
| `receptor` | a cup, open at the top | `--accent-2` |
| `synapse` | the bus bar | `--accent-2` |

The receptor cup is open upward on purpose - it collects from outside the
fabric rather than servicing something inside it.

**Two palettes.** `"palette": "suite"` (the default) is the mapping above, and
is right for any figure that *explains* the primitives. `"palette": "prism"`
switches to the hues the live Constellation paints nodes with
(`prism-ui/src/theme.ts` - amber effectors, lime receptors) and should only be
used when the card depicts an actual Prism view. Do not mix them on one card.

Edges take an optional third element, drawn as a label - above a horizontal
arrow, beside a vertical one. A node with an edge dropping straight down is
labelled above itself so the arrow does not run through its own caption.

## Importing it

```python
from cards import render, THEMES, OVERFLOW

render(spec, "out.png", theme="light")
assert not OVERFLOW
```

`OVERFLOW` accumulates across calls in a process; check it once at the end
rather than after each card.
