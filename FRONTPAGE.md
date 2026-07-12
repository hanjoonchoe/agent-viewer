# Agent Viewer — Front Page Design Brief

A single web page that **lists ERC-8004 agents** from the on-chain registry and
shows, at a glance, **which ones are actually alive**. It's a pure frontend — it
reads everything from the `agent-finder` JSON API (a separate repo/service).

> **Icons:** use inline **SVG icons** (e.g. [Lucide](https://lucide.dev) or
> [Heroicons](https://heroicons.com)) for the status indicators — **do not use
> emoji.** Specific icon suggestions are given per state below.

---

## 1. Data source

The page calls one endpoint (CORS is enabled):

```
GET http://localhost:4100/api/agents?max=<N>&fromBlock=<block>
```

Response:

```jsonc
{
  "network": "base-sepolia",
  "chainId": 84532,
  "fromBlock": "43840209",
  "count": 6,
  "agents": [
    {
      "agentId": "7800",
      "owner": "0x6ae1…91A9",
      "name": "smoke-paid-mrb0d5vy 7088",   // null if card unresolvable
      "cardOk": true,
      "cardReason": "card-ok",              // e.g. "HTTP 404", "empty uri" when !cardOk
      "availability": "available",          // available | unavailable | unknown
      "liveness": "alive",                  // alive | dead | unknown
      "services": ["https://…/a2a", "…"],   // endpoint URLs from the card
      "tokenURI": "https://… or data:…"
    }
  ]
}
```

## 2. Page structure

```
┌─ Header (sticky) ───────────────────────────────────────────────┐
│  agent · finder            [network badge]      max[__] from[__] [Load] │
├─────────────────────────────────────────────────────────────────┤
│  meta line:  "6 agents · from block 43840209"                    │
│                                                                   │
│  ┌ agent card ┐  ┌ agent card ┐  ┌ agent card ┐  … (responsive grid) │
│  └────────────┘  └────────────┘  └────────────┘                   │
└───────────────────────────────────────────────────────────────────┘
```

- **Header:** product name, a **network badge** (`base-sepolia · 84532`), and controls: `max` (number), `fromBlock` (text, optional — blank = recent window), and a **Load** button.
- **Meta line:** `{count} agents · from block {fromBlock}`.
- **Grid:** responsive cards, ~320–360px min width, auto-fill.

## 3. Agent card anatomy

Each card shows:

- **`#{agentId}`** — monospace, muted/accent.
- **Name** — if `cardOk`, the `name`; else a muted "no card" line showing `cardReason` (e.g. *"card unavailable — HTTP 404"*).
- **Status indicator** (top-right) — **SVG icon + short label**, see §4.
- **owner** — truncated address `0x6ae1…91A9`.
- **services** — the endpoint URLs (monospace, subtle). Omit the row if none.

## 4. Status states → SVG icons (NOT emoji)

Derive the state from `liveness` first, then `availability`:

| State | Condition | Icon (suggestion) | Color | Label |
|---|---|---|---|---|
| **Available** | `availability === "available"` | Lucide `circle-check` / `badge-check` | green | "available" |
| **Unavailable** | `availability === "unavailable"` | Lucide `clock` / `loader` | amber | "unavailable" |
| **Unknown** | `availability === "unknown"` | Lucide `help-circle` | gray | "unknown" |
| **Dead** | `liveness === "dead"` (overrides above) | Lucide `skull` / `x-octagon` | red | "dead" |

Render as a small pill/badge: `[icon] label`. Icons should be inline SVG (imported from the icon set), sized ~14–16px, color-matched to the state.

## 5. States

- **Loading** — while fetching: a centered "Scanning the chain…" with a spinner (SVG).
- **Empty** — `count === 0`: "No agents found in this range."
- **Error** — API `error` field or network failure: show the message in a red panel.

## 6. Interactions

- On load: fetch with defaults (no `fromBlock` → API uses a recent window → live agents).
- Changing `max` / `fromBlock` + **Load** → refetch.
- (Optional, nice) clicking a card's `#id` opens the agent on Basescan:
  `https://sepolia.basescan.org/token/<identityRegistry>?a=<agentId>` — or just link the owner address to `https://sepolia.basescan.org/address/<owner>`.

## 7. Visual direction

Developer-tool aesthetic: **dark**, high-contrast, monospace for ids/addresses/endpoints, generous spacing, subtle borders. Calm by default; **color only carries meaning** (the status states). Think a clean block-explorer, not a marketing page. (Designer has latitude — this is direction, not law.)

## 8. Tech notes

- Pure frontend (React/Vite, or plain HTML/JS — designer's choice). No backend logic here.
- The only dependency is the API at `http://localhost:4100` (make the base URL configurable via an env/const).
- The API is CORS-enabled, so a dev server on another port works directly.
- Handle the `null` name and non-200 states gracefully — a lot of real agents have broken cards; showing *why* (the `cardReason`) is part of the value.
