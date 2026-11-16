# Process model (condensed)

Condensed from the working scrapbook. The full version, with the funding-route detail, stakeholder map, 30-item document register and open questions, lives in the Claude doc "FMoT Rail Project Tracker: Working Scrapbook" and the Google Doc of the same name (links in README.md).

## What the system is

A project tracker for Nigeria's Federal Ministry of Transportation to track railway construction: long linear corridors (Kaduna–Kano, Kano–Maradi, Port Harcourt–Maiduguri rehabilitation, planned Lagos–Calabar) built mostly with external loans by CCECC and Mota-Engil, owned and operated by the Nigerian Railway Corporation (NRC). The map of Nigeria is the home screen; the field reports through a mobile app; every approval is recorded against a gate.

## The 15 gates

| Gate | Decision | Approving party | Kind |
| --- | --- | --- | --- |
| 1 Initiation | Corridor becomes a project; study authorised | Minister (minute D02 is the evidence) | Attach evidence; Director confirms |
| 2 Feasibility accepted | Study and preliminary design accepted | Permanent Secretary and Minister on NRC review (accepted study D04 is the evidence) | Attach evidence; Director confirms |
| 3 Funding route chosen | Budget, loan, PPP, or state/private | Minister (Finance ministry for loans; ICRC for PPP); minute D02 is the evidence | Attach evidence; Director confirms |
| 4 Funding approved | Money legally available | Budget: National Assembly. Loan: FEC, then Senate and House, lender board. PPP: ICRC certificates, then FEC or Project Approval Board | Attach evidence |
| 5 Tender and evaluation | Method approved, bids evaluated | Ministerial Tenders Board (BPP for non-competitive methods) | Attach evidence |
| 6 BPP no objection | Due process confirmed | Bureau of Public Procurement | Attach evidence |
| 7 FEC award | Award approved (works of N10bn and above) | Federal Executive Council on the Minister's memo | Attach evidence |
| 8 Contract executed | Contract signed and secured | Minister or Permanent Secretary after Justice vetting | Attach evidence |
| 9 Environmental approval | EIA certificate; lender no-objection | Federal Ministry of Environment | Attach evidence |
| 10 Right-of-way | Land acquired, communities compensated | State governors under the Land Use Act; Finance releases funds | Attach evidence, register tracked inside |
| 11 Financial close and mobilisation | Conditions met, advance paid, site handed over | Lender; Ministry; Accountant-General | Attach evidence |
| 12 Detailed design approved | Packages approved per discipline | NRC engineer on the consultant's recommendation | Approve in system |
| 13 Certify and pay (monthly loop) | Work measured, certified, paid; variations | Consultant RE recommends, NRC engineer certifies, Director approves, Permanent Secretary gives final approval; finance marks paid with payment evidence | Approve in system |
| 14 Commissioning | Safe to operate | NRC technical acceptance | Approve in system |
| 15 Handover and close-out | Asset taken over, defects cleared, accounts closed | Ministry, NRC, Auditor-General | Approve in system |

Gate 4 forks by funding route, so there is one gate template per route. Gates 9 and 10 run in parallel with 5 to 8. The template per route decides which gates are approve-in-system (an internal user clicks, with separation of duties) and which are attach-evidence (an officer uploads the external decision and sets the date; the Director confirms).

## Roles

| Role | Organisation | Scope | Does |
| --- | --- | --- | --- |
| Executive viewer | Minister, Minister of State | All projects | Reads everything; gate 1 and 3 decisions recorded by their office |
| Accounting officer | Permanent Secretary | All projects | Final IPC approval; Tenders Board outcomes |
| Director, rail | Rail directorate head | All rail projects | Confirms evidence gates, approves IPC at ministry level, publishes projects, confirms external accounts |
| Ministry project manager | Rail directorate desk officers | Assigned corridors | Creates projects, uploads evidence, compensation and grievance registers, variation requests, reports |
| Procurement, Legal, Finance officers | Ministry units | Assigned projects | Upload documents for their gates; finance marks certificates paid |
| M&E analyst | Reform or planning unit | All projects | Reports, Eyemark export |
| NRC project engineer | NRC | Assigned corridors | Approves design, certifies IPCs technically, commissioning, takeover |
| NRC asset manager | NRC | Handed-over lines | Asset register, defects |
| Consultant resident engineer | Supervising consultant | Assigned lots | Verifies photos and reports, measures, recommends certificates |
| Contractor site manager | Contractor | Own lot | Photos, daily report, milestone claims, incidents (mobile app) |
| Contractor commercial manager | Contractor | Own lots | Valuations, claims, design packages, documents; nominates site managers |
| Security desk officer | Ministry security unit | All corridors | Incidents, no-go segments, visibility of live positions |
| Lender viewer | China Exim, CDB, AfDB, IFC | Financed corridors | Read-only, report export |
| Oversight viewer | NASS committees, Budget Office, Auditor-General | All or assigned | Read-only; auditor reads the audit log |
| Public viewer (optional) | Anyone | Published subset | Map and cleared photos |
| IT administrator | Ministry ICT or Schulltech | Configuration | Accounts, organisations, roles, templates; never approves anything |

## Rules enforced in code

- On one IPC the submitter, verifier, certifier and payment approver are four different users from at least three organisations.
- A contractor organisation never verifies, and a consultant organisation never submits, on the same lot.
- The IT administrator role has no business approval permission.
- Evidence gates need two people: uploader and confirmer.
- Submitted reports, photos and valuations are immutable; corrections are new versions with a reason.
- Financial amounts, live field positions and incident detail are separate permissions.
- Scope (organisation, corridor ids, lot ids) is applied as a row filter on every query; every approval is a row with actor, role, decision, reason, timestamp and document hash.

## Who creates a project

The ministry project manager creates it once the Minister's gate-1 minute exists; the Director publishes it. Setup: basics, funding route (generates the gate template), geography (alignment file), people, documents, publish. Lots are added at gate 8, one per contract. Accounts are created by the IT administrator; project membership is set by the project manager (Director confirms external organisations); responsibilities come from the gate template, not per-project configuration.

## Platform clients

- Mobile app (Android first, React Native with Expo): site managers and resident engineers on site; offline queue, in-app-only capture with GPS, time, heading, device; mock-location and device-integrity checks; chainage computed server-side from GPS against the alignment (PostGIS).
- Responsive web app (Next.js, MapLibre on a 2D satellite map; 3D terrain in three.js as a cinematic mode later): everyone else.
- SMS: task links, digests, reminders, and an end-of-day fallback where no smartphone is on site.
- Backend: NestJS (TypeScript), PostgreSQL with PostGIS, S3-compatible object storage; Nigerian hosting and the Nigeria Data Protection Act apply.

## Satellite pictures

Free Sentinel-2 pictures (Copernicus, 10 m a pixel, a new pass every few days) let anyone who sees a project watch large changes along its corridor: earthworks, cleared land, new embankments. They are context for the people who decide, never evidence: progress still counts only from verified site photos and the resident engineer's monthly sheets, and nothing is approved from a picture.

- Which pictures: nightly at 02:30 Lagos, for each published project, the Copernicus catalogue is searched over the corridor (the line plus the corridor width each side, `projects.corridor_buffer_m`) and every new picture date is saved. A project's first search fills the last 12 months: the clearest picture of each month and every picture of the last 60 days. Pictures cloudier than `SATELLITE_CLOUD_LIMIT` (30 percent over the corridor) are kept but hidden behind "Show cloudy pictures".
- Who sees them: anyone who can see the project, on its Satellite section (W5.14) and, for each project's latest clear picture, on the national map's Layers panel. The pictures cover only the corridor, so nothing outside it is shown or paid for.
- Cost: free within the Copernicus monthly allowance. Drawing uses processing units, counted each month against `SATELLITE_PU_MONTHLY_LIMIT` (27,000 of the free 30,000); above it only parts already drawn are shown until the next month, and the IT administrator sees "New pictures paused until next month". Drawn parts are kept for good.
- Credit: "Contains modified Copernicus Sentinel data" with the year, on every map that shows them.

### Where to look (change flags): experimental

Automatic flags from the same free pictures, per 500 m of line, meant as prompts for the resident engineer to look closer. They are never proof of progress, never used for payments, and never change progress figures; the panel says so: "Automatic flags from free 10 m pictures. A reason to look closer, not proof."

- Who sees them: for now only the IT administrator, on Experimental in the admin area, labelled "Experimental: not yet reliable", and only while the experimental switch is on (Settings, Experimental; setting `experimental.change_flags`, off by default). The Director, the project manager and the resident engineer do not see them until they pass a check against a live project. While the switch is off the nightly run does not work them out either.
- What is measured: for each 500 m segment by chainage and each picture date on the timeline, Sentinel Hub's Statistical API gives, over the clear pixels only (the scene classification masks cloud, cloud shadow and haze), the bare soil index and NDVI of the works strip (50 m either side of the line) and of a reference band beside it (150 to 500 m either side), on surface reflectance harmonised across processing baselines. A date counts for a segment only when at least 70% of its strip (and of its reference band) is clear.
- The flags (method version 2, 16 November 2026): for each index, the segment's usual relationship strip = a + b x reference is fitted over its clear dates with a robust line (Theil-Sen), so a strip that greens and dries by a different amount than its surroundings is expected rather than flagged. Each date's residual (actual minus expected; bare soil index less NDVI, so barer is higher) is compared with the median absolute deviation of the residuals (as a robust standard deviation, at least 0.02). When a season has 6 or more clear dates of its own, its dates are fitted and compared within that season (dry: November to March; rainy: April to October). A change is the residual beyond k = 2 on the same side on 2 or more clear dates in a row, from its first date. One that starts in the dry season is "changed since <date>". One that starts in the rainy season, when the greening alone can move the residual, is "waiting for confirmation" (low confidence) until the next clear dry-season date: still beyond k on the same side, it is "changed" (confirmed on that date); back within the band, it is "cleared" (16 November 2026). A segment shows its latest change that was not cleared, or "cleared" when every change was. Without a change: "no visible change for N months" over 6 or more clear dates spanning 3 months or more; otherwise "not enough clear pictures". Each run records how many segments would read differently at k = 1.5 and k = 2.5, and calls the result fragile when that is more than a fifth of the segments judged.
- Two short lists: stretches with work recorded in the last 3 months but no visible change for 3 months or more, and stretches showing change where no work (measurement or verified photo) is recorded. Each links to the map at that spot.
- When: nightly after the picture search (switch on), only for picture dates not yet read and the segments they cover; or now for one project (`pnpm satellite:flags`). A project's first run that would use more than 10,000 processing units does not start, nor does a run that would take the month past the unit or request limit (`SATELLITE_PU_MONTHLY_LIMIT`, `SATELLITE_REQUESTS_MONTHLY_LIMIT`, 27,000 each). Changing the method recomputes from the readings already kept, with no Copernicus requests.
- Cost: two requests per segment per run (strip and band), whatever the number of new dates; a first run for a 214 km line is about 860 requests and up to 1,440 processing units.

Kaduna–Kano, 429 segments, 27 picture dates (27 November 2025 to 12 November 2026), demo branch:

| | Version 1 (each date against the segment's earlier dates) | Version 2 (season-adjusted residuals) | Version 2 with dry-season confirmation |
| --- | --- | --- | --- |
| Changed / waiting / cleared / no visible change / not enough | 134 / - / - / 295 / 0 | 79 / - / - / 350 / 0 | 10 / 0 / 69 / 350 / 0 |
| Segments that moved at any point | 426 | 79 | 79 (69 of them cleared) |
| Reading differently at k = 1.5 / k = 2.5 | 175 / 80: fragile | 61 / 32: not fragile (under a fifth) | 62 / 33: not fragile |
| Month the changes started | June 52, July 202, November 93; the rest spread | July 36, September 12, October 12, June 5, March and April 4 each, November 2025 3, May and August 1 to 2 | Changed: November 2025 4, March 2026 6. Cleared: July 35, September 12, October 12, June 4, April 3, August 2, May 1 |
| Rainy-season starts | (not recorded) | 72 of 79 (low confidence) | 69, all cleared on 7 November 2026; none confirmed, none waiting |
| Segments with recorded earthworks or track showing (confirmed) change | 366 of 368 | 66 of 368 | 10 of 368 |
| Segments with no recorded work | 59 of 60 had moved | 48 no change, 12 changed | 48 no change, 12 cleared, 0 changed |

Version 2 no longer bunches in November and leaves most segments with no recorded work at "no visible change", but on its own changes still bunched on the one July date (22 July 2026) and 72 of 79 started in the rainy season: within the rainy season the dates are mostly September and October, so the peak-rain dates still looked unusual against them. With dry-season confirmation every rainy-season change was cleared, all by the same date (7 November 2026, the first clear dry-season picture), and only 10 dry-season changes remain. That one date decides every rainy-season change, so a hazy or odd first dry-season picture would clear (or confirm) them all at once.

A real check needs a live project's recorded progress: the demo's measurements and photos are sample data, so agreement with them says nothing about whether the flags find works. Before the flags go to the Director, project managers or resident engineers, compare them with a live project's resident engineer measurements and verified photos over at least a full dry season.

## The one UI pattern

Open the app, see "Your tasks today", tap a task, one screen with only what is needed, one big button, Done. Phone number plus SMS code to log in, then a PIN. Photos and voice notes over typing; everything prefilled from last time; Send back always picks a reason from a list; Call support on every screen.

## Open questions for the ministry

Values the platform runs on today as placeholders; each needs a ministry decision before go-live.

| Question | Placeholder in use | Where it is set |
| --- | --- | --- |
| Corridor width: how far from the alignment may a field photo be and still count as on the corridor? | 500 m either side of the line | `projects.corridor_buffer_m` (per project) |
| Offline window: how late may a phone send a photo taken offline? | Warn after 24 h, refuse (flag) after 72 h; captures more than 5 minutes in the future are refused | `FIELD_MAX_AGE_HOURS`, `FIELD_MAX_FUTURE_MINUTES` |
| Variation limits: up to what size may the Director, rail approve a variation or extension of time without BPP and FEC? | N500 million for a variation, 90 days for an extension of time | settings `variation.director_limit_kobo`, `variation.director_limit_days` (IT administrator, `PUT /api/admin/settings/:key`) |
| Working days for the 16:00 no-photo reminder: which public holidays are skipped? | Monday to Friday; no holidays | reminder_rules `reminder.no_photo` (hour); holidays are not modelled yet |
| Eyemark: which import template does the M&E unit use? | The tracker's own 21-column layout | `docs/eyemark-export.md`, `EYEMARK_COLUMNS` |
| Project health on the map: when is a project behind, and when stalled? | Behind after 2 x the current gate's reminder days; stalled after 90 days at one gate | reminder_rules `health.behind_factor`, `health.stalled_days` |
| Sign-in codes: how many may one phone number or email address ask for in 15 minutes? A limit stops someone running up SMS and email costs or flooding a person's phone; without one, only the 10 requests a minute per network address on the sign-in routes holds them back. | No limit (switched off 4 November 2026; 3 is built and tested) | `SIGNIN_CODE_LIMIT` |
| Satellite pictures: how cloudy may a picture be and still be listed by default? | 30 percent cloud over the corridor | `SATELLITE_CLOUD_LIMIT` |
| Satellite change flags (experimental): how far must a segment's residual move, in robust standard deviations (from the median absolute deviation), on 2 clear dates in a row, to be flagged "changed"? | k = 2 (with 1.5 and 2.5 reported for sensitivity) | `SATELLITE_FLAG_K` |
| Email sending: does Schulltech's mailing endpoint have (or will it get) an API key? Today it accepts any caller. | No key; the API sends `x-api-key` only when one is configured | `SCHULLTECH_MAIL_API_KEY` |
| Email sending: which domain does the ministry want sign-in codes, invites and messages sent from at go-live (it must be verified in the sending SES account)? | `"FMoT Rail Tracker" <noreply@schulltech.com>` | `MAIL_FROM` |
