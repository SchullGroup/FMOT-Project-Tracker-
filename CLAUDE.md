# FMoT Rail Project Tracker

Project tracker for Nigeria's Federal Ministry of Transportation to track railway construction projects. Built by Schull Technologies.

Read `docs/screen-map.md` before any design or UI work and `docs/process-model.md` before any data-model, workflow or permissions work.

## Design work in Penpot

- Penpot 2.18, self-hosted at http://localhost:9001, reached through the `penpot` MCP server. The browser tab with the file must stay open with the MCP toggle on.
- Team "Schulltech Team", project "FMoT Rail Project Tracker".
- File "Wireframes" is the low-fidelity spec; read a wireframe board before building its hi-fi version, and never change it from the hi-fi work.
- File "FMoT Rail Tracker: Design System" is the shared library: pages 00 Cover, 01 Tokens, 02 Foundations, 03 Icons, 04 Atoms, 05 Molecules, 06 Organisms, 07 Templates, 99 Scratch. Leftovers go to 99 Scratch; nothing is deleted.
- File "FMoT Rail Tracker: UI" holds the hi-fi screens and consumes the library. Its pages and board names mirror Wireframes (screens/<id>, 1440x1024 web, 390x844 phone, 100 px gutters). Never mix library work and screen work in one file.
- The MCP plugin works only in the file it is open in; it cannot create files, switch files or publish a library. Those steps are done by hand in the Penpot dashboard.
- Pages are numbered so they sort: `01 Web Map home`, `02 Web Project view`, `03 Web Create project`, `04 Web Tasks`, `05 Setup`, `06 Mobile`.
- One board per screen, named `screens/<id>` using the ids in the screen map (`screens/w3-map-home`, `screens/m2-home`). Desktop boards are 1440x1024, phone boards 390x844, with 100 px gutters between boards.
- Layers are named `section/element`, lowercase, no spaces around the slash.
- Wireframes are low fidelity: greys, one dark accent for primary buttons, native Penpot text layers. The first two boards (`w3-map-home`, `w5-project-view`) carry raw-SVG text that will be replaced later; leave them.
- Never delete shapes, boards or pages. Read a board back after building it and fix overlaps.

## Status of the wireframes

| Page | Board | State |
| --- | --- | --- |
| 01 | screens/w3-map-home | done |
| 01 | screens/w1-sign-in | done |
| 01 | screens/w8-portfolio | done (priority 2) |
| 02 | screens/w5-project-view | done |
| 02 | screens/w5-gates, screens/w5-payments, screens/w5-documents | done |
| 03 | screens/w6-create-project | done (W6.1 Basics) |
| 03 | screens/w6-funding-route, screens/w6-geography, screens/w6-people, screens/w6-documents, screens/w6-publish | done |
| 04 | screens/w7-tasks | done (W7.0 inbox with the six flow rows + W7.4) |
| 04 | screens/w7-publish-project, screens/w7-confirm-account, screens/w7-verify-photo, screens/w7-upload-document, screens/w7-confirm-gate | done |
| 04 | screens/w7-approve-ipc-pin, overlays/return-reasons | done (priority 2) |
| 05 | screens/s2-users | done (with Add person drawer) |
| 05 | screens/s2-users-invited | done (priority 2) |
| 06 | screens/m2-home, screens/m3-capture | done |
| 06 | screens/m1-onboarding, screens/m4-report, screens/m6-incident | done |
| 06 | screens/m2-home-sent, screens/m5-milestones, screens/m7-sent-back | done (priority 2) |
| 02 | screens/w5-project-view-draft, screens/w5-people, screens/w5-land | done (gap review) |
| 04 | screens/w7-verify-milestone | done (gap review) |
| 05 | screens/s1-organisations, screens/w2-accept-invite | done (gap review) |
| 06 | screens/m8-outbox, screens/m9-re-home | done (gap review) |
| 01–06 | Boards changed by the gap review (w3-map-home, w8-portfolio, all w6-*, all w7-*, s2-users, s2-users-invited, m2-home, m2-home-sent) | redrawn to match page 07 on 29 Oct 2026; visible text checked identical on all 39 boards |
| 07 | Prototype: copies of every board above, wired, with flows A to E | done |
| 07 | screens/w6-publish, screens/w7-publish-project | rebuilt as Review and publish (gap-review gap 1); old layers kept in a hidden `archive / ...` group |
| 07 | screens/w6-* (all six) | new project renamed Kano–Maradi, 393 km (gap 5); step 6 is "Review and publish"; w6-people has the responsibility matrix (gap 4) |
| 07 | screens/w3-map-home | card reads Confirm gate: BPP no objection (gap 6); draft corridor and Drafts (1) chip (gap 2); Portfolio link (gap 13); blocker line links to w5-land (gap 15) |
| 07 | screens/w5-project-view-draft, screens/w5-people, screens/w5-land | done (gaps 3, 4, 15) |
| 07 | screens/s1-organisations, screens/w2-accept-invite | done (gaps 7, 8); flow B starts at s1-organisations |
| 07 | screens/m8-outbox, screens/m9-re-home; status chip row on m2-home and m2-home-sent | done (gaps 9, 10) |
| 07 | screens/w7-verify-milestone; Verify milestone row in every W7 inbox | done (gap 11) |
| 07 | Handoff chips on m2-home-sent (to m9-re-home), m9-re-home and w7-tasks (to w5-payments); extra W8 flow removed | done (gaps 12, 13) |
| 07 | Kano–Maradi is only the draft: the gate 6 BPP tasks are Lagos–Calabar coastal (inbox, w7-upload-document, w7-confirm-gate, W3 card, W8 at gate 6); W8 row 3 is Ibadan–Abuja; S1 and S2 lot lists use Port Harcourt–Maiduguri; the old orange Kano–Maradi line on W3 is hidden | done |

Update this table as boards are finished.

Page 07 Prototype exists because Penpot interactions and flows only reach boards on the same page. Pages 01 to 06 hold the same boards without links; page 07 holds the linked copies and the flows. Change a board on page 07 first, then redraw it on its source page with `storage.rebuildOn` so the two stay in step (they were brought back in line on 29 October 2026). Rebuilt boards keep their old layers in a hidden `archive / <board>-v1` group inside the board. Two scratch layers can be deleted by hand: `scratch / w6-create-project-accidental-copy` (page 03) and `scratch / orphan-text-from-failed-build` (page 01).

The board-drawing code is in `tools/penpot-helpers.js` and the element registry plus interaction table in `tools/penpot-state.json`. Load both at the start of a Penpot session; the header of the helpers file says how.

## Design system rules

- Tokens are dot paths, lowercase, kebab-case words, in five sets: `core` (what it is: `color.navy.900`, `spacing.16`), `semantic` (what it is for: `color.text.secondary`, `color.status.stalled.line`, `type.body`), `component` (where it is used: `button.primary.bg`, `map.corridor.width`), and two override sets, `semantic-large-text` (font-size.* +25 percent) and `semantic-high-contrast` (darker text, borders and lines). The full catalogue is in `tools/penpot-ds-tokens.json`.
- Themes, group Mode: Light (default: core, semantic, component), Large text (adds semantic-large-text), High contrast (adds semantic-high-contrast).
- Token changes go to both files. Penpot does not share tokens through a connected library, so the Design System file and the UI file each hold their own copy of the catalogue. Change a token in the Design System file first, make the same change in the UI file, then update `tools/penpot-ds-tokens.json`. On 29 October 2026 both files held the same 265 tokens with the same values and themes.
- Themes are file-wide, and layout only reflows on the page that is open. After switching theme, open each page in turn; after a check, switch back to Light the same way. A spacing or size set by hand on a token-bound property is reset by any theme switch, so bind a token instead.
- Screens and components use semantic or component tokens only, never core tokens, and never a raw value on a shape. Library colours (`core/<family>/<step>`, `semantic/<group>/<name>`) and typographies (`type/<name>`, `type/phone/<name>`) are generated from the tokens and store their source token; regenerate them with `D.genColors()` and `D.genTypos()`.
- Status families are fixed: operational (green; also commissioned), under-construction (orange), planned (grey; identified, funded, contracted), stalled (red), draft (dashed grey). Each has `.line` for map and legend, `.fg` and `.bg` for chips. The gate strip uses the same families: passed green, current orange outline, blocked red, not started grey outline.
- Navy is the primary action colour. Nigeria green only appears in the header stripe and crest area, never on a button or as a status. The crest is a 40x40 placeholder slot; the coat of arms is not drawn.
- Type: Outfit (since 29 October 2026; it replaced Inter), fallback Source Sans Pro. Every typography token points at `font.family.ui`, so a font change is that one token in both files plus `D.genTypos()` or `setFont` on the library typographies in the Design System file.
- Accessibility: body 16 px web and 18 px phone, nothing below 13 px, body line height 1.5, 4.5:1 for text and 3:1 for UI parts in every theme, 48 px touch targets on phone, one primary action per screen, shadows no deeper than 2 px.
- Components are named `atoms/<name>`, `molecules/<name>`, `organisms/<name>`, `templates/<name>` and `icon/<name>`, all lowercase, with states and sizes as Penpot variants.

## Status of the hi-fi work

| File | Page or phase | State |
| --- | --- | --- |
| Design System | Phase 1: tokens (5 sets, 265 tokens), 3 themes, 106 library colours, 17 typographies, foundations sheets and grids | done 29 Oct 2026, approved |
| Design System | Phase 2: 20 icons, 12 atoms (81 variants), 17 molecules, 19 organisms, 8 templates | done 29 Oct 2026, approved |
| Design System | Final run, step 1: 6 more icons (microphone, equipment, close, chevron-right, edit, map); what-is-this tile gains a selected state and an Equipment kind (14 variants); 12 molecules (recap-block, kv-row, keypad, matrix-row, gate-row, ipc-row, parcel-row, admin-row, portfolio-row, outbox-row, milestone-row, handoff-chip); 3 organisms (responsibility-matrix, re-swipe-card, phone-top-bar). Totals: 26 icons, 12 atoms, 29 molecules, 22 organisms, 8 templates | done 29 Oct 2026 |
| Design System | Six organisms (top-bar, project-header, left-nav, admin-nav, map-legend, layers-panel) were built on page 05 at x 3200+; the plugin cannot move shapes between pages, so they are cut and pasted onto page 06 by hand. Check page 06 before relying on this | check by hand |
| UI | Setup: pages 01 to 07, Design System library connected, token catalogue installed (identical to the library) | done 29 Oct 2026 |
| UI | Phase 3: all 39 boards on pages 01 to 06 (table below) | done 29 Oct 2026; heroes approved |
| UI | Phase 4: page 07 Prototype, 39 linked copies, flows A to E, QA, Large text proof | done 29 Oct 2026 |
| Both | Font changed from Inter to Outfit: `font.family.ui` token in both files, 17 library typographies, Foundations note | done 29 Oct 2026; every text layer in both files is Outfit |
| Design System | Large text fixes: `molecules/person-line` and the person line and blocker in `organisms/project-card-panel` wrap and grow (fill width, auto height, minimum heights); `molecules/table-row` body rows hug their content; new `molecules/shortcut-tile`; `templates/phone-home` and `templates/phone-form` are variant sets `size: 844 \| tall` (390x1200) with the status bar and header fixed when scrolling and the body filling the board | done 29 Oct 2026 |
| UI | Large text fixes applied to the existing instances (15 project cards, 78 person lines); m2-home and m2-home-sent tiles swapped for `molecules/shortcut-tile` on pages 06 and 07 (old tiles hidden as `archive/btn-*`); Take photo on m2-home now 104 px tall so Call support clears the home indicator | done 29 Oct 2026 |
| UI | Large text proof re-run on page 07: proof/w3-map-home-large-text holds (card person line and blocker grow, nothing overlaps in the card); proof/m2-home-large-text is on the tall layout (390x1200, flex column, sticky header) and shows everything, content ends at about 940 px. File back on Light; QA clean on all 80 boards (5,545 texts) apart from the deliberate overlaps | done 29 Oct 2026 |

### Hi-fi screens in the UI file

Ids are listed in `tools/penpot-state.json` (`ui_board_ids` for pages 01 to 06, `ui_page07_board_ids` for page 07). Every board was checked on 29 October 2026 under the Light theme: no text below 13 px, no text under 4.5:1, every text and fill token-bound, no text outside its board.

| Page | Boards | State |
| --- | --- | --- |
| 01 Web Map home | screens/w3-map-home (hero), screens/w1-sign-in, screens/w8-portfolio, screens/w2-accept-invite | done |
| 02 Web Project view | screens/w5-project-view (hero), screens/w5-gates, screens/w5-payments, screens/w5-documents, screens/w5-people, screens/w5-land, screens/w5-project-view-draft | done |
| 03 Web Create project | screens/w6-create-project, screens/w6-funding-route, screens/w6-geography, screens/w6-people (responsibility matrix), screens/w6-documents, screens/w6-publish (Review and publish) | done |
| 04 Web Tasks | screens/w7-tasks (inbox with all seven task rows), screens/w7-publish-project, screens/w7-confirm-account, screens/w7-verify-photo, screens/w7-upload-document, screens/w7-confirm-gate, screens/w7-verify-milestone, screens/w7-approve-ipc-pin, overlays/return-reasons | done |
| 05 Setup | screens/s1-organisations, screens/s2-users (Add person drawer open), screens/s2-users-invited | done |
| 06 Mobile | screens/m2-home (hero), screens/m3-capture (hero; Drainage tile swapped for Equipment, old tile hidden as `archive/tile-drainage`), screens/m1-onboarding, screens/m4-report, screens/m5-milestones, screens/m6-incident, screens/m2-home-sent, screens/m7-sent-back, screens/m8-outbox (five statuses), screens/m9-re-home | done |
| 07 Prototype | Linked copies of all 39 boards; flows A Create project (w3-map-home), B Onboarding (s1-organisations), C Monitoring (w1-sign-in), D Field uploads (m2-home), E Documents (w7-tasks); handoff chips m2-home-sent → m9-re-home, m9-re-home and w7-tasks → w5-payments, s2-users-invited → w2-accept-invite; Portfolio in every web top bar. Flows Penpot created on its own are kept and renamed `Extra: <board> (auto-created by Penpot)` | done |
| 07 Prototype | proof/w3-map-home-large-text (1440x1024) and proof/m2-home-large-text (390x1200, the tall phone-home layout): copies used to test the Large text theme. Both hold since the fixes of 29 October 2026 | done |

Expected overlaps, kept on purpose: the Maiduguri label sits under the docked project card on w3-map-home; the PIN sheet covers the approval chain on w7-approve-ipc-pin; the drawer covers the table on s2-users and s1-organisations.

Still open after the Large text proof on w3-map-home: the Drafts (1) chip clips its icon, the left panel (tasks and layers) runs past 1024 px and would need to scroll, and the docked project card reaches the imagery attribution. The phone screens themselves stay 390x844; content past 844 px under Large text needs the tall template variant or a scroll container in the app.

One stray layer in the UI file can be deleted by hand: `scratch / person-line-probe` (page 07, hidden, at x -2000), a test instance from the library check.

## Known limitations

- Variant switching on nested instances does not work through the plugin API (`switchVariant` fails on nested and older instances), so a few nested states (toggle positions, the draft header chip) are visual overrides, not true variants. Swap them by hand in Penpot if the variant matters.
- Some what-is-this tile kinds use generic Lucide icons as stand-ins (Equipment is a wrench; others reuse existing icons). Replace them when proper icons exist.
- Penpot themes are file-wide: Light, Large text and High contrast cannot sit side by side in one view, so the Large text proof boards only show Large text while that theme is active. Layout only reflows on the page that is open, so after a theme switch, open every page in turn.
- Penpot only re-measures text that is in the viewport. After a font, theme or text change, zoom to fit the page (or zoom into the shape) before reading sizes, exporting or running QA; boards elsewhere keep stale sizes until then.
- Instances whose text was overridden keep their own geometry, so a layout fix in a library component does not reach them through a library update. Re-apply the fix to the instances (`uiLargeTextFixes` in `tools/penpot-helpers.js`) or rebuild them from fresh instances.
- The plugin API cannot remove a token from a shape. `molecules/table-row` body rows still carry the `table.row-height` token on height although they now hug their content; a theme switch leaves them on auto, but unbind it by hand if it ever forces 48 px back.

The page 07 code (layout, wiring table, QA and the Large text fixes) is `installUI3` in `tools/penpot-helpers.js`.

## Database

- Neon project `fmot-rail-tracker` (`wild-paper-65564975`) in the Tochi organisation, region aws-eu-central-1 (Frankfurt), PostgreSQL 18 with PostGIS 3.6. Created 2 November 2026.
- Branches: `main` (default) and `dev` (branched from main after PostGIS was enabled). Work on `dev` or a branch per feature (`neon checkout <name> --create`); `main` takes migrations only.
- This folder is linked through `.neon`; `neon checkout` writes `DATABASE_URL` and `DATABASE_URL_UNPOOLED` into `.env.local`. Both files are git-ignored; never commit connection strings.
- Use the `neon` CLI (8.12+); `neonctl` is the old name and is not installed. The local `psql` is 17, which is fine for queries; `pg_dump` against the server needs 18.
- Frankfurt is for development. The process model requires Nigerian hosting under the Nigeria Data Protection Act for production, which Neon does not offer, so production hosting is still open.

## Database schema

Drizzle schema in `apps/api/src/database/schema/`, one file per area, all exported from `index.ts`. Every table has a uuid `id` (`gen_random_uuid()`), `created_at` and `updated_at`; columns are camelCase in TypeScript and snake_case in Postgres (`casing: 'snake_case'` in both the app and drizzle-kit).

- Enums only for lists the code branches on: statuses, kinds, decisions, organisation types, roles, funding routes. Lists the administrator edits on S5 are reference tables (`code`, `label`, `sort_order`, `active`) referenced by uuid foreign key: disciplines, asset_types, incident_types, return_reasons. Retire a value by setting `active = false`, never by deleting it.
- Every unique constraint and index is named explicitly in snake_case: `<table>_<columns>_key` for unique, `<table>_<columns>_idx` for b-tree, `<table>_<column>_gist` for spatial.

| Area (file) | Tables |
| --- | --- |
| Reference data (`reference.ts`) | disciplines, asset_types, incident_types, return_reasons |
| Identity (`identity.ts`) | organisations, roles (the 18 built-in roles), users, invites, devices, otp_codes, refresh_tokens, used_tokens |
| Projects (`projects.ts`) | projects, project_states, lots, assets (stations are an asset type), memberships, project_lenders |
| Boundaries (`boundaries.ts`) | admin_boundaries (ADM1: 36 states and the FCT, MultiPolygon) |
| Gates (`gates.ts`) | gate_templates (one per funding route), gate_template_steps (15 per template), project_gates, delegations |
| Documents (`documents.ts`) | document_types (D01 to D30), documents, document_versions |
| Field (`field.ts`) | submissions, submission_media, milestones, progress |
| Design (`design.ts`) | design_packages, design_package_reviews |
| Money (`money.ts`) | valuations, payment_certificates, disbursements |
| Land and risk (`land-risk.ts`) | parcels, grievances, site_sections, incidents, variations |
| Workflow (`workflow.ts`) | tasks, approvals, audit_log |
| Notifications (`notifications.ts`) | notifications, notification_preferences, reminder_rules |

- Money is integer kobo in `bigint` columns named `*_kobo` (N1 = 100 kobo), read as JavaScript `bigint`; never float or numeric. Payment certificates enforce net = gross − retention − advance recovery in a check constraint.
- Distances and chainages are whole metres in `integer` columns named `*_m` (`length_m`, `chainage_from_m`, `accuracy_m`); never kilometres or decimals in the database. Format as km+m (`142+300`) only in the UI.
- Geometry is PostGIS in SRID 4326 (`geometry.ts`): `lineString()` (projects.alignment), `point()` (assets, submissions, incidents), `polygon()` (parcels.area) and `multiPolygon()` (admin_boundaries), GeoJSON in TypeScript and hex EWKB on the wire, each with a GiST index. Measure lengths as `ST_Length(alignment::geography)` (metres on the spheroid).
- `approvals` and `audit_log` are append-only: triggers in migration 0002 reject UPDATE, DELETE and TRUNCATE. They have `created_at` only. Corrections are new rows.
- Migrations: `pnpm db:generate` (add `--custom --name=<name>` for hand-written SQL), review the SQL in `apps/api/drizzle/`, then `pnpm db:migrate`. It runs against the checked-out Neon branch and refuses `main` unless `ALLOW_MAIN_MIGRATIONS=1`. `0000_enable_postgis` must stay first. When a change removes a column and adds another in the same table, `drizzle-kit generate` asks whether it is a rename and needs a terminal; answer deliberately (create or rename) and check the SQL. Applied so far: 0000_enable_postgis, 0001_schema, 0002_append_only_triggers, 0003_evidence_gates_reference_tables, 0004_auth_token_version_family, 0005_projects_gates_lenders_boundaries.
- `pnpm db:seed` loads reference data only from `src/database/seed-data.ts`: the four reference lists, the two project-health thresholds (reminder_rules, inserted once and never overwritten), the service provider Schull Technologies, 18 roles, 30 document types, 4 gate templates with 15 steps each and their prerequisites.
- `pnpm db:load-boundaries` loads the state boundaries from the pinned geoBoundaries file (source and CC BY 4.0 credit in `docs/data-sources.md`); it refuses `main` unless `ALLOW_MAIN_LOAD=1`. It upserts, so re-running is safe, and refuses `main` unless `ALLOW_MAIN_SEED=1`.

Modelling decisions (2 November 2026, revised the same day), open to change:
- Gate kinds: gates 1 to 11 are attach-evidence and the Director, rail confirms them. Gate 1 needs D01 and D02, gate 2 D04 (the accepted feasibility study), gate 3 D02. Decision (2 November 2026): the project manager uploads the Minister's minute (D02) for gates 1 and 3; every template step has exactly one uploader role, and the Minister's office hands the minute to the project manager. Gates 12 to 15 are approve-in-system: 12, 14 and 15 by the NRC project engineer, 13 by the accounting officer.
- Gate 13 is a monthly loop per payment certificate: the RE recommends, the NRC engineer certifies, the Director, rail approves, the Permanent Secretary gives final approval, and Finance marks it paid with payment evidence. Each step is an `approvals` row; the template's approver is the final one.
- Gate 4 is the only gate that differs by route (D07 budget, D08 loan, D09 PPP, none yet for state or private). Reminders: 14 days for evidence gates, 5 for approve-in-system gates.
- Document uploaders follow the screen map's code list; D04, D05 and D09 (rail directorate in the register) go to the project manager, D25 to the contractor commercial manager, D27 has no uploader (system). Sensitivity: financial for D06 to D09, D12 to D15, D17, D19, D24, D26, D27, D30; security for D25; public for D16; internal for the rest.
- Organisations of type `service_provider` (Schull Technologies) can hold only the IT administrator role, which ministry units can also hold.
- Invites are rows of their own: a resend revokes the previous invite, and invites to external organisations carry `requires_director_confirmation` until the Director confirms.
- Site sections start blocked; a section becomes available only with the Director's sign-off (who and when), enforced by a check constraint.
- Design packages point at their D21 document (`current_document_id`); each resubmission is a new document version, and every RE or NRC step is a `design_package_reviews` row.
- Notification preferences are one row per user (channel, weekly digest, quiet hours in Lagos time).

## Authentication and access

Phone number, SMS code and a 4-digit PIN; no passwords and no email. Code in `apps/api/src/auth`, `admin`, `scope`, `sms`, `audit`; roles and permissions in `packages/shared`.

- Phones are stored and compared in E.164 (`normalisePhone`, default region NG: 0803... becomes +234803...); invalid numbers are rejected with 400.
- Secrets at rest: SMS codes, PINs, invite tokens and refresh tokens are argon2id hashes only. Invite and refresh tokens are opaque `<row id>.<secret>`; the id finds the row, the secret is checked against its hash. Audit rows and logs never hold codes, PINs, tokens or hashes; request logs redact the Authorization, Cookie and X-Pin-Confirmation headers.
- SMS goes through the `SMS_SENDER` provider. `DevConsoleSmsSender` writes texts to the server log and refuses to start in production; the Nigerian provider replaces it in Step 8.
- Invites: the IT administrator creates the user (`POST /api/admin/users`) as invited with an invite valid 72 hours. Contractor, consultant and lender people need the Director's confirmation first: the invite waits, the Director gets a Confirm new account task, and the SMS goes out only after `POST /api/admin/invites/:id/confirm` (Director only, PIN step-up, never by the person who created the invite). The invitee opens the link (`GET /api/invites/:token`), asks for a code (`POST /api/invites/code`), and accepts with code, PIN and device (`POST /api/invites/accept`), which activates the account and binds the device. Resend revokes the old invite; reset PIN clears the PIN and unlocks; deactivate revokes sessions, devices and open invites and records the replacement.
- Sign-in: `POST /api/auth/otp/request` (same 202 whether or not the phone has an account; at most 3 per phone per 15 minutes, then 429 for everyone) and `POST /api/auth/otp/verify` (6 digits, valid 10 minutes, 5 tries) give a 10-minute ticket tied to the device. `POST /api/auth/pin/login`: a bound device needs only the PIN; a new device needs the ticket. `POST /api/auth/pin/set` sets the PIN after a reset. Five wrong PINs (sign-in or step-up) lock the account, sign it out everywhere and give the IT administrator an Unlock account task. PINs that repeat or run in sequence (1111, 1234, 4321) are refused.
- Tokens: access JWT 15 minutes (HS256, `JWT_ACCESS_SECRET`; claims sub, role, org, token version). The guard reads the user on every request, so raising `users.token_version` (lock, PIN reset, deactivate) ends every session at once. Refresh token 30 days, rotated on every use; presenting a rotated-out token revokes its whole family. Web gets it in the `fmot_refresh` cookie (httpOnly, Secure, SameSite=Strict, path /api/auth); mobile sends `X-Client: mobile` and gets it in the body. Step tokens (OTP ticket 10 minutes, PIN confirmation 2 minutes) are signed with `JWT_REFRESH_SECRET`. Both secrets are 64 random bytes in `apps/api/.env`, at least 64 characters and different from each other.
- PIN step-up: `POST /api/auth/pin/confirm` takes the PIN, the action (`STEP_UP_ACTIONS` in `@fmot/shared`: invite.confirm, membership.confirm, project.publish, gate.confirm, gate.approve, lot.confirm, section.sign_off) and the subject id, and returns a token valid 2 minutes for that user, action and subject. Every decision endpoint carries `@RequiresPinConfirmation('<action>', params => subject)`, reads the token from `X-Pin-Confirmation`, checks it names this action and subject, and records its jti in `used_tokens`, so a second use is refused (`pin_confirmation_used`).
- Every JWT carries `typ` and `aud` (access / fmot:api, otp_ticket / fmot:auth, pin_confirm / fmot:step-up) and each verifier accepts only its own, so no token stands in for another.
- Nightly clean-up (02:00 Lagos, `CleanupService`): OTP rows a day after they expire, used step-up tokens once expired, refresh tokens revoked more than 30 days ago.
- Guards: global throttling (120 requests a minute per IP, 10 on the sign-in routes; off in tests), a global `JwtAuthGuard` (`@Public()` opens a route), and `@RequirePermission('resource:action')` checked against `ROLE_PERMISSIONS` in `@fmot/shared`. Financial amounts (`finance:read_amounts`), security detail (`security:read_detail`) and live field positions (`field:read_live_positions`) are separate permissions. The IT administrator holds only admin and audit permissions, never a decision.
- Scope rule: every project-scoped query adds `scopeWhere(await scopes.forUser(user), { projectId, lotId })`. The Minister and Minister of State, Permanent Secretary, Director, M&E and oversight (Auditor-General included) see all projects. The security desk also sees every project, but its permissions stop at incidents, no-go segments and live field positions (no documents, gates or money). Everyone else sees the projects and lots of their confirmed, current memberships; lenders also see the projects in `project_lenders` for their organisation while the facility is in force. Contractors see only their own lots: tables without a lot column return nothing to them, except the project row itself (`projectRowOnly`). On top of scope, draft projects are visible only to their creator and the Director, rail (`ProjectAccessService`).
- Bootstrap: `pnpm admin:create --name "<name>" --phone <phone>` creates the first IT administrator in Schull Technologies and prints the invite link once; it refuses when an active IT administrator exists (add `--force`).
- Tests (`pnpm test:e2e`) run the whole app on the dev branch inside one transaction that is rolled back, with a fake SMS sender (`test/support/app.ts`); nothing is left on dev.

## Projects, map and gates

Code in `apps/api/src/projects` (wizard, gates, documents, lots and sections, map), `storage` and `workflow`.

- Storage: `StorageService` (`STORAGE` token). Development writes to `apps/api/storage/` (git-ignored); production gets an S3-compatible adapter in Step 8 (the stub throws). Uploads are multipart, streamed with busboy into storage while the sha256 and size are computed, limited to 25 MB, and typed by their first bytes and extension, never the client's Content-Type: pdf, docx, xlsx, jpg, png, kml, kmz, geojson, zip (shapefiles). A refused record removes its stored file.
- Wizard (W6, project manager): `POST /api/projects` creates a draft (optionally with a dashed placeholder line between the two towns) and makes the creator its first member; `PUT .../funding-route` creates the 15 project gates from the route's template (gate 1 in progress); `POST .../alignment` takes KML, KMZ, GeoJSON or a zipped shapefile, merges the pieces with `ST_LineMerge` into one LineString (refused if it stays in pieces or misses Nigeria), stores `length_m` from `ST_Length(geography)` and the states from `ST_Intersects` with the boundaries; `POST .../stations` places a station at its chainage with `ST_LineInterpolatePoint`; `POST .../members` adds people (external organisations wait for the Director); `POST .../documents` stores D01 and D02 on gate 1; `GET .../review` is the five-step recap with the responsibility matrix; `POST .../send-for-publishing` sets gate 1 awaiting confirmation with the minute's date, locks the draft and gives the Director a Publish project task; `POST .../publish` (Director, PIN step-up, never the creator, also a database check) passes gate 1 and makes the project identified; `POST .../return-draft` unlocks it with a return reason.
- Documents: one row per register code and gate; uploading the same code again is a new version and needs a reason. Only the code's uploader role may upload. The list hides financial documents without `finance:read_amounts` and security documents without `security:read_detail`.
- Gates: `GET .../gates` gives the 15 rows (kind, roles, status, dates, days waiting, evidence, uploaded by, confirmed by). Evidence gates (2 to 11): the step's uploader role attaches documents with the decision date (`POST .../gates/:no/evidence`), the approver role or a delegate confirms (`.../confirm`, PIN step-up, never the uploader) once the prerequisites have passed and the required codes are present, or returns it with a reason (`.../return`). Gate 1 passes only through publishing. Approve-in-system gates 12 to 15 have `.../approve`, which answers 501 until Steps 6 and 7. Every decision writes an approvals row and an audit row. Passing a gate opens the gates whose prerequisites are now met and moves the project on: gate 1 identified, 4 funded, 8 contracted, 11 under construction, 14 commissioned, 15 operational.
- Prerequisites: each gate needs the one before it, except 9 and 10 (environment, right-of-way), which need only 4 and run beside 5 to 8; the two tracks meet at 11, which needs 8, 9 and 10.
- Lots and sections: lots are added from gate 8 on (gate 8 reached), within the line and not overlapping another open lot, and wait for the Director's Confirm. Site sections start blocked, show on the project card as blockers ("Site not available km 140+000 to km 152+000"), and become available with the Director's sign-off.
- Map: `GET /api/map/projects` is a GeoJSON FeatureCollection of the projects in scope (simplified to about 55 m), with status, current gate (the lowest gate not passed), days at gate and health; `GET /api/map/counters` counts on track, behind, stalled and drafts; `GET /api/projects` searches and filters (name or town, status, funding route, contractor, state); `GET /api/projects/:id/card` is W4 (financial percent only with `finance:read_amounts`; lot-limited contractors get 404).
- Health: stalled if the project is marked stalled or has waited 90 days at its current gate, behind after 2 x the gate's reminder days, otherwise on track; drafts have none. The two numbers are `health.behind_factor` and `health.stalled_days` in reminder_rules. They are placeholders: the ministry must confirm these thresholds before go-live.

## Code conventions

- Repository: a pnpm workspace (`apps/*`, `packages/*`), Node 26 (`.nvmrc`). `apps/api` is the backend, `packages/shared` (`@fmot/shared`: roles, permissions) holds code shared by the API, web and mobile apps; it compiles to `dist`, and the API's build, start and test scripts build it first. Root scripts: `pnpm api` (API in watch mode), `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed` (forward to the scripts of the same name in `apps/api`, which also has `db:studio`). pnpm only runs install scripts that `allowBuilds` in `pnpm-workspace.yaml` approves: esbuild is allowed, `@scarf/scarf` (install analytics) is denied. Approve new ones with `pnpm approve-builds <pkg>`.
- `apps/api` is an ES module package (`"type": "module"`, `nodenext`): relative imports end in `.js` (`import { DB } from '../database/database.module.js'`). Routes sit under `/api`; Swagger at `/api/docs`; `GET /api/health` checks the database and PostGIS. Config loads `apps/api/.env` (port, CORS) and the root `.env.local` (database URLs from `neon checkout`), validated by the zod schema in `src/config/env.ts`. The app uses the pooled `DATABASE_URL`; drizzle-kit uses `DATABASE_URL_UNPOOLED`. `pnpm test:e2e` runs against the checked-out Neon branch.
- API stack: Drizzle ORM with `pg` (drizzle-kit for migrations), `@nestjs/config` with zod for environment validation, class-validator and class-transformer for request DTOs, `@nestjs/swagger` for the OpenAPI document, helmet, and nestjs-pino logging (pino-pretty in development).
- Backend: NestJS 12 (TypeScript, strict), PostgreSQL with PostGIS on Neon, JWT with role-based access; scope is a row filter on every query, never trusted from the client. It replaced the earlier Java and Spring Boot plan on 2 November 2026 so the API, web and mobile apps share one language. Tests run on Vitest, linting on oxlint.
- Web: Next.js with MapLibre GL.
- Mobile: React Native with Expo, offline-first, in-app camera only.
- British spelling in UI text and docs.
