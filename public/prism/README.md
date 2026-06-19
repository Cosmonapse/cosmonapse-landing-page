# Prism recordings

Each example page renders a `<PrismPreview />` frame that loads an animated
recording from this folder. Until a file exists, the frame shows a
placeholder telling you the exact filename to drop in.

## One file per page

Each page points at its own GIF, named after the example's folder. Record
one per page and save them here with these exact names:

    public/prism/building-a-neuron.gif
    public/prism/bidding.gif
    public/prism/capability-routing.gif
    public/prism/engram-integration.gif
    public/prism/no-orchestrator.gif
    public/prism/orchestrator-api.gif
    public/prism/pathway.gif
    public/prism/rag.gif
    public/prism/rag-mcp.gif
    public/prism/real-world-neurons.gif
    public/prism/retry.gif
    public/prism/round-robin.gif

The placeholder on each page shows its own path, so you never have to guess
which file goes where  -  just match the name it prints.

## How to record one

1. Start a dev synapse (the bus) on that example's namespace, e.g. rag:
       cosmo synapse start memory --namespace=rag
2. Open Prism (live browser view at http://127.0.0.1:7071):
       cosmo doppler --prism --url=cosmo://127.0.0.1:7070 -n rag
3. In a third terminal, run that example pointed at the synapse
   (swap `MemorySynapse()` for `await connect_synapse("cosmo://127.0.0.1:7070")`,
   or set SYNAPSE_URL where the example supports it).
4. Screen-record the Prism window while the Signals animate
   (REGISTER -> TASK -> AGENT_OUTPUT -> FINAL). 5-10 seconds is plenty.
5. Export as a looping GIF, 16:9 crop, < ~5 MB, and save it here under the
   matching name above.

## Want them all to share one recording instead?

Save a single `prism-demo.gif` here and change each page's component back to
the default by removing the `src=` prop, or point every `src` at
`/prism/prism-demo.gif`.
