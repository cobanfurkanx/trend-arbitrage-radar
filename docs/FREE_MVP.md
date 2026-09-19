# TrendCatcher: zero additional service cost MVP

The default product is a static research desk. It reuses the existing editorial UI styles, needs no database or account, and never calls an LLM from the browser. The legacy authenticated application is retained separately.

## Run locally

1. Install Node.js 24, then `npm ci`. Collection uses the system certificate store (`--use-system-ca`), preserving TLS verification on machines with managed proxy certificates.
2. Optionally put `OPENROUTER_API_KEY` in root `.env.local`. See `.env.radar.example`. No key is required to collect real source signals.
3. `npm run radar:collect` collects HN/GitHub and public TrustMRR discovery/marketplace snapshots, saves private state, and exports public cards.
4. `npm run build:free` produces `free/out/`.
5. `npm run preview:free` serves the built result on http://localhost:3101.

Use `npm run dev` for development on port 3100. `npm run radar:collect -- --no-ai` collects without any model calls. `npm run radar:export` reapplies editorial reviews without fetching or using AI.

## Where data lives

- `.radar/state.json`: private source history, cached analyses and daily API request ledger. Git ignored. Keep it between runs; deleting it also deletes quota accounting and history.
- `.radar/run.lock`: exclusive process lock. If a process was killed, verify its PID is no longer running before removing this exact lock file. Never run two writers against different copies of the same budget.
- `data/reviews.json`: manually reviewed evidence and optional rubric scores. Public editorial data; do not include private customer information.
- `free/public/data/radar.json`: public export, up to 150 active products. Contains no credentials or quota ledger. The built copy is `free/out/data/radar.json`.
- Browser local storage: saved ideas, notes, progress. Export/import backups from the saved tab. No cross-device sync.

## Collection and budget

Run `scripts/radar-cycle.ps1` to collect and rebuild every 60 minutes while this computer and process are running. `-Once` runs one cycle. Automated public refresh runs in GitHub Actions (`.github/workflows/radar-refresh.yml`, every 6 hours): collect, rebuild, commit the snapshot and deploy `free/out` to Cloudflare Pages. It needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets (`OPENROUTER_API_KEY` optional; without it sources still collect and cards show pending research).

The old database ingestion workflow is manual only. It is not part of the free pipeline.

The free pipeline enforces `openrouter/free` or an explicit `:free` model and a zero-price provider ceiling. Defaults: five attempts per run, at most 40 per UTC day across local runs. Reserve/persist quota before requests; failed requests count. Keep headroom under provider limits, including other apps using the same account. Wait between requests. Stop a batch on authentication/billing/rate errors. There is no automatic paid fallback. No key means pending research, never mock research.

Only content changes invalidate an analysis. Engagement changes update priority without calling the model again. Failed drafts wait six hours before retry, leaving room for new candidates. AI content is always a hypothesis; a model cannot promote an idea to validated. `--ai-limit=1` limits a collection run to a single model attempt.

HN/GitHub are discovery signals, not proof of customers. TrustMRR adds payment-provider-backed revenue and separate owner-reported margins through its documented free public snapshots. See [revenue sources](REVENUE_SOURCES.md) for limits, provenance, freshness and Product Hunt diagnosis. Reddit/Product Hunt stay disabled unless explicitly enabled with the required access/permission. X and Google Trends are not represented as active data sources.

Known scope: product matching uses a canonical outbound domain when available; otherwise it retains individual source URLs. False splits are preferable to conflating different products. The MVP does not yet crawl pricing pages or run automated Turkey competitor searches. Editors supply those evidence links after review. It makes no claim to identify every successful product or to guarantee speed/profitability.

## Editorial validation

### Builder-focused selection

The default early radar selects customer-facing ideas with an existing analysis, a known customer segment, easy/medium difficulty and an estimated MVP of at most 14 days. Explicit GPU or private-data requirements exclude a candidate. This is a feasibility hypothesis, not a profitability claim; unknown budgets remain visible as unknown. Choose "Tüm adaylar / bilinmeyenler" to inspect unassessed ideas.

Frameworks, SDKs, libraries and infrastructure identified in original source titles/descriptions appear under "Yapım araçları". This conservative text classifier can be wrong; it is not based on an AI-invented business angle. The collector skips these resources when allocating the free analysis budget.

New analyses include a `builder` assessment: buyer, product format, estimated upfront/monthly USD costs, API/private-data/GPU requirements, and their basis. Older cached analyses continue working; missing fields are unknown. Only existing customer text supplies a tentative segment fallback. Missing costs never pass numeric budget filters; missing dependencies never pass "not required" filters. The lean preset requires explicit ≤50 USD upfront, ≤20 USD monthly and explicit absence of GPU/private-data requirements, plus solo eligibility. Taxes, customer acquisition and developer labor are excluded from estimates.

Commercial filters distinguish payment-provider-backed revenue, editorially reviewed evidence, founder claims and pricing. Likes, AI summaries and hypothetical monetization cannot satisfy the customer-evidence filter. Priority favors customer-facing products, commercial evidence, lean/solo feasibility and reviewed distribution before source momentum. The separate revenue tab does not require an AI feasibility assessment; unknown feasibility remains visible as unknown.

The next collection enriches eligible cached analyses missing `builder`, within the same daily free quota. Export-only recomputes selection without consuming model calls.

Copy a product ID from a detail URL (`?idea=p_...`) into an entry in `data/reviews.json`:

```json
[
  {
    "productId": "p_REPLACE_WITH_REAL_ID",
    "evidence": [],
    "scores": {
      "commercial": null,
      "turkeyDemand": null,
      "distribution": null,
      "feasibility": null,
      "differentiation": null
    },
    "note": "Research not complete."
  }
]
```

Evidence fields: `kind` (`pricing`, `paying_customers`, `turkey_demand`, `competitor`, `distribution`), `claim` (specific finding), `url` (HTTP/S source), `checkedAt` (ISO UTC date), `level` (`self_reported` or `reviewed`). Mark reviewed only when you inspected support for the actual claim. A founder's uncorroborated revenue screenshot remains self_reported. A pricing page only supports pricing, not paying customers. Record search scope and alternatives in competitor findings; absence in a search is not proof of no competition.

Evidence expires from the active assessment after 30 days; future timestamps are not accepted as current evidence. A validated card needs reviewed paying-customer AND Turkey-demand evidence. Full opportunity scores additionally need distribution and competitor evidence and all five rubric values. Scores are editorial judgments, not calibrated probabilities. Use 0/25/50/75/100 anchors: absent/weak/partial/strong/very strong evidence, and explain the judgment in the note. Feasibility concerns a solo builder's three-feature MVP including operating costs. Unknown values remain null.

Run `npm run radar:export` then `npm run build:free` after editing reviews. Empty validated lists are intentional.

## Publish on your existing domain

Preferred address: `trends.shepardai.pro`. Upload **only `free/out`** to Cloudflare Pages Direct Upload and configure that subdomain in the hosting dashboard. Do not upload `.radar`, `.env*`, source state or a repository ZIP. Do not expose a database.

For `shepardai.pro/trends`, set `RADAR_BASE_PATH=/trends` in the build shell and mount the exported directory at `/trends` on the existing host. This needs compatible routing on that host. A subdomain avoids changing the existing application's routes. The existing hosting account and DNS have not been modified.

After future collection cycles, the local build changes but the hosted copy does not: upload the new `free/out` again, or rely on the scheduled GitHub Actions refresh which deploys automatically. An hourly fresh public feed needs automated deployment; the default schedule is every 6 hours. Local updates and public publication are distinct.

Free does not mean unlimited availability. If collection fails, keep the last successful cards and show source failures/staleness. If AI quota is exhausted, serve cached analyses. Check current provider terms and free quotas before deployment. Domain renewal and this computer's operation are outside the zero additional service cost claim.
