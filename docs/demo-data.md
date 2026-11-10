# Demo data

`pnpm db:seed:demo` loads a demo data set that mirrors the web app's sample data (`apps/web/src/lib/mock*.ts`): seven corridors, one person for each of the 18 roles, Kaduna–Kano at gate 13 with lots, certificates, photos, land and open tasks. It is for the Neon branch named `demo` only. The names, amounts and documents are invented. The lines follow the real towns roughly.

Code: `apps/api/src/database/seed-demo.ts` (guard, rows, workflow replay), `demo-data.ts` (people, organisations, corridors) and `demo-files.ts` (placeholder PDFs, baseline CSVs, photos).

## Safety

- **Never on main.** The script reads the branch from `NEON_BRANCH`, as `pnpm db:seed` and `pnpm db:migrate` do, and refuses `main` outright. There is no override.
- **Demo branch only, unless you say otherwise.** It runs without a flag only when `NEON_BRANCH=demo`. On any other branch it needs `DEMO_SEED=1`.
- **The label must match the connection.** If `DATABASE_URL_UNPOOLED` is the one in `.env.local`, `NEON_BRANCH` must be the branch written next to it. Exporting `NEON_BRANCH=demo` on its own therefore cannot relabel `dev`.
- **SMS goes to the console only.** The demo uses `SMS_PROVIDER=console`. The phone numbers are a fictional block, and sign-in codes appear in the API's log.
- **No secrets in files.** Connection strings come from the `neon` CLI at run time and are never written to disk.
- **The test sign-in code is for development and demo only.** See below.

## Test sign-in code

For demonstrations without a phone at hand, `DEV_SIGNIN_CODE` (six digits, for example `000000`) in `apps/api/.env` is accepted as the sign-in or invite code, beside the real one.

- Only when `APP_ENV` is `development` or `demo`. With any other `APP_ENV` (staging, production, test) the API refuses to start while it is set, and the code check ignores it as well.
- A code must still be requested first (Send me a code), so the same rules apply: five tries per code, ten minutes per code, and the request limit when `SIGNIN_CODE_LIMIT` is on (off for now). It is used up like a real code.
- Anyone who knows it can sign in as any demo person whose number or address they know, so it never goes near real people's accounts. Leave it empty when the demo is not running.

Run the demo API with it, for example: `demo env APP_ENV=demo NEON_BRANCH=demo DEV_SIGNIN_CODE=000000 PORT=4100 SMS_PROVIDER=console node dist/main.js`. In demo mode the API refuses to start unless `NEON_BRANCH` names a branch other than main. The hosted demo (Fly.io, `deploy/fly/api.demo.toml`) is in docs/operations.md.

## Loading it

The folder stays linked to `dev` (`.neon` and `.env.local` are not touched). The seed scripts and the API load `.env.local` without overriding variables that are already set (dotenv and `@nestjs/config` both let the environment win). Passing the demo branch's connection strings in the environment is therefore enough to point every command at `demo`, with no change to any file.

```sh
# Once: create the branch from main (main holds migrations only).
neon branches create --project-id wild-paper-65564975 --name demo --parent main --no-secrets

# For each command: the demo branch's connection strings in the environment (never echo them).
demo() {
  DATABASE_URL_UNPOOLED="$(neon connection-string demo --project-id wild-paper-65564975)" \
  DATABASE_URL="$(neon connection-string demo --project-id wild-paper-65564975 --pooled)" \
  NEON_BRANCH=demo "$@"
}

demo pnpm db:migrate
demo pnpm db:seed
demo pnpm db:load-boundaries
demo pnpm db:seed:demo            # safe to run again: adds nothing the second time

# The API on the demo branch
cd apps/api && pnpm build
demo env PORT=4100 SMS_PROVIDER=console node dist/main.js
```

Always name the branch (`neon connection-string demo ...`). Without the name, the CLI returns the default branch, which is `main`.

**Idempotent.** Every row has a fixed id derived from a name. Organisations are found by name and people by phone. Rows go in with `ON CONFLICT DO NOTHING` and nothing is ever updated, so `approvals` and `audit_log` stay append-only and a second run adds no rows. The script prints each table's row count and how many rows the run added.

**Dates.** Dates are relative to the first run: certificate 14 was certified "yesterday", and Kaduna–Kano has waited 9 days at gate 13. A second run does not move them. To refresh the dates, reset the branch and load everything again:

```sh
neon branches reset demo --parent --project-id wild-paper-65564975
# then the four demo commands above
```

**Photos.** The 30 site photos are real, openly licensed railway photos from Wikimedia Commons (`apps/api/src/database/demo-photos/`, credits in docs/data-sources.md), chosen to fit each item: earthworks, bridges and culverts, track laying, stations, signalling, the incident and the finished lines. Most construction shots come from other standard-gauge projects, so they stand in for Kaduna–Kano rather than show it. A submission without a photo of its own gets a generated picture.

**Files.** Documents, baselines and photos are written to `apps/api/storage/` (development storage) under fixed keys: `projects/<id>/documents/demo-*`, `lots/<id>/baseline/demo-*`, `field/originals/demo-*` with their `-thumb.jpg` and `-web.jpg` copies. Each file is generated from its key and written only when missing, so its sha256 always matches the database. An API on another machine needs the seed run there too, or a copy of those files.

## Who is in it

Every account uses the same demo PIN, **4826**. It is stored as an argon2id hash with `hashSecret` from `src/common/secrets.ts`, exactly as the auth code stores PINs. To sign in, request a code for the phone (`POST /api/auth/otp/request`) and read it from the API log (`to +234700***0103: Your FMoT Rail Tracker code is ...`). Then verify the code and log in with the PIN. A device is bound at the first sign-in.

| Phone | Role | Name | Organisation | State |
| --- | --- | --- | --- | --- |
| 0700 000 0101 | Executive viewer (Minister) | Hon. Y. Abubakar | FMoT, office of the Minister | active |
| 0700 000 0102 | Accounting officer (Permanent Secretary) | Dr. F. Musa | FMoT, office of the Permanent Secretary | active |
| 0700 000 0103 | Director, rail | Engr. H. Danjuma | FMoT, rail directorate | active |
| 0700 000 0104 | Ministry project manager | Engr. A. Bello | FMoT, rail directorate | active |
| 0700 000 0105 | Procurement officer | Mr. S. Lawal | FMoT, procurement department | active |
| 0700 000 0106 | Legal officer | Barr. N. Uche | FMoT, legal unit | active |
| 0700 000 0107 | Finance officer | Mrs. O. Eze | FMoT, finance and accounts | active |
| 0700 000 0108 | M&E analyst | Mrs. C. Obi | FMoT, monitoring and evaluation unit | active |
| 0700 000 0109 | NRC project engineer | Engr. K. Okafor | Nigerian Railway Corporation | active |
| 0700 000 0110 | NRC asset manager | Engr. L. Ade | Nigerian Railway Corporation | active |
| 0700 000 0111 | Consultant resident engineer | Engr. T. Adeyemi | TEAM Consultants (Kaduna–Kano Lots 1 and 2) | active |
| 0700 000 0112 | Contractor site manager | Musa Garba | CCECC (Kaduna–Kano Lot 3) | active |
| 0700 000 0113 | Contractor commercial manager | Mr. Li Wei | CCECC (Kaduna–Kano Lots 1 to 3) | active |
| 0700 000 0114 | Security desk officer | Mr. D. Ibrahim | FMoT, security desk | active |
| 0700 000 0115 | Lender viewer | Ms. Wang Fang | China Development Bank (Kaduna–Kano, Port Harcourt–Maiduguri facilities) | active |
| 0700 000 0116 | Oversight viewer | Mr. P. Akande | Office of the Auditor-General for the Federation | active |
| 0700 000 0117 | Public viewer | Ms. J. Okon | Public access (demo); member of the three operational lines | active |
| 0700 000 0118 | IT administrator | Tochi Nwachukwu | Schull Technologies | active |
| 0700 000 0119 | Consultant resident engineer | Engr. R. Nwosu | Sigma Engineering (Kaduna–Kano Lot 3) | active |
| 0700 000 0120 | Contractor site manager | Ibrahim Sule | CCECC (Kaduna–Kano Lot 2) | **locked** (five wrong PINs; the IT administrator has an Unlock account task) |
| 0700 000 0121 | Contractor site manager | Aisha Bello | CCECC (Kaduna–Kano Lot 1) | active |
| 0700 000 0122 | Contractor site manager | Chinedu Okeke | CCECC (Kaduna–Kano Lot 2) | **invited**, waiting for the Director's Confirm new account |

The numbers are E.164 `+2347000000101` to `+2347000000122`. They pass `normalisePhone` and belong to nobody. Site managers have no map or project permissions (`projects:read`), so they work on the phone screens (`/api/field/...`) only.

## What is in it

| Corridor | Status | Funding route | Where it stands |
| --- | --- | --- | --- |
| Kaduna–Kano SGR (about 208 km) | under construction | external loan | Gate 13 (Certify and pay) for 9 days, on track |
| Kano–Katsina–Maradi SGR (about 241 km) | draft by Engr. A. Bello | external loan | Gate 1 awaiting confirmation: sent for publishing an hour ago; visible only to its creator and the Director |
| Port Harcourt–Maiduguri rehabilitation (narrow gauge, about 1,219 km) | stalled (marked) | external loan | Gate 10 (Right-of-way) for 141 days; the evidence was returned to the project manager |
| Lagos–Calabar coastal line (about 672 km) | funded | PPP | Gate 6 (BPP no objection) for 63 days, behind; the D11 has waited 3 days for the Director |
| Abuja–Kaduna SGR, Lagos–Ibadan SGR, Warri–Itakpe SGR | operational | external loan, external loan, budget | All 15 gates passed; one completed lot each (CCECC, CCECC, Julius Berger); stations in service; final account paid |

Alignments are LineStrings in SRID 4326 through the real towns (26 to 105 points). `length_m` is `ST_Length(alignment::geography)` and the states come from `ST_Intersects` with `admin_boundaries`, as in the alignment upload.

**Kaduna–Kano** has everything filled:

- **Gates.** Gates 1 to 11 passed, each with its evidence documents (placeholder PDFs; the signed EPC contract D13 is at version 2) and its chain: Publish project for gate 1 and Confirm gate by the Director for 2 to 11, with `approvals` rows carrying the evidence sha256. Gate 12 passed by rule when the Kano station design was countersigned. Gate 13 is current.
- **Lots and payment settings.** Three CCECC lots: FMOT/RL/KK/01 to 03, ₦410bn, ₦395bn and ₦405bn. TEAM Consultants supervises Lots 1 and 2 and Sigma Engineering Lot 3. Each lot was confirmed by the Director. Retention is 5 percent, the advance 15 percent and the recovery 10 percent.
- **Progress.** Discipline weights are earthworks 55, structures 30, track 10 and systems 5. The REs filed 18 monthly measurement sheets (February to October 2026), each citing that month's verified photo. There are 26 stations and structures. A baseline (revision 1) is in place for each lot. The result is 66.4 percent physical progress, against the mock's 68. Monthly track laying is 7, 9, 6, 8, 9, 7, 10 and 9 km from March to October, and the track front is at km 92.
- **Certificates.** 28 earlier certificates are paid on the three lots, so financial progress is 70.9 percent. On Lot 2 (as in mock-project.ts and mock-tasks.ts):
  - IPC 12 is paid, with D24 "Payment advice, IPC 12" and a lender disbursement.
  - IPC 13 has final approval and waits for Finance to mark it paid.
  - IPC 14 is certified and waits for the Director's approval.
  - IPC 15 is a draft and waits for the RE's recommendation.

  Each has its D31 valuation. Every step taken has its `approvals`, `tasks` and `audit_log` rows.
- **Field.** The nine field items s1 to s9 from mock-project.ts (verified photos, a flagged photo 680 m outside the corridor, a daily report, a photo sent back as unclear, the Zaria station milestone claim and the Dan Kade incident), plus the 18 monthly evidence photos. The photos come from the test scene generator (`test/support/photos.ts`) through the field service's derivative pipeline (`derivatives()`: original, 320 px thumbnail and 1600 px web copy, plus the dHash). The media route serves them.
- **Land.** Sections km 0 to 140 and km 152 to the end are available, signed off by the Director. Km 140 to 152 is blocked, and its Sign off task is open. There are 16 parcels in it, 14 of them unpaid, which gives the card's blocker. Two parcels are paid against the D17. There are four grievances.
- **Other items.**
  - Two incidents: one open, from s8, and one closed by the security desk.
  - Three design packages: Kano station approved for construction, the river bridge back with the RE after the NRC engineer's return, and Zaria signalling returned to the contractor.
  - Two claims: the ₦380m culverts variation with the Director, and the 60-day extension of time with the project manager.
  - Six milestones.
  - Four obligations, with the dates from mock-reports.ts.

**Open tasks** (the inbox, as far as the engine allows):

| Who | Tasks |
| --- | --- |
| Director, rail | Approve IPC 14; Approve variation (culverts); Confirm gate 6 (Lagos–Calabar); Publish Kano–Katsina–Maradi; Confirm new account (Chinedu Okeke); Sign off section km 140 to 152 (refused while parcels are unpaid) |
| Finance officer | Mark IPC 13 paid |
| Resident engineers | Engr. T. Adeyemi: Recommend IPC 15, Review queue (2 waiting). Engr. R. Nwosu: Review the river bridge design, Review queue (2 waiting, 1 flagged) |
| Project manager | Upload the gate 10 evidence again (Port Harcourt–Maiduguri); Recommend the extension of time |
| Commercial manager | Revise and resubmit the Zaria signalling design |
| IT administrator | Unlock Ibrahim Sule's account |

The task SMS for seeded tasks counts as already sent (`notified_at` is set), so starting the API does not text everyone.

## Differences from the mocks

These come from the real rules, which the seed follows instead of copying the mocks:

- **Kaduna–Kano waits 9 days at gate 13, not 12.** With gate 13's 5 reminder days, 12 days is "behind" under the health rule (2 x 5), and the mock shows on track. For the same reason, the Kano station design was countersigned 9 days ago, at version 4.
- **The gate 6 BPP task is on Lagos–Calabar**, which is therefore at gate 6 rather than the map mock's gate 5. A draft cannot be at gate 6 (CLAUDE.md: Kano–Maradi is only the draft). The Upload FEC extract task (gate 7) cannot exist while gate 6 is open. The upload task in the inbox is the returned gate 10 evidence on Port Harcourt–Maiduguri.
- **Port Harcourt–Maiduguri has waited 141 days at gate 10** (the portfolio mock) rather than the map mock's 41. It has no lots, so no physical or financial figures (the mock's 22 and 31 percent).
- **Lengths come from the geometry**: Kaduna–Kano about 208 km (mock 203) and Kano–Katsina–Maradi about 241 km (mock 393).
- **The flagged photo s2 is at about km 207**, 680 m off the line. A chainage past the end of the line (the mock's km 212+150) cannot be computed.
- **The map counters are 1 on track, 1 behind, 1 stalled and 1 draft.** Operational lines have no health, so the mock's 4 on track cannot happen.
- **"Escalated" grievances do not exist.** G-029 is in progress.
- **Not seeded:**
  - The mock's monthly and lender reports. They are generated documents: request them from the API (`POST /api/projects/:id/reports`).
  - The mock's notification log.
  - Chain history on the operational lines, which are migrated records.
