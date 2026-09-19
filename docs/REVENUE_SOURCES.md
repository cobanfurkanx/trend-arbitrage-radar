# Revenue discovery (2026-09-18)

The zero-cost collector now uses two documented public TrustMRR snapshots:

- `https://trustmrr.com/api/ai/discovery`: recently added and fastest-growing startups (25 each).
- `https://trustmrr.com/api/ai`: recently listed businesses and best deals (up to 25 each).
- Up to eight official `/startup/{slug}.md` profiles per endpoint enrich product descriptions, founder-provided positioning, founding dates and revenue sync timestamps. Four requests run concurrently; failures retain summary data. No website crawling, authenticated access or paid API is required.

Documentation: https://trustmrr.com/llms.txt and https://trustmrr.com/faq.

These are two feeds from **one platform**, not independent corroboration. The public snapshots are a bounded selection, not a full-market search. Founder descriptions and positioning are untrusted claims. Only payment-provider-derived revenue fields get the corresponding evidence label.

## Selection and interpretation

Anonymous, empty, invalid and zero-last-30-day-revenue records are excluded. Obvious manual-service businesses are excluded when their description lacks software context. Signals merge by product URL, while unrelated App Store, Google Play and TrustMRR paths remain separate. Existing source/state data is preserved on network failures.

The revenue tab works without an LLM analysis. Default: at least USD 100 in last-30-day revenue. Presets: growing revenue; founded within 180 days with at least USD 100; positive owner-reported profit margin; all positive-revenue products. Sorting favors meaningful growing revenue and known younger businesses; extreme growth percentages from tiny bases do not win on percentage alone.

Revenue, MRR, total revenue and owner-reported profit margin are stored separately. A founding date is never labeled a first-sale date. First-sale latency and independently verified net profit remain unknown. Observed-at is the fetch timestamp, not the startup launch date or provider sync timestamp. Revenue snapshots expire from the revenue selection after seven days; known provider sync age must also pass this window. Unknown provider sync time is displayed explicitly. Revenue does not validate Turkish demand, acquisition costs, or solo feasibility.

Free-model output also passes conservative content rejection gates: completed experiments presented as future validation, revenue-only validation lists, unsupported Turkey-first claims, and explicit unknown architecture contradicted by zero-cost claims are rejected. These are minimum gates, not general automated fact-checking. Three live drafts failed this review and were removed from the cache; source revenue records remain usable without an AI draft. Failed attempts remain charged against the existing request quota.

## Product Hunt diagnosis

Live test: existing token returned HTTP 200; the full provider returned 20 newest posts with descriptions and outbound links. The collector is disabled because `RADAR_PH_APPROVED` is false. Do not mistake disabled configuration for API downtime.

Previously, HTTP-200 GraphQL errors and missing `data.posts.edges` silently became a successful empty list. Regression tests reproduce this; the provider now rejects those responses, accepts a genuine empty list, collects full descriptions and orders by newest. Safe source diagnostics expose no credentials or raw remote errors.

`npm run radar:diagnose` probes the configured PH token without exporting records or changing approval settings. PH's docs require contacting them for commercial API use: https://www.producthunt.com/v2/docs. Only set `RADAR_PH_APPROVED=true` when permission covers intended use.

## Run

`npm run radar:collect -- --no-ai` refreshes all enabled sources without AI requests. `npm run radar:collect -- --ai-limit=3` also generates at most three free-model analyses, prioritizing commercial evidence. `npm run build` publishes the updated snapshot to the local static preview at port 3101. The existing optional collection loop also picks up these sources. No new scheduler or external deployment is installed.
