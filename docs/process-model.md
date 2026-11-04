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
| Email sending: does Schulltech's mailing endpoint have (or will it get) an API key? Today it accepts any caller. | No key; the API sends `x-api-key` only when one is configured | `SCHULLTECH_MAIL_API_KEY` |
| Email sending: which domain does the ministry want sign-in codes, invites and messages sent from at go-live (it must be verified in the sending SES account)? | `"FMoT Rail Tracker" <noreply@schulltech.com>` | `MAIL_FROM` |
