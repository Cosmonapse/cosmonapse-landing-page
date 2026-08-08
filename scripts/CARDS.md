# Cosmonapse cards

`cards.py` renders content cards - a code snippet, a terminal transcript, a
comparison table, a before/after split, a single statement, or a small
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

| `shape` | silhouette | colour source |
| --- | --- | --- |
| `neuron` / `axon` | circle | `theme.ts` `neuron` |
| `engram` | rounded square | `theme.ts` `engram` |
| `effector` | hexagon | `theme.ts` `effector` |
| `receptor` | a cup, open at the top | `theme.ts` `receptor` |
| `synapse` | a ring | `theme.ts` `synapse` |

The receptor cup is open upward on purpose - it collects from outside the
fabric rather than servicing something inside it.

Edges take an optional third element, drawn as a label above the arrow.

## Importing it

```python
from cards import render, THEMES, OVERFLOW

render(spec, "out.png", theme="light")
assert not OVERFLOW
```

`OVERFLOW` accumulates across calls in a process; check it once at the end
rather than after each card.
