# TrendCatcher

**Live demo: https://trendcatcher-shepardai.pages.dev/**

Free research desk for Turkish solo builders. Real foreign product signals, explicit evidence levels, narrow MVP plans and a private browser notebook. The editorial paper/serif UI is retained.

**No server, database or paid model required for the default MVP.** AI runs during collection and its cached output is shared by all readers. No AI keys enter the static site.

## Start

**Use the live site, no install needed: https://trendcatcher-shepardai.pages.dev/**

Run locally only if you want to collect or develop:

Node.js 24 is required for collection with system CA trust.

```sh
npm ci
npm run radar:collect
npm run build
npm start
```

Local preview: http://localhost:3101. For development: `npm run dev` (port 3100).

Optionally put `OPENROUTER_API_KEY` in root `.env.local`. Only free models are accepted; maximum 40 attempts per UTC day and five per run by default. Without a key, source collection still works and cards honestly show pending research. See `.env.radar.example`.

## Product

- Early radar and separately reviewed opportunities.
- Unique source records, canonical product matching and observed engagement history.
- Unknown commercial/Turkey scores stay unknown; no fabricated success percentages.
- Cached Turkish research: customer, problem, at most three MVP features, 48-hour validation, stop criteria and acquisition hypotheses.
- Downloadable Markdown development prompt, editable unit economics.
- Local saved ideas, progress, notes and JSON backup/import. No signup.

## Commands

| Command | Action |
|---|---|
| `npm run radar:collect` | Fetch sources, analyze within free quota, export public JSON |
| `npm run radar:collect -- --no-ai` | Fetch only; no model calls |
| `npm run radar:export` | Reapply editorial evidence without network/model calls |
| `npm run build` | Build static site to `free/out` |
| `npm start` | Preview static site locally on 3101 |
| `npm run dev` | Develop on 3100 |
| `npm test` | Logic and quota regression tests |
| `npm run test:browser` | Built-site browser checks (Edge locally) |
| `npm run typecheck` / `npm run lint` | Type and lint checks |

`scripts/radar-cycle.ps1` collects and rebuilds every 60 minutes while running. No schedule or deployment is installed automatically. The private `.radar` directory preserves history, API quota and cached analyses across runs.

## Publish

Live deployment: **https://trendcatcher-shepardai.pages.dev/** (Cloudflare Pages, `free/out`).

Upload only `free/out` to a static host such as Cloudflare Pages. Recommended existing-domain address: `trends.shepardai.pro`. For a subpage build, set `RADAR_BASE_PATH=/trends` and mount at `/trends` on the existing host. DNS and hosting are not changed by local builds.

[Full operations, evidence editing and zero-cost deployment instructions](docs/FREE_MVP.md).

## Evidence boundary

HN/GitHub discovery is live-capable. Reddit/Product Hunt are opt-in with appropriate access. Turkey competitor research and revenue corroboration are editorial tasks in this MVP; AI summaries do not verify them. No fabricated demo content is exported. Each reader sees the last published snapshot, not a live provider query.

The old authenticated Next.js/Prisma application remains under `src/app`, with `dev:legacy`, `build:legacy`, and `start:legacy`. It is not the default public product. Old database ingestion is manual-only. [Archived setup](docs/LEGACY_README.md).
