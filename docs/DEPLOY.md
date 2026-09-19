# Deploy — live for $0

Target: Vercel Hobby (app) + Neon Postgres (DB) + GitHub Actions cron
(ingest). No card, no custom domain (`*.vercel.app`).

Why this split: SQLite does not survive serverless filesystems, so the DB
must be external. A full ingest takes minutes, beyond serverless timeouts,
so the pipeline runs in Actions against the prod DB. The web app only reads.

## 1. Push the repo

```bash
.\scripts\publish.ps1 -Message "Trend Arbitrage Radar MVP" -Remote https://github.com/<user>/<repo>.git
```

Then create an empty GitHub repo at that URL first if it does not exist
(script prints the exact fallback commands too).

## 2. Database (Neon, free)

1. neon.tech → new project → copy the connection string.
2. In `prisma/schema.prisma`: `provider = "sqlite"` → `"postgresql"`.
   Commit and push (CI must stay green).
3. Create tables once, from any machine with the repo:
   `DATABASE_URL="<neon-string>" npx prisma db push`

## 3. App (Vercel Hobby, free)

vercel.com → Add New → Project → import the repo. Environment variables:

```
DATABASE_URL=<neon-string>
JWT_SECRET=<32+ random chars, required>
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=<key>
GITHUB_TOKEN=<token>
PRODUCT_HUNT_TOKEN=<token>
DEMO_MODE=false
NEXT_PUBLIC_DEMO_MODE=false
CRON_SECRET=<32+ random chars>
PRUNE_AFTER_DAYS=7
NEXT_PUBLIC_APP_NAME=Trend Arbitrage Radar
```

Deploy. Note the `*.vercel.app` URL.

## 4. Ingest cron (GitHub Actions, free)

Repo → Settings → Secrets and variables → Actions. Add:

```
PROD_DATABASE_URL=<neon-string>
OPENROUTER_API_KEY=<key>
PROD_GITHUB_TOKEN=<token>
PROD_PRODUCTHUNT_TOKEN=<token>
```

Actions → “Ingest (every 12h)” → Run workflow. First run backfills
(everything analyzes, ~5 min, mock fallback covers AI quota gaps).
After that it runs on schedule; unchanged clusters skip via fingerprint.

## 5. Verify

- `<app>/admin` — source rows green with counts.
- `<app>/dashboard` — comparison rows render, no “Demo Verisi” labels.
- Open any row — dossier page resolves (ids are slugified).
- Sign up through the UI for the first prod user.

## Local dev stays untouched

SQLite, `DEMO_MODE=true`, `npm run dev` on :3100. Windows Task Scheduler
remains a valid local alternative to the Actions cron
(`schtasks /create /tn "TrendCatcher Ingest" /sc hourly /mo 12 /tr "cmd.exe /c cd /d <repo> && npm run ingest >> cron.log 2>&1"`).
