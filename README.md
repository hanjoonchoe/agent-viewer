# agent-viewer

**English** | [한국어](README.ko.md)

A single-page web app that lists **ERC-8004 agents** from an on-chain registry and shows, at a glance, **which ones are actually alive**. It is a pure frontend for the **`agent-finder`** JSON API — no chain code here, it just fetches and renders.

![agent-viewer screenshot](docs/screenshot.png)

## Features

- **Live agent grid** — responsive card grid of every agent found in the scanned block range, with status pills (`available` / `unavailable` / `unknown` / `dead`) derived from on-chain liveness and card availability.
- **Card enrichment** — each agent's ERC-8004 registration card (`tokenURI`) is fetched client-side to show its description, thumbnail, category/tags, `x402` support, and skills with pricing.
- **Filtering & sorting** — filter by status and protocol (`a2a` / `mcp`, derived from service endpoints), sort by id or name.
- **Detail dialog** — click any card for the full record: owner (linked to Basescan), availability, liveness, card resolution, token URI, service endpoints, and skills.
- **Raw JSON** — inspect the raw API response or any single agent's record.
- **Query controls** — set `max` and `fromBlock`, reload manually or auto-reload every 30 s.

## Quick start

Prerequisites: [Node.js](https://nodejs.org) ≥ 20, [pnpm](https://pnpm.io), and a running `agent-finder` API (default `http://localhost:4100`):

```bash
# in the agent-finder repo
pnpm api        # → http://localhost:4100  (GET /api/agents?max=N&fromBlock=B)
```

Then:

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

Production build:

```bash
pnpm build        # typecheck + bundle into dist/
pnpm preview      # serve the production build
```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE` | `http://localhost:4100` | Base URL of the agent-finder API |

Set it at build/dev time, e.g.:

```bash
VITE_API_BASE=https://finder.example.com pnpm dev
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Typecheck and build for production |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run the test suite (Vitest + Testing Library) |
| `pnpm lint` | Lint with ESLint |
| `pnpm typecheck` | TypeScript type check only |

## How it works

The app calls one endpoint (CORS-enabled):

```
GET {API_BASE}/api/agents?max=<N>&fromBlock=<block>
```

and renders the returned agents. The shared response contract lives in [`src/types.ts`](src/types.ts). Status is derived as *liveness first, then availability* (`dead` overrides everything). Registration cards referenced by `tokenURI` are fetched lazily in the browser with a per-session cache; agents with unresolvable cards are still listed, showing *why* the card failed.

## Tech stack

React 18 · TypeScript (strict) · Vite · Vitest + Testing Library. No UI framework — the design system is plain CSS custom properties (see [`src/index.css`](src/index.css)).

## License

[MIT](LICENSE)
