# Cloudflare Pages deployment

Target: `trendcatcher-shepardai` on Cloudflare Pages Free. Only the built `free/out` directory is uploaded. No Next.js server, legacy authenticated application, database, private collection state or environment files are deployed.

## First launch

1. `npx wrangler@4 login --scopes account:read user:read pages:write`
2. `npm run radar:collect -- --no-ai`
3. `npm run build`
4. `npm run verify:export`
5. `npm run test:browser`
6. `npx wrangler@4 pages project create trendcatcher-shepardai --production-branch main --force`
7. `npx wrangler@4 pages deploy free/out --project-name trendcatcher-shepardai --branch main --commit-dirty=true`

Use the actual hostname returned by Cloudflare, since project names can collide globally. Check HTTPS, `/data/radar.json`, revenue filters, detail navigation, local notes and browser console after publishing. Check `_headers` response rules on the live origin. No custom domain or existing DNS record is changed by this deployment.

Wrangler 4.135 delegates creation to Workers unless `--force` is used. This flag is needed only for initial Pages project creation; subsequent deploys target the existing Pages project normally.

## Subsequent releases and data refresh

Repeat steps 2–5 and 7. Local source state remains in `.radar`. This is a direct-upload project; an external CI runner can run the same deployment command later. No cloud collection schedule exists until explicitly configured. Site availability does not depend on this computer; collection updates currently do.

## Automatic refresh

The Windows task `TrendCatcher Radar Refresh` runs every 6 hours at 03:00, 09:00, 15:00 and 21:00 Europe/Istanbul. It runs `scripts/radar-refresh.ps1`: collect sources, build, verify the export, then deploy `free/out` to Pages. Each run limits AI enrichment to three cards, keeping the free provider budget predictable. Four runs per day are about 124 deployments per 31 days.

This schedule uses the local Windows Task Scheduler because the project is a direct-upload Pages site and has no CI repository/token configured. The computer must be on and the Wrangler login must remain valid. If it is off, the last successful snapshot remains live and the task runs when the computer becomes available. Inspect it with `Get-ScheduledTask -TaskName 'TrendCatcher Radar Refresh'` and run one cycle manually with `npm run radar:refresh`.

## Cost boundaries

Cloudflare Pages static asset serving is free. No Pages Functions, Workers compute, R2, D1, paid models or paid subscriptions are created. Documented Free limits include 500 builds/deployments per month and unlimited static bandwidth. A future six-hour refresh cadence would use about 124 deployments per 31 days plus manual releases. Do not enable hourly cloud builds without calculating the monthly quota.

Sources: https://developers.cloudflare.com/pages/platform/limits/ and https://developers.cloudflare.com/pages/get-started/direct-upload/.

## Security scope

The repository dependency audit reports vulnerabilities in the legacy Next 14 server/build dependency tree (Next and bundled PostCSS). This deployment contains static assets only: no server request handlers, image optimizer, middleware or Server Actions are exposed. Only trusted repository CSS is compiled. A server-based deployment remains out of scope and requires a separate supported-version upgrade and security review. The audit is not reported as clean.

`verify:export` checks the deployed tree for configured credential values and private files. CSP allows Next's static inline hydration scripts; it limits connections to the same origin and disables framing, objects, camera, microphone and geolocation. External source links remain ordinary navigation links.

## Rollback

In Cloudflare Pages → project → Deployments, promote the previous successful production deployment using Rollback. Verify the HTML and JSON timestamps after rollback. Browser notes remain local to each origin and are not part of deployment artifacts. If there is no earlier deployment, stop publishing and repair locally before the next upload.
