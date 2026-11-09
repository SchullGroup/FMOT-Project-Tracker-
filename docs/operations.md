# Operations

How the FMoT Rail Project Tracker is built, deployed, rolled back, restored and kept secure. Written 2 November 2026,
when staging was prepared but not yet deployed (see "Status" at the end).

## Environments

| Environment | Database (Neon project `fmot-rail-tracker`, aws-eu-central-1) | Runs where | SMS |
| --- | --- | --- | --- |
| Local development | branch `dev` (this folder is linked to it) | your machine, `pnpm dev` | console |
| Demo | branch `demo` (`pnpm db:seed:demo`, docs/demo-data.md) | your machine, pointed at `demo` | console |
| Staging | branch `main` | Fly.io, Frankfurt (`fra`) | console |
| Web demo (sample data) | none: the web app's built-in sample data (`NEXT_PUBLIC_API_MOCK=1`) | Vercel, Schulltech team account, `fra1` | none |
| Production | open | open: must be hosted in Nigeria (Nigeria Data Protection Act) | Termii |

Production hosting in Nigeria is an open question and is not set up. Nothing here is a production plan.

## Why Fly.io, Frankfurt, for staging

The brief: a host in Frankfurt, in the same region as the Neon `main` branch (aws-eu-central-1), running both apps
from their Dockerfiles, with migrations as a separate step before the new API starts.

Fly.io in `fra` was chosen because:

- It runs our Docker images unchanged (`apps/api/Dockerfile`, `apps/web/Dockerfile`), built remotely from the repository.
- Its release command runs the migrations in a temporary machine with the new image before any new API machine starts,
  and stops the deploy if they fail, so the old API keeps serving. That is the "separate step" with no extra tooling.
- Volumes give the API a persistent disk for uploads and reports while S3-compatible storage is not built
  (`STORAGE_DRIVER=local`, see below).
- It sends SIGTERM and waits (`kill_timeout`), and routes on our readiness check (`/api/ready`), which is what the
  API's graceful shutdown expects.
- The web app reaches the API over Fly's private network (`fmot-api-staging.internal`), so the proxy chain is fixed
  and `TRUST_PROXY=2` is exact.
- One API token deploys both apps from GitHub Actions.

Fly's Frankfurt region is in Frankfurt but not inside AWS; the round trip to Neon in aws-eu-central-1 is a few
milliseconds. Considered and not chosen:

- AWS (ECS on Fargate in eu-central-1): the same AWS region as Neon, but it needs a VPC, load balancer, registry,
  IAM roles and a separate migration task. That is too much to keep up for a staging copy.
- Render (Frankfurt): close in ease of use, but its persistent disks block zero-downtime deploys, and its pre-deploy
  command is limited to paid instances.
- Google Cloud Run (europe-west3, Frankfurt): it has no local persistent disk, only Cloud Storage or NFS mounts. The
  SMS dispatcher and reminders run inside the API, so it would need a minimum instance with CPU always allocated. The
  migrations would also need a separate Cloud Run job.

If production ends up on a Nigerian provider, the same images and the same steps apply: migrate, then start, then
route on `/api/ready`.

## Configuration

Settings are environment variables, validated at start-up by `apps/api/src/config/env.ts`, where each one is described.
The ones that matter for a deployment:

| Variable | Staging | Notes |
| --- | --- | --- |
| `NODE_ENV` | production | how the code runs |
| `APP_ENV` | staging | where it runs; `staging` allows the console SMS sender with `NODE_ENV=production` |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | secrets | Neon `main`: pooled for the app, direct for migrations |
| `NEON_BRANCH`, `ALLOW_MAIN_MIGRATIONS` | main, 1 | migrations refuse `main` unless both say so |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MEDIA_SIGNING_SECRET` | secrets | 64 random bytes each, all different, staging's own |
| `SMS_PROVIDER` | console | codes and invite links appear in the API log |
| `STORAGE_DRIVER`, `STORAGE_DIR` | local, /data/storage | a Fly volume mounted at /data |
| `TRUST_PROXY` | 2 | Fly's edge, then the web app's /api proxy |
| `WEB_BASE_URL`, `CORS_ORIGIN` | https://fmot-web-staging.fly.dev | links in SMS |
| `SHUTDOWN_GRACE_MS` | 20000 | below Fly's `kill_timeout` of 30 s |
| web `API_ORIGIN` (build) | http://fmot-api-staging.internal:4000 | fixed when the web image is built |
| web `NEXT_PUBLIC_MAP_STYLE_URL` (build) | OpenFreeMap liberty | its origin is the only outside origin in the CSP |

Non-secret values are in `deploy/fly/*.staging.toml`. Secrets are only in Fly (`flyctl secrets`) and in GitHub
(`FLY_API_TOKEN`), never in the repository.

On staging, anyone who can read the API log can see sign-in codes. Keep staging to test people and test data.

## One-time setup (not done yet)

1. Push the repository to GitHub. The workflow deploys from `main`; the local branch is `master`, so rename it
   first: `git branch -m master main`.
2. Create the apps and the volume (Frankfurt):
   ```sh
   flyctl apps create fmot-api-staging
   flyctl apps create fmot-web-staging
   flyctl volumes create fmot_storage --app fmot-api-staging --region fra --size 10
   ```
3. Set the API secrets. Generate each signing secret fresh, and take the connection strings from `neon connection-string main` and
   `neon connection-string main --pooled`, piped straight into the command so they are never shown or saved:
   ```sh
   flyctl secrets set --app fmot-api-staging --stage \
     JWT_ACCESS_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))")" \
     JWT_REFRESH_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))")" \
     MEDIA_SIGNING_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))")" \
     DATABASE_URL="$(neon connection-string main --pooled --project-id wild-paper-65564975)" \
     DATABASE_URL_UNPOOLED="$(neon connection-string main --project-id wild-paper-65564975)"
   ```
4. In GitHub, create the environment `staging`, with protection rules if wanted, and add the secret `FLY_API_TOKEN`: a deploy
   token for the two apps (`flyctl tokens create deploy --app fmot-api-staging` covers one app; use an org token
   limited to deploys if both share one secret).
5. The first deploy (below) runs all migrations on `main`. On 2 November 2026 `main` had PostGIS and no migrations.
   Then load the reference data and boundaries once, from your machine, deliberately:
   ```sh
   cd apps/api
   NEON_BRANCH=main ALLOW_MAIN_SEED=1 DATABASE_URL_UNPOOLED="$(neon connection-string main --project-id wild-paper-65564975)" pnpm db:seed
   NEON_BRANCH=main ALLOW_MAIN_LOAD=1 DATABASE_URL_UNPOOLED="$(neon connection-string main --project-id wild-paper-65564975)" pnpm db:load-boundaries
   ```
   Then create the first IT administrator against staging with `pnpm admin:create`, using the same variables. The invite link
   is printed once; treat it as a credential.

## Deploy

Every push runs `.github/workflows/ci.yml`:

- **Lint, unit tests, types:** oxlint on the API, its unit tests, a web typecheck, and a check that `packages/shared/openapi.json` and the
  generated types match the code (`pnpm api:types`, then `git diff --exit-code`).
- **Web walkthroughs:** the nine Playwright walkthroughs on sample data, under the Content Security Policy.
- **Deploy to staging:** only on `main`, after both pass, one deploy at a time, and only once the repository variable
  `STAGING_DEPLOY` is `on` (it is off until staging exists on Fly.io, so pushes are not red for want of `FLY_API_TOKEN`):
  1. API: `flyctl deploy` builds the image. The release command (`node dist/scripts/migrate.js`) applies the migrations
     on `main`, and only then do the API machines move to the new image, one at a time, each routed once `/api/ready`
     answers.
  2. Web: built with the staging `API_ORIGIN` and deployed.
  3. A smoke check of `/api/ready` and `/sign-in`.

A manual deploy, from the repository root, is the same commands:

```sh
flyctl deploy --config deploy/fly/api.staging.toml --dockerfile apps/api/Dockerfile --remote-only .
flyctl deploy --config deploy/fly/web.staging.toml --dockerfile apps/web/Dockerfile --remote-only .
```

Migrations must be backward compatible with the API that is still running while they apply: add columns and tables
first, and drop or rename them in a later release once no running code reads them. Never edit a migration that has
been applied anywhere; write a new one.

## Web app on Vercel

The web app (`apps/web`) can also run on Vercel, under the Schulltech team account. For now it is a sample-data demo:
it runs every screen on the built-in sample data and needs no API or database. Later it will point at the staging API on
Fly.io. The settings are in `apps/web/vercel.json`, and the Node version in `apps/web/package.json` (`engines`).

| Setting | Value | Why |
| --- | --- | --- |
| Root Directory | `apps/web` | the web app's folder; Vercel reads `vercel.json` there |
| Include files outside the root directory | on (the default) | the build needs `packages/shared` and the root `pnpm-lock.yaml` |
| Framework preset | Next.js | from `vercel.json` |
| Install command | `npx --yes pnpm@12.11.2 install --frozen-lockfile` | Vercel would pick pnpm 9 or 10 from the lockfile; the repository needs pnpm 12 (`allowBuilds` in `pnpm-workspace.yaml`). Installs the whole workspace from the root |
| Build command | `npx --yes pnpm@12.11.2 --filter @fmot/shared build && npx --yes pnpm@12.11.2 run build` | builds `@fmot/shared` (its `dist` is not committed), then the web app; `prebuild` copies the MapLibre worker into `public/maplibre` |
| Region | `fra1` (Frankfurt) | next to the Neon database and the Fly.io API (`fra`) |
| Node.js | 26.x | the version everything else runs on; Vercel's default since Node 26 LTS |

Environment variables (Settings, Environment Variables, for Production and Preview):

| Variable | Now (sample-data demo) | Later (against the staging API) |
| --- | --- | --- |
| `NEXT_PUBLIC_API_MOCK` | `1` | `0` |
| `NEXT_PUBLIC_MAP_STYLE_URL` | `https://tiles.openfreemap.org/styles/liberty` (the default street map; a MapTiler satellite style URL with its key when there is one) | same |
| `API_ORIGIN` | not needed | the staging API's origin, for example `https://fmot-rail-api-staging.fly.dev` (no `/api`) |
| `MAP_EXTRA_ORIGINS` | not needed | only if the map style loads tiles from hosts other than its own (comma separated) |

`NEXT_PUBLIC_*` values and `API_ORIGIN` are read when the app is built (the `/api` proxy is written into the build), so
changing any of them needs a redeploy (Deployments, the latest one, Redeploy). The Content Security Policy is set per
request by `src/proxy.ts` and allows the map style's own origin; checked on a production build on 9 November 2026: sign-in
on sample data, the map with its worker, no policy violations.

Vercel's preview and production links are public unless Deployment Protection is on (Settings, Deployment Protection).
The sample-data demo holds no real data, but turn protection on before pointing it at the staging API.

## Roll back

- Code: redeploy the previous image. `flyctl releases --app fmot-api-staging --image` lists them. Then run
  `flyctl deploy --config deploy/fly/api.staging.toml --image <previous image>`, and the same for the web app. With
  an earlier image the release command finds nothing new to apply.
- Schema: migrations only go forward. Undo a change with a new migration. If data was damaged, restore the database
  (next section).
- Configuration: `flyctl secrets set` or a changed toml, deployed again. Each secrets change restarts the machines.

## Restore (Neon point-in-time restore)

Neon keeps the history of every branch for the project's history retention: 24 hours on this project
(`history_retention_seconds` 86400, confirmed on 2 November 2026). Any moment in that window can be opened as a new
branch, or the branch can be put back to it.

Restore drill (run on 2 November 2026; repeat it monthly and after any plan change):

1. Pick the moment to go back to, in UTC, inside the window, for example an hour ago.
2. Open it as a separate branch, without touching `main`:
   ```sh
   neon branches create --project-id wild-paper-65564975 --name restore-drill-YYYYMMDD \
     --parent 2026-11-02T16:54:49Z --expires-at <in two hours>
   ```
   The parent timestamp is read on the default branch, `main`.
3. Check it: connect with `psql "$(neon connection-string restore-drill-YYYYMMDD --project-id wild-paper-65564975)"`
   and compare what matters (table counts, the latest `audit_log` rows, `drizzle.__drizzle_migrations`).
4. Delete the drill branch (`neon branches delete <its id>`), or let it expire.

On 2 November 2026 the drill branch was created from `main` as at 16:54 UTC. It held the same schema as `main`:
PostGIS only, no migrations yet. It was then deleted. Recovery took about a minute.

To actually restore:

- **Some rows were damaged:** open the moment before the damage as a branch (step 2), copy the rows back with
  `pg_dump --data-only -t <table>` or SQL, then delete the branch. `audit_log` and `approvals` are append-only, so
  corrections are new rows.
- **The whole database was damaged:** stop the API first (`flyctl scale count 0 --app fmot-api-staging`), so nothing
  writes. Then put `main` back to the moment, keeping the damaged state as a branch for investigation:
  ```sh
  neon branches restore main ^self@2026-11-02T16:54:49Z --preserve-under-name main-before-restore-YYYYMMDD \
    --project-id wild-paper-65564975
  ```
  Then start the API again (`flyctl scale count 1`). The connection strings stay the same. Uploaded files live on
  the Fly volume and are not rolled back: rows restored to an earlier moment may miss files added after it, and files
  may exist with no row. Neither breaks the app.

Fly volumes have daily snapshots, kept 5 days by default (`flyctl volumes snapshots list <volume id>`).

## Rotate secrets

Rotate on a schedule (every 90 days), when someone with access leaves, and at once if a value may have leaked. Set
the new value with `flyctl secrets set --app fmot-api-staging NAME=...`. The machines restart one by one with it.

| Secret | Effect of rotating | Steps |
| --- | --- | --- |
| `JWT_ACCESS_SECRET` | access tokens (15 minutes) stop working; the web app refreshes once and carries on, so nobody is signed out | set a new value |
| `JWT_REFRESH_SECRET` | OTP tickets and PIN confirmations in flight (10 and 2 minutes) fail and are asked for again; refresh tokens are opaque database rows, not affected | set a new value |
| `MEDIA_SIGNING_SECRET` | photo, document and report links already handed out (5 minutes) stop working; the screens ask for new ones | set a new value |
| Neon password (`neondb_owner`) | the API loses the database until it has the new connection strings | reset the role's password in the Neon Console (Roles, Reset password) or through the Neon API, then set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` together with `--stage`, and deploy |
| `TERMII_API_KEY`, `TERMII_SECRET_KEY` (production) | SMS stops until both match the Termii dashboard | create the new key in Termii, set both, then revoke the old one |
| `FLY_API_TOKEN` (GitHub) | deploys fail until it is replaced | create a new deploy token, update the GitHub secret, revoke the old one (`flyctl tokens revoke`) |

The three signing secrets must stay different from each other; the API refuses to start otherwise. To end every
session at once, for example after a leak, raise `users.token_version` for everyone (one SQL update) as well as rotating
the secrets. Every refresh token family then dies on its next use.

## Health, readiness and shutdown

- `GET /api/health`: the process, the database and the PostGIS version. It's for people and uptime checks.
- `GET /api/ready`: whether this instance should get traffic. It answers 503 (`not_ready`) while the instance shuts
  down or cannot reach the database within 2 seconds. Load balancers and the Docker `HEALTHCHECK` use this one.
- On SIGTERM (`apps/api/src/common/lifecycle.ts`):
  1. Readiness turns 503, and no SMS batch or report is started any more.
  2. The batch or report in hand gets `SHUTDOWN_GRACE_MS` to finish. Anything still unfinished is put back in its
     queue: SMS claims are released, and the running report returns to `queued`.
  3. The database pool closes last.
- If an instance dies without a clean shutdown:
  - its SMS claims lapse after 3 minutes, and another instance sends them. A message can rarely go twice, but never
    zero times.
  - a report left `running` for 30 minutes is queued again.

## Security

- **API:**
  - helmet headers;
  - JSON bodies up to 256 kB and forms up to 64 kB (`apps/api/src/http.ts`);
  - uploads streamed with per-field limits: 25 MB documents, 15 MB photos, 5 MB voice notes, at most 20 text fields of 64 kB, and every multipart route goes through `receiveMultipart`;
  - anything larger is refused with 413 `payload_too_large`;
  - every error is `{ statusCode, code, message }` with no stack or internals (`apps/api/src/common/errors.ts`).
- **Web:**
  - a Content Security Policy with a nonce per request (`apps/web/src/proxy.ts`): scripts and styles only from the
    app with its nonce; images, connections and workers only from the app and the map style's origin (plus
    `MAP_EXTRA_ORIGINS` if a style needs more); the API is reached through the app's own `/api`; no frames, objects or
    other origins;
  - HSTS, nosniff, `X-Frame-Options: DENY`, a strict referrer policy, a Permissions-Policy denying camera,
    microphone and location, and COOP (`apps/web/next.config.ts`);
  - the walkthroughs fail on any CSP violation.
- **Dependencies:** `pnpm audit` on 2 November 2026 found no high or critical issues after one unused package was removed; see "Audit" below.
- **Secrets in the repository:** a search on 2 November 2026 of every commit (10) and the working tree found none. It
  looked for:
  - the actual values of the signing secrets and connection strings;
  - Postgres URLs with passwords and Neon passwords;
  - JWTs, private keys, and AWS, GitHub and Slack tokens;
  - long values assigned to secret-like names.

  The only matches were the `replace-with-...` placeholders in `.env.example`. No `.env`, `.env.local` or `.neon` was
  ever committed. The Docker build context excludes all env files except the examples (`.dockerignore`): `pnpm deploy`
  copies `apps/api/.env` if it is in the context.

### Audit

`pnpm audit` on 2 November 2026, before any fix, found 26 issues: 8 high, 13 moderate and 5 low. All 8 high came
from `@nestjs/mau` (Nest's hosted-deployment CLI), which the skeleton had added and nothing used. It was removed,
which took its undici and tmp findings with it.

After that: no high or critical issues, and 3 moderate, kept for these reasons:

| Package | Path | Why it stays |
| --- | --- | --- |
| esbuild ≤ 0.24.2 (any site can query the dev server) | drizzle-kit, through @esbuild-kit | Development only. drizzle-kit is a devDependency and is not in either image (the image migrates with drizzle-orm). We never run esbuild's serve mode. |
| uuid < 11.1.1 (missing bounds check when `buf` is passed to v3, v5 or v6) | exceljs | exceljs only calls `v4()` without a buffer, so the flaw cannot be reached. Forcing uuid 11 under exceljs would mean an override against its declared range, for no gain. |
| minimatch < 11.0.1 (slow matching of crafted glob patterns) | @nestjs/cli; exceljs, through archiver | The CLI is development only. archiver is given patterns by exceljs's own code, never by a user. |

Re-run `pnpm audit` before each release. Anything high or critical is fixed or written up here before deploying.

## Status on 2 November 2026

- Staging is prepared, not deployed: the Dockerfiles, Fly configs, workflow and this runbook are in the repository.
  Both images were built and run locally:
  - the API on Node 26.11.1 as the `node` user, the migrator against `dev`, ready and healthy, and a clean SIGTERM exit;
  - the web app with the nonce CSP and the `/api` proxy to the API container.
- Staging URLs (once deployed): https://fmot-web-staging.fly.dev and https://fmot-api-staging.fly.dev.
- The inbox timing from staging is still to be measured, once staging runs on `main` with the demo-sized data. Load
  the 200-task case, then time `GET /api/tasks` for the Director from a machine in the same region:
  ```sh
  flyctl ssh console --app fmot-api-staging -C "node -e \"...\""
  ```
  Record the figure here. The target is 400 ms; from a laptop in Nigeria every query crosses to Frankfurt, so local
  runs say little.
- Open: production hosting in Nigeria; S3-compatible object storage (`STORAGE_DRIVER=s3` is a stub); Termii for
  production SMS; API e2e tests in CI (they need a Neon branch per run and a `NEON_API_KEY`).
