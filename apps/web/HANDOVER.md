# Handover: web app, steps 1 to 6 (built outside the repo)

Built in a separate session, without the running API, against
docs/screen-map.md and the backend step reports. It type-checks, builds, and
was walked through in a browser in sample-data mode with no errors:

- Step 1: sign-in (code and PIN, easy-PIN refusal), accept invite, map home,
  search to a project, project card, task inbox, Large text.
- Step 2: the project view, all 13 sections (overview, gates, corridor,
  photos and reports, progress, payments, design, documents, land and
  community, issues and variations, people, reports, activity).
- Step 3: the create-project wizard, all six steps through to "Send for
  publishing" (basics, funding route with the gate preview, alignment upload
  and stations, NRC engineer, D01 and D02 with the gate-1 date, review).
- Step 4: administration for the IT administrator (people with the
  add-person drawer, resend invite, reset PIN, remove access with hand-over
  of tasks; organisations; roles explained; settings and reminders; messages
  sent; activity record).
- Step 5: the one-screen task views for every task type (verify a photo,
  milestone, confirm a gate, approve a payment certificate, design package,
  variation, upload a document, confirm an account, publish a project), the
  PIN sheet, the return-with-a-reason sheet, and the next task opening after
  each decision.
- Step 6: the portfolio (every project, longest-waiting first, with
  portfolio PDF, Excel and Eyemark exports), each project's reports section
  (monthly and lender reports by month, made in the background and
  downloadable when ready), bonds and guarantees with their expiry on the
  documents section, and each person's message settings (quiet hours and
  the Monday summary).

It has not yet talked to the real API. The prompts below finish the job.

## Which prompt to use

- If you have NOT yet run the Step 1 handover in Claude Code: delete
  apps/web, unzip this folder as apps/web, and use Prompt A.
- If you HAVE already run an earlier handover (apps/web was wired to the
  API): unzip this folder to apps/web-next instead, and use Prompt B so the
  API alignment already done is kept.

### Prompt A (fresh)

```
Web steps 1 to 6 handover. Read apps/web/HANDOVER.md and apps/web/README.md.

1. Install: apps/web joins the pnpm workspace; delete any package-lock.json
   in it; pnpm install from the root; approve any blocked build scripts Next
   needs; add root scripts "web" (pnpm --filter web dev) and "dev" (api and
   web together). The web app proxies /api to :4000, so the browser never
   calls the API directly.

2. Align the contract. Compare apps/web/src/lib/types.ts and
   apps/web/src/lib/endpoints.ts with Swagger and the DTOs in apps/api, and
   fix the web side. Work through the checklist under "Contract to check" in
   HANDOVER.md. Where a screen needs data the API does not return, add it to
   the API in the smallest way (list each one in the report). Money comes as
   kobo; if the API sends bigints as strings, keep formatNaira's string
   handling and type the fields as string.

3. Replace apps/web/src/lib/roles.ts and the permission strings with imports
   from packages/shared.

4. Generate the @theme block in apps/web/src/app/globals.css from
   tools/penpot-ds-tokens.json (tools/tokens-to-css.mjs, run as pnpm tokens),
   keeping the variable names the components use.

5. Map: document the MapTiler satellite-hybrid option in the README; add
   the geoBoundaries / GRID3 credit from docs/data-sources.md as custom
   attribution on all three maps (map home, corridor, wizard preview).

6. The invite link the API sends must point at /invite/<token>.

7. End to end on the dev branch, against the real API: admin:create, accept
   the invite, sign in with the PIN; create a project through all six wizard
   steps with a real KML (use the Kano-Katsina-Maradi fixture from the API
   tests) and send it for publishing; sign in as a Director (create one) and
   publish it through the task (PIN); open the project and check every
   section loads (empty sections are fine). As the IT administrator, add an
   organisation and a contractor site manager; as the Director, confirm the
   account from Tasks. Then typecheck and build apps/web.

8. Add Playwright with five tests mirroring the walkthroughs in
   HANDOVER.md ("Walkthroughs"), running against NEXT_PUBLIC_API_MOCK=1 so
   they need no API, and a pnpm script to run them.

9. Update CLAUDE.md (web stack, how to run, /api proxy, tokens, screen ids,
   mock mode) and commit as "feat(web): sign-in, map, project view, wizard,
   admin, task views".

Report the contract differences and how each was resolved, any API changes,
and the end-to-end result.
```

### Prompt B (merge into an already wired apps/web)

```
apps/web-next holds the latest web steps (up to step 6: project view,
create-project wizard, administration, task views, portfolio and reports) built on the same
base as apps/web. Merge them into apps/web, keeping
every API alignment already made in apps/web (types.ts, endpoints.ts,
messages.ts, roles from packages/shared, generated tokens). New files copy
across; for files changed in both, keep apps/web's version and add the new
parts from apps/web-next (new types, endpoints, mock data, the upload helper
in api.ts, the ?focus= handling on the map home). Then delete apps/web-next
and carry on from step 2 of Prompt A in apps/web/HANDOVER.md for the new
endpoints only.
```

## Contract to check

Sign-in and map home (step 1)
- POST /auth/otp/verify response; POST /auth/pin/login and /auth/pin/set
  bodies and token field; error body shape and codes (messages.ts); 429.
- GET /me permissions used: projects:create, portfolio:read.
- GET /map/projects properties; GET /map/counters field names.
- GET /projects/:id/card, including the contractor's lot-level card.
- GET /tasks (groups, doneToday); GET /media/:id (signed url field).

Project view (step 2)
- GET /projects/:id/gates (kind, approverRole, status, daysWaiting,
  evidence with code and title, uploadedBy, confirmedBy).
- GET /projects/:id/strip-map (lengthM, lots, disciplines with segments,
  trackFrontM) and /progress (planned vs actual per lot and discipline,
  trackKmByMonth, weeksBehind).
- GET /projects/:id/corridor: GeoJSON with properties.kind of lot, station,
  photo or incident (and state on lots).
- GET /projects/:id/lots; GET /lots/:id/certificates (with the chain of
  steps, role, actor, time) and /lots/:id/design-packages.
- GET /field/projects/:id/submissions (kind, status, flagged, chainageM,
  mediaId, summary, returnReason; filters ?kind=&status=).
- GET /projects/:id/documents grouped by gate; GET
  /documents/:id/download returning a signed url (add if missing).
- GET /projects/:id/parcels, /grievances, /sections, /incidents,
  /variations, /people (members and the responsibility matrix), /activity.

Wizard (step 3)
- POST /projects returns { id }; PUT /projects/:id updates basics (add if
  missing); basics fields: name, type, gauge, startTown, endTown,
  originKind, originReference.
- PUT /projects/:id/funding-route { route: loan | budget | ppp |
  state_private }.
- POST /projects/:id/alignment multipart with the file in field "file";
  returns lengthM, states, geometry.
- POST /projects/:id/stations { name, chainageM }; DELETE
  /projects/:id/stations/:stationId (add if missing).
- GET /users?role=nrc_project_engineer for the people picker (add a small
  directory endpoint if missing: id, name, organisation; scoped to people
  the project manager may add).
- POST /projects/:id/members { userId, role }.
- POST /projects/:id/documents multipart: code, gateNo, title, file.
- POST /projects/:id/gates/1/evidence { documentIds, effectiveDate }.
- GET /projects/:id/review: basics, fundingRoute, alignment, stations,
  members (confirmed flag), documents, gate1PassedOn, locked, returnReason.
- POST /projects/:id/send-for-publishing.

Task views (step 5)
- GET /tasks/:id: the screens expect type, title, reason, project,
  subjectId, actions (action, label, kind primary or return, needsPin,
  needsReason, needsFile, needsDate), blockedReason, chain (step, role,
  actor, at, current), documents, and subject with a kind per task type
  (photo, milestone, gate, certificate, design, variation,
  document_upload, account, publish). See TaskSubject in types.ts. Map the
  API's task detail onto this shape in endpoints.ts if it differs, rather
  than changing the components.
- POST /auth/pin/confirm { pin, action, subjectId } -> { token }; the token
  goes in the X-Pin-Confirmation header of POST /tasks/:id/act.
- POST /tasks/:id/act { action, returnReasonId?, comment?, documentId?,
  effectiveDate? }.
- GET /reference/return-reasons (id, label); add if missing.
- Photo subject: offsetM (metres from the line) and corridorWidthM, the
  lot's chainage range, and the check results in plain words.

Administration (step 4)
- GET/POST /admin/organisations (people count per organisation).
- GET /admin/users (status, last login, last upload, open tasks,
  memberships, awaitingDirector); POST /admin/users; resend-invite,
  reset-pin, deactivate { replacementUserId }.
- GET /admin/projects: projects with their lots, for the add-person drawer.
- GET /admin/settings and PUT /admin/settings/:key (label, value, unit,
  confirmedByMinistry); GET and PUT /admin/reminder-rules.
- GET /admin/notifications (the message log, never the codes) and
  GET /admin/audit.
- Permission admin:access for the IT administrator only (sample mode grants
  it to everyone so the screens can be seen).

Portfolio, reports, messages (step 6)
- GET /portfolio rows: id, name, status, health, currentGate {no, name},
  daysAtGate, physicalPercent, financialPercent (null without the
  permission), nextMilestone {name, dueOn}, states, contractor.
- GET/POST /projects/:id/reports { kind: monthly | lender, period: YYYY-MM };
  GET/POST /reports/portfolio { format: pdf | xlsx }; POST /reports/eyemark.
  Report: id, kind, period, format, status (queued, generating, ready,
  failed), version (finance | standard), createdAt, requestedBy (null when
  made automatically). The screens poll every 3 seconds while one is being
  made.
- GET /reports/:id/file: the screens expect { url } (a signed link). If the
  API streams the file instead, change getReportFile to open
  /api/reports/:id/file directly.
- GET/PUT /me/notification-preferences: channel, weeklyDigest,
  digestEligible (whether this person gets the Monday summary at all),
  quietFrom, quietTo. Only SMS is offered until push and email exist.
- GET /projects/:id/obligations: id, kind, title, expiresOn, owner,
  documentCode.
- Permission reports:eyemark (M&E analyst) shows the Eyemark button.

## Walkthroughs (to turn into Playwright tests)

1. Sign in: phone, code 123456, PIN 1111 is refused, PIN 2580 works, the map
   shows corridors, "Find" Kaduna-Kano opens its card, Tasks lists four.
2. Project view: open /projects/p-kk and every section loads with no error.
3. Wizard: New project, fill basics (Kano to Maradi), choose External loan,
   upload any .kml, add station Katsina at km 190, add Engr. K. Okafor,
   attach D01 and D02, date 2026-10-20, review, Send for publishing, see
   "Sent to the Director for publishing".
4. Tasks: open the flagged photo, Send back with "Outside the corridor";
   approve certificate 14 (PIN 1111 refused, 2580 accepted); the upload task
   refuses Submit without a file, then submits with a file and a date; the
   inbox goes from 7 tasks to 4.
5. Admin: add a CCECC site manager on Lot 3 (Director-confirmation note
   shown); reset a locked person's PIN; removing someone with open tasks
   needs a replacement; add an organisation; change the corridor width.
6. Portfolio and reports: the stalled project is first; Make a PDF shows
   "Being made" then Download; a project's monthly report for last month
   is made; the documents section lists four expiries; quiet hours from
   22:00 are saved and still there after a reload.

## Decisions made here

- Access token in memory only; reload restores the session from the refresh
  cookie. The browser calls only the web app's origin.
- A device id (random UUID in localStorage) goes with sign-in for device
  binding; the last phone used is remembered so the PIN screen comes first.
- The legend is also the status filter; it sits over the empty north-west.
- A hidden list of project buttons mirrors the map for keyboard and screen
  readers.
- Project view is one route per section (/projects/:id/gates and so on), so
  sections can be linked and bookmarked.
- Paid certificates fold their approval chain away; unpaid ones show it.
- Each task screen has one main button on the right and the return button
  on the left; the label says whether the PIN is needed. After a decision
  the confirmation says what happens next and the next task opens.
- The PIN sheet asks for the PIN each time and exchanges it for a
  single-use confirmation tied to that action and record.
- Removing a person with open tasks requires choosing who takes them.
- The wizard lives at /projects/new (step 1) and /setup/:id?step=n. The
  stepper only lets you open steps already done or the next one.
- The concept note can be attached at step 1 or step 5. Gate 1's date is
  entered at step 5 and the Director confirms it when publishing.
- Before an alignment is uploaded the map shows a straight dashed line
  between the two towns (src/lib/towns.ts); stations are placed on the
  preview by chainage, and the real positions come from the API.

## Known gaps

- Screens for the actions added in backend Step 8 that are not tasks yet:
  recording practical completion per lot, marking design requirements per
  lot, uploading a revised baseline, and adding an obligation. Each needs a
  small form on the relevant project section; the approvals they create
  already appear in Tasks.
- Map layers (legacy lines, state boundaries, no-go segments), chainage
  search, and a design-package upload screen.
