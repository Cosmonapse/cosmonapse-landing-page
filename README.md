# Cosmonapse — Landing Page

The marketing + docs surface for [Cosmonapse](../README.md), the distributed cognition protocol for autonomous AI agents.

Built with Next.js 14 (App Router) and deployed on Vercel.

## Pages

| Route | Source content |
|---|---|
| `/` | Home — hero, what Cosmonapse ships, terminology preview |
| `/protocol` | Envelope specification — fields, message types, validation |
| `/concepts` | Terminology — Brain, Neuron, Axon, Dendrite, Synapse, Signal, Pathway, Engram, Doppler |
| `/docs` | Reference — Python SDK, TypeScript SDK, `cosmo` CLI |
| `/examples` | End-to-end topologies — round-robin, no-orchestrator, capability routing, bidding, pathway, real-world neurons |
| `/quickstart` | Install + first-five-minutes example |
| `/roadmap` | v0.1 → v0.4 |

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Subsequent deploys: `vercel --prod`.

### Option B — Git push

1. Push this folder to a GitHub repo.
2. Go to <https://vercel.com/new>, import the repo.
3. Vercel auto-detects Next.js — no configuration needed.
4. Click Deploy.

Vercel auto-deploys every push to the main branch.

## Stack

- **Next.js 14** — App Router, static rendering where possible
- **React 18**
- **TypeScript** — strict mode
- **Plain CSS** — no Tailwind, no CSS-in-JS; design tokens in `app/globals.css`
- **Google Fonts** — Inter + JetBrains Mono via `next/font`

No build configuration on Vercel is required. The default Next.js preset works.

## Content sources

The page content is hand-written from the canonical Cosmonapse design documents in the parent directory:

- `../ENVELOPE_SPEC.md` — feeds `/protocol`
- `../SDK_DESIGN.md` — feeds `/quickstart` and parts of `/`
- `../ENGRAM_DESIGN.md` — feeds Engram sections of `/concepts`, `/protocol`, and `/docs`
- `../CHANGELOG.md` — release notes that should be reflected in `/roadmap` and the home page

When those source documents change, the corresponding page in this site needs to be updated by hand. There is no MDX or CMS layer.

## License

TBD.
