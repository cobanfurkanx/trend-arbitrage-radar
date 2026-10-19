# TrendRadar engineering teardown

[Product](https://trendradar.shepardai.pro/) · [Portfolio case study](https://cobanfurkanx.github.io/trendradar-case-study/)

TrendRadar turns foreign product signals into a Turkish research desk with source links, evidence labels and scoped MVP hypotheses. The public application is a static Next.js export. Collection and optional AI enrichment happen before publication, never on a reader's request path. The legacy Prisma/authenticated app is separate from this product.

```text
HN / GitHub / TrustMRR → normalize + identify → private state
    → optional quota-limited AI + editorial evidence → public JSON
    → Next.js static export → Cloudflare Pages → browser notebook
```

## 1. Product identity and repeat collection

[`engine.ts`](../src/lib/radar/engine.ts) canonicalizes HTTP(S) URLs, removes fragments and tracking parameters, sorts query parameters and hashes identities with SHA-256 (24 hex characters). Signal IDs include the source and canonical source URL. Product IDs use the outbound product hostname; known publishing platforms retain the full URL so unrelated posts do not merge merely because both are on GitHub or Hacker News.

Repeated collection updates the existing signal and preserves its first-seen timestamp. Engagement samples are at least 15 minutes apart, with the most recent 96 retained. A newly discovered product homepage moves a signal out of its previous product group. A fingerprint of sorted source content controls analysis invalidation; engagement changes alone do not require a new model call.

**Trade-off:** host-level identity can conflate independent products on the same business domain and cannot detect every rebrand. Exact identity is intentionally simpler than semantic entity resolution.

## 2. Evidence and momentum have different jobs

[`engine.ts`](../src/lib/radar/engine.ts) compares engagement within a source and a seven-day age neighborhood. A velocity estimate needs observations at least one hour apart; otherwise ranking uses an age-adjusted engagement fallback. GitHub stars and HN votes are never added as interchangeable units.

An opportunity becomes validated only with reviewed paying-customer and Turkey-demand evidence. An opportunity score additionally requires reviewed distribution and competitor evidence plus complete editorial scores. Evidence older than 30 days is excluded; missing commercial evidence stays unknown. [`builder.ts`](../src/lib/radar/builder.ts) separates SDKs/frameworks from products and keeps unknown costs out of explicit budget filters.

**Trade-off:** this is a research aid, not proof of Turkish demand, profitability or first-sale timing. Revenue observations retain their source provenance and do not establish profit.

## 3. AI budget is reserved before the request

[`ai.ts`](../src/lib/radar/ai.ts) accepts only `openrouter/free` or `:free` models and requests zero-priced provider routing. It persists each attempt in a UTC-day ledger before making the network call, with a hard application ceiling of 40 attempts/day. The scheduled workflow requests at most five attempts/run. Failed requests consume reservations; provider quotas can be lower.

Responses have a 45-second deadline, pass Zod validation and an unsupported-claims check. Failed enrichment preserves an existing analysis or leaves the card pending. The collector waits six hours before retrying failed analyses and stops its AI loop on authentication, payment or rate-limit errors. Browsers receive cached analysis, never the API key.

**Trade-off:** the local exclusive run lock and state ledger coordinate one state directory. A restored Actions cache is continuity, not a transactional distributed quota service; cache loss or an independent local collector can create separate ledgers. No claim of a provider-wide global quota guarantee.

## 4. Static serving and isolated failures

[`cli.ts`](../src/lib/radar/cli.ts) collects enabled sources concurrently and records per-source failures. Reddit and Product Hunt remain opt-in. An exclusive lock prevents overlapping collectors using the same state directory; [`storage.ts`](../src/lib/radar/storage.ts) writes JSON to a temporary file before renaming it. No automatic stale-lock deletion can evict an active collector.

The [Actions workflow](../.github/workflows/radar-refresh.yml) runs every six hours, restores private state, collects, builds, verifies the export, commits the public snapshot and uploads only `free/out` to the existing Pages project. No request-time database, queue or model is required to serve the public desk. If all sources fail, collection exits unsuccessfully and deployment stops; the previous published release remains available.

**Trade-off:** partial success can publish older cards alongside refreshed data. The UI exposes source status and warns when the last successful collection is over 48 hours old. Scheduled time is not a freshness SLA; failed uploads require investigation or a subsequent run. Rollback selects a previous Pages deployment.

## 5. Notebook ownership follows the origin

[`page.tsx`](../free/app/page.tsx) stores notes and progress in browser localStorage, supports JSON export/import and reports unavailable storage. There is no signup or cross-device synchronization. The `trendcatcher.notebook.v1` key remains compatible after the TrendRadar rename.

**Migration:** moving from `trendcatcher-shepardai.pages.dev` to `trendradar.shepardai.pro` creates a different browser origin. Export notes at the old address and import the JSON at the new address. DNS cannot transfer localStorage.

## Verification boundary

The rename passed a production static build, the configured-credential/private-file export check and five existing browser checks covering mobile rendering, notes/progress, filters, plan downloads, economics, failed snapshot recovery, builder constraints and revenue provenance. These checks establish behavior on the tested snapshot; they do not establish customer traction, a load-test SLA or model accuracy. Domain activation and public HTTPS are verified separately during release.
