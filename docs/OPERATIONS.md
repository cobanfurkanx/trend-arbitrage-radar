# Operations

## Monitoring

- App health: `<app>/admin` (signal/cluster/opportunity counts, per-source
  status, last ingestion time).
- Cron runs: GitHub repo → Actions → “Ingest (every 12h)” (duration, per-run
  summary: analyzed / skipped / pruned / signals).
- Local scheduler alternative: `cron.log` tail.

## Routine tasks

| Task | Command |
|---|---|
| Manual refresh | `npm run ingest` (or dashboard Refresh button where unlocked) |
| Recompute scores after weight edits | `npm run rescore` |
| Purge synthetic rows only | `npm run clean-demo` |
| Full trend wipe, keep users | `npm run reset-data` + `npm run ingest` |
| Rotate ingest/auth secrets | update env + provider dashboards; no code change |

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `429 free-models-per-day` in logs | OpenRouter free quota (50/day) spent | Wait for reset; analyses fall back to mock meanwhile. Add credits for 1000/day. |
| Reddit `403` | IP-based block, intermittent | Nothing to fix; per-source isolation + retry covers it. Persistent block → Reddit OAuth (script app). |
| Product Hunt `400 query_missing` | fixed: `body` was never sent | Already fixed; error bodies now surface in logs. |
| Product Hunt `401` | token expired/revoked | Reissue at producthunt.com/v2/oauth/applications, update env/secret. |
| Detail page 404 | pre-slugify ids (slashes/colons in titles) | Fixed via `slugify()`; legacy rows need `reset-data` + re-ingest. |
| `mode: "insensitive"` Prisma error | Postgres-only operator on SQLite | Removed; SQLite LIKE is ASCII case-insensitive. |
| `.next` vendor-chunk `MODULE_NOT_FOUND` | corrupt build cache | `Remove-Item -Recurse -Force .next` + rebuild. |
| tsx CLI missing env | tsx does not read `.env` | All CLI entries import `dotenv/config`. Next.js dev/prod loads it natively. |
| Vitest install `ERESOLVE` | v5 needs `@types/node` ≥22, repo pins 20 | Pinned `vitest@^2.1.8`. |

## Quotas (free tier, approximate)

OpenRouter free: 50 model req/day. GitHub unauthenticated: 60 req/hr,
authenticated: 5000/hr. Neon free: suffices for this workload by 2+ orders of
magnitude. Vercel Hobby: fine for read-heavy dashboard traffic.
