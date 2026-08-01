# Genesis screenshots

`/genesis` renders three `<DemoFrame />` slots that load a screenshot from
this folder, and `/core/quickstart` (the Genesis tab) renders a fourth. Until
a file exists, the frame shows browser chrome with a placeholder naming the
exact path - so an empty slot still looks deliberate to a visitor, and you
never have to guess which file goes where.

## The four files

    public/genesis/canvas.jpg
    public/genesis/code.jpg
    public/genesis/test.jpg
    public/genesis/quickstart.jpg

`.jpg`, `.png` and `.gif` all render as a plain `<img>`; an `.mp4` or `.webm`
autoplays muted on a loop instead if you'd rather go back to video (just
change the `src` in `app/genesis/page.tsx` or
`app/core/quickstart/QuickstartTabs.tsx` to match the extension).

## What each shot should show

**canvas.jpg** - a component just added. The palette open or just closed,
a new node landed on the ring around the Synapse, mid-wire into `brain.py`.
The point being made is that Genesis wrote a real module, so a beat that
also shows the Code tab with the new file is worth a second shot if you
want to string a couple together later.

**code.jpg** - the interactive Code tab. A declaration rendered as a form
(a Neuron or an Engram both read well), mid-edit on one field. The thing to
make legible is that the surrounding source is untouched - if a module has
hand-written comments above the declaration, keep them in frame.

**test.jpg** - running it. The liveness pill green after Run, and the
Connect panel open - a command in the terminal panel, a request in the API
panel, or a turn in the chat panel, with a reply already on screen.

**quickstart.jpg** - the first five minutes, captured at the moment a reply
comes back through a freshly-dropped Receptor: a Neuron and a Receptor on an
otherwise empty ring, Run green, Connect open with the reply visible. This is
the one visitors on `/core/quickstart` see before they've read anything else
about Genesis, so it should read as a complete loop on its own rather than
assuming the context the `/genesis` page builds up.

## How to capture one

1. Start Genesis:

       cosmo genesis

2. Open an example project with a few components already in it - the canvas
   reads as a system rather than an empty ring. Anything from
   `cosmonapse-examples/` works. For quickstart.jpg, start from an *empty*
   scaffold instead, since the point is the first-run experience.
3. Screenshot the Genesis window only, not the whole desktop.
4. Export 16:9 (the frame is `aspect-ratio: 16/9` and letterboxes anything
   else), keep it under ~1 MB, and save it here under the matching name.

Capture in whichever theme you prefer - the frame's chrome is themed by the
site, so a dark capture on a light page still reads fine. Dark is the safer
default since it matches the site's default theme.
