# Genesis recordings

`/genesis` renders three `<DemoFrame />` slots that load a recording from this
folder. Until a file exists, the frame shows browser chrome with a placeholder
naming the exact path - so an empty slot still looks deliberate to a visitor,
and you never have to guess which file goes where.

## The three files

    public/genesis/canvas.mp4
    public/genesis/code.mp4
    public/genesis/test.mp4

`.mp4` and `.webm` autoplay muted on a loop; a `.gif` works too if you'd rather
(just change the `src` in `app/genesis/page.tsx` to match the extension).

## What each shot should show

**canvas.mp4** - adding a component. Open the palette, pick a primitive, name
it, and let the node land on the ring around the Synapse. The point being made
is that Genesis wrote a real module and wired it into `brain.py`, so it is
worth cutting to the Code tab for a beat to show the file that appeared. If you
can fit it, add a Receptor too - the CLI / API / chat choice is the one thing
the palette asks that nothing else does.

**code.mp4** - the interactive Code tab. Show a declaration rendered as a form
(a Neuron or an Engram both read well), change one field, save, and let the
re-read model come back. The thing to make legible is that the surrounding
source is untouched - if a module has hand-written comments above the
declaration, keep them in frame. An Axon source switch (OpenAI -> Ollama) or an
Engram shape switch is a strong second beat.

**test.mp4** - running it. Press Run, let the liveness pill go green, then
Connect and drive the Receptor: a command in the terminal panel, a request in
the API panel, or a turn in the chat panel. Whichever Receptor you demo, show
the reply arriving. If Prism is easy to open from the gear menu at the end,
that is a good handoff into the rest of the site.

## How to record one

1. Start Genesis:

       cosmo genesis

2. Open an example project with a few components already in it - the canvas
   reads as a system rather than an empty ring. Anything from
   `cosmonapse-examples/` works.
3. Screen-record the Genesis window only, not the whole desktop. 8-15 seconds
   each is plenty; these are loops, not tutorials.
4. Export 16:9 (the frame is `aspect-ratio: 16/9` and letterboxes anything
   else), keep it under ~5 MB, and save it here under the matching name.

Record in whichever theme you prefer - the frame's chrome is themed by the
site, so a dark capture on a light page still reads fine. Dark is the safer
default since it matches the site's default theme.
