# Legacy database application (archived instructions)

The default product is now the static free MVP. Follow ../README.md and FREE_MVP.md for current setup. Commands and hosting claims below describe the previous version.

Profit-first copy radar: ingests early signals from foreign launch sources,
scores how fast each trend can be cloned for Turkey, and hands founders a
build playbook. Next.js 14 / TypeScript / Tailwind / Prisma.

Status: realtime. HN, Reddit, GitHub live; Product Hunt live with a token.
Big-tech launches excluded (indie-only policy); profit filter on dashboard.
`DEMO_MODE=true` restores the synthetic catalog for zero-key boots.

## Quickstart

```bash
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev    # http://localhost:3100
```

Seed creates `demo@trendradar.app` / `demo1234`.

## Scripts

| Command | Effect |
|---|---|
| `npm run dev` / `build` / `start` | dev server / production build / serve |
| `npm run typecheck` / `lint` / `test` | `tsc --noEmit` / eslint / vitest |
| `npm run ingest` | one pipeline run, prints JSON summary |
| `npm run scheduler` | loop: ingest every `INGEST_INTERVAL_HOURS` (12) |
| `npm run rescore` | recompute overall scores from stored sub-scores, no LLM calls |
| `npm run clean-demo` | delete synthetic rows only (keeps users, saves, live data) |
| `npm run reset-data` | wipe all trend data, keep users (then re-ingest) |
| `npm run db:reset` | drop + recreate DB, reseed |

CI runs typecheck, lint, tests, build on push/PR. Ingest runs every 12h in
Actions, directly against prod (serverless timeouts rule out in-function runs).

## Environment

| Var | Default | Scope |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite locally; Postgres string in prod (`provider` → `postgresql` in schema) |
| `JWT_SECRET` | — | required in prod; loud warning otherwise |
| `SESSION_DAYS` | `30` | session cookie lifetime |
| `AI_PROVIDER` | `mock` | `mock` / `openai` / `openrouter` / `agentrouter`; unknown → mock with warning, never throws |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | — / `gpt-4o-mini` | `AI_PROVIDER=openai` |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | — / `openrouter/free` | `AI_PROVIDER=openrouter` |
| `AGENTROUTER_API_KEY` / `AGENTROUTER_BASE_URL` / `AGENTROUTER_MODEL` | — | `AI_PROVIDER=agentrouter` |
| `GITHUB_TOKEN` | — | optional; raises GitHub rate limit 60 → 5000/hr |
| `PRODUCT_HUNT_TOKEN` | — | required for live Product Hunt (OAuth app or Developer Token, Bearer) |
| `DEMO_MODE` | `true` | `false` = realtime only, synthetic catalog never merged |
| `INGEST_INTERVAL_HOURS` | `12` | scheduler cadence |
| `PRUNE_AFTER_DAYS` | `7` | archive ACTIVE trends unseen this long (saved ones exempt) |
| `CRON_SECRET` | — | when set, `POST /api/ingest` requires it (`x-cron-secret` / `?secret=`) |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_DEMO_MODE` | — / `true` | public name; `false` hides demo labels |

No secret reaches the client. CLI entries load `.env` via `dotenv`.

## Layout

```
prisma/            schema, seed, clean-demo, reset-data
src/lib/sources/   TrendSource interface + 6 providers (HN/Reddit/GitHub/PH live-capable)
src/lib/ingest/    cluster, run (pipeline), batch (fingerprint, concurrency), cli
src/lib/scoring/   weights config, engine, rescore script
src/lib/ai/        provider interface, OpenAI/OpenRouter/AgentRouter, mock fallback, prompts, zod schemas
src/app/api/       opportunities, trends, search, dashboard, ingest, auth, preferences, admin/status
src/app/           landing, dashboard, opportunities/[id], saved, onboarding, admin, auth pages
src/components/    cards, scores, filters, heatmaps, build-plan modal
```

## Docs

- `docs/ARCHITECTURE.md` — pipeline, scoring, AI fallback, id stability, lifecycle
- `docs/DEPLOY.md` — $0 runbook: GitHub → Neon → Vercel → Actions cron
- `docs/OPERATIONS.md` — monitoring, crons, troubleshooting
