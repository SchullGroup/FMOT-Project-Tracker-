# Screen map

Every screen of the platform with what it contains and who sees it: a web app whose home is the map of Nigeria with projects on it, a setup area for the IT administrator, and a mobile app for the field. Screens are numbered W (web), S (setup), M (mobile) and P (public) so they can be referenced in design and build.

## Web app: access and the map home

The map is the home screen for every web user, with the task list riding beside it, so a Director lands on Nigeria with projects on it and a project manager lands on the same map already zoomed to their corridor.

| Screen | Who sees it | Contents | Actions |
| --- | --- | --- | --- |
| W1 Sign in | Everyone | Phone number field; SMS code field; PIN pad after first login; Call support link | Enter code; set or enter PIN; resend code |
| W2 Accept invite | New users (from the SMS link) | Welcome with name and role as the administrator set them; code field; PIN setup; camera and location permission prompts (mobile) | Accept; set PIN |
| W3 Map home | Everyone except site managers (they get M2) | Satellite base map of Nigeria; project corridors drawn as lines coloured by status, with station and structure icons at closer zoom; three counters at the top (on track, behind, stalled) for the projects the user can see; search (project, town, chainage); filter chips (status, phase, funding route, contractor, state); layer toggles (legacy lines, state boundaries, stations, lots, security no-go segments where permitted); legend; New project button for project managers and the Director; hover card with name, percent complete, status and the person in charge | Click a corridor to open its card (W4); fly to a project from search; toggle layers; start Create project (W6) |
| W4 Project card | Anyone who can see the project | Side panel: name, type, length, states crossed, current gate and days at that gate, percent per discipline as small bars, physical versus financial percent, latest verified photo, person in charge with phone number, blockers and open alerts, lender if any | Open project (W5); Set as my current project; share link |

Setting a current project pins it in the top bar and opens the map already zoomed to it on the next visit.

## Project view (W5)

Opening a project from the map leads to one page with a fixed header and sections down the left; the header stays visible everywhere so the user always knows which project they are in.

Header: project name, status chip, current gate with days at gate, percent complete, person in charge with phone, contractor and consultant, Back to map.

| Section | Who sees it | Contents | Actions |
| --- | --- | --- | --- |
| W5.1 Overview | All members | Gate strip showing all 15 gates with passed, current and blocked; key numbers (physical versus financial percent, planned versus actual, contract sum where permitted); corridor inset map; strip map of progress per discipline along the chainage; six latest verified photos; open alerts | Jump to any section |
| W5.2 Gates | All members; approvers act | One row per gate: name, kind (approve in system or attach evidence), approver, status, date passed, days waiting, evidence documents, who uploaded and who confirmed | Attach evidence; Approve or Confirm with PIN; Return with reason |
| W5.3 Corridor | All members | Full-width corridor map with lots, stations, bridges, culverts and level crossings coloured by status; the strip map per discipline; the track-laying front; photo pins by chainage; time versus chainage chart of planned against actual | Click any asset for its status and photos; filter by lot or discipline |
| W5.4 Photos and reports | All members; RE verifies | Timeline by date and by chainage; filters (lot, discipline, verified, flagged, sent back); photo detail with the dot on the corridor, accuracy, time, device, automatic checks and the verification history; daily and weekly reports | Verify or Send back (RE); escalate (PM); download |
| W5.5 Progress and measurement | All members; RE edits | Percent per discipline per lot; milestone list with claimed, verified and dates; monthly measurement sheets; track-km laid per month against plan | Confirm quantities; submit sheet; recommend certificate |
| W5.6 Payments | Finance, approvers, lender viewer; amounts permission-gated | List of interim payment certificates with the chain status (recommended, certified, approved, paid); valuation attached; payment evidence; disbursement records; retention and advance recovery | Certify, Approve, Mark paid, Return |
| W5.7 Design | NRC, RE, PM, contractor | Design packages per discipline with status, comments and versions; approved-for-construction drawings | Comment; Recommend; Approve; Return |
| W5.8 Documents | By document sensitivity | The register for this project grouped by gate: code, title, version, uploader, date, gate link | Upload new version; download; link to a gate |
| W5.9 Land and community | PM, Director, NRC, oversight | Compensation register by parcel (owner reference, valuation, status, payment evidence); grievance log; section-by-section site availability; utilities relocation items | Mark paid or disputed; attach evidence; sign off section (Director) |
| W5.10 Issues, incidents and variations | PM, RE, security desk, legal | Incident log with type, chainage, status; risk list; variation and extension-of-time requests with their approval trail | Raise; recommend; send up; close |
| W5.11 People | All members; PM edits | Members by organisation and role; the responsibility matrix generated from the gate template (uploader, verifier, approver per gate); contacts with phone numbers; delegations | Add or remove member (request to administrator); delegate a gate (Director) |
| W5.12 Reports | PM, Director, executives, lender viewer | Generated monthly progress report and lender report for each month; export history | Generate; download; share |
| W5.13 Activity | Approvers, auditor | Audit trail of every change and approval on this project | Filter; export |

## Create project (W6)

Create project starts from the New project button on the map and ends with the project drawn on the map, so the person sees the result of each step on the map beside the form.

| Step | Screen contents | Who | Result on the map |
| --- | --- | --- | --- |
| W6.1 Basics | Name; type (new line, rehabilitation, extension, station); gauge; start and end towns; states crossed (auto-filled from the line); origin reference (master plan, directive, state request, unsolicited proposal); concept note upload | Project manager | A dashed placeholder line between the two towns |
| W6.2 Funding route | Four large choices (budget, external loan, PPP, state or private); the gate template for the choice is shown as a preview strip | Project manager | Nothing yet |
| W6.3 Geography | Upload the alignment (KMZ or shapefile) or keep the placeholder; stations list with chainage; expected length | Project manager; NRC engineer checks | The real alignment replaces the placeholder; stations appear |
| W6.4 People | Project manager (owner, prefilled), Director (automatic), NRC project engineer (pick from list); consultant and contractor organisations are added later at gate 8 | Project manager; Director confirms external organisations | Person in charge shows on the hover card |
| W6.5 Documents | Concept note and the Minister's approval minute attached; gate 1 is marked passed with the date | Project manager | Status becomes Identified |
| W6.6 Publish | Preview of the project card and its place on the map; Publish button | Director | The corridor animates onto the map for everyone who can see it |

Adding a lot later (gate 8): Project, Corridor, Add lot: contract reference, contractor organisation, consultant organisation, chainage from and to, contract sum (permission-gated), dates. The lot appears as a segment of the corridor with its own colour.

## Tasks (W7)

Tasks is the same list that rides beside the map, opened full screen, and every task type is one screen with one primary button and a Return button that asks for a reason from a list.

| Screen | Who | Contents | Primary button |
| --- | --- | --- | --- |
| W7.0 Task inbox | Everyone | Tasks grouped by project, oldest first, each with type, project, age and a one-line why; Done today count | Open |
| W7.1 Verify photo or report | Resident engineer | The photo large; its dot on the corridor against the lot's chainage range; automatic checks in green or amber (inside corridor, time, device, duplicate); the submitter; the previous photo at that chainage | Verify (and Send back) |
| W7.2 Verify milestone | Resident engineer | The claim, its two photos, the milestone definition, quantity involved; Verify on site opens the mobile app flow | Verify |
| W7.3 Confirm gate | Director | The gate, the evidence document opened in a viewer, who uploaded it and when, the date entered | Confirm (PIN) |
| W7.4 Approve payment certificate | NRC engineer, Director, Permanent Secretary | Amount (permission-gated), the chain so far with names and dates, the measurement summary, the verified photo count, deductions | Certify or Approve (PIN) |
| W7.5 Approve design package | NRC engineer, Director | Package title, discipline, RE comments, drawings viewer, version | Approve (PIN) |
| W7.6 Approve variation or extension | Director | Claim, consultant assessment, recommendation, amount or days, threshold note (needs BPP and FEC above it) | Approve or Send up |
| W7.7 Upload document | Procurement, legal, finance, PM | The document name expected, the gate it belongs to, file picker, date field | Submit |
| W7.8 Confirm new account | Director | Person, organisation, role, projects or lots requested by the administrator or a contractor | Confirm |
| W7.9 Mark paid | Finance officer | The approved certificate, amount, payment advice picker, date | Mark paid |

## Reports and notifications (W8)

Reports are generated from the data, never typed, and notifications are set once by the administrator with a small per-user choice of channel.

| Screen | Who | Contents | Actions |
| --- | --- | --- | --- |
| W8.1 Reports hub | PM, Director, executives, M&E, lender viewer | Portfolio report (all visible projects), project monthly report, lender report in the lender's format, Eyemark export; each with month picker and history | Generate; download PDF or Excel; share link |
| W8.2 Portfolio dashboard | Executives, Director, M&E, oversight | Table of all projects with status, gate, days at gate, percent physical and financial, next milestone; charts of track-km laid per month and spend against plan; filters | Sort; filter; export |
| W8.3 My notifications | Everyone | Channel (SMS, app push, email); weekly digest on or off; quiet hours | Save |

## Setup and administration (S1 to S10)

Setup is a separate area for the IT administrator with no map and no approve buttons; the security desk console sits here too because it changes what others can see.

| Screen | Who | Contents | Actions |
| --- | --- | --- | --- |
| S1 Organisations | Administrator | List with type (ministry unit, NRC, contractor, consultant, lender, state, oversight), contact person, status; organisation page with its people and projects | Add; edit; deactivate |
| S2 Users | Administrator | Searchable list with name, phone, organisation, role, status (invited, active, locked, deactivated), last login, last upload, pending tasks; user page with memberships (project or lot and role), device, invite history | Add person; send or resend invite; reset PIN; move to another lot; deactivate and name replacement |
| S3 Roles and permissions | Administrator (read-only matrix for the Director) | The 18 roles as rows and the permissions as columns (resource and action, plus scope rule); financial, security and public layers shown as separate permissions; built-in roles locked, custom roles allowed | Create custom role; edit custom role |
| S4 Gate templates | Administrator with the Director | One template per funding route: the gates in order, kind (approve in system or attach evidence), uploader role, approver role, required document codes, reminder days | Edit; clone a template; preview the gate strip |
| S5 Reference data | Administrator | Disciplines, asset types, document types with sensitivity class, incident types, send-back reasons, milestone types, states and LGAs, chainage format | Add; edit; retire |
| S6 Map and layers | Administrator | Base map choice, legacy lines layer upload (GeoJSON), state boundaries version, public layer settings, 3D asset version when it exists | Upload; publish or hide a layer |
| S7 Reminders | Administrator | The reminder rules: no photo by a set hour, review queue age, certificate age at any step, expiries; the SMS templates in each language | Edit thresholds and texts |
| S8 Audit log | Administrator, auditor | Every action across the system: who, what, object, project, time, before and after | Filter; export |
| S9 Integrations and health | Administrator | SMS gateway status, storage use, map tile service, Eyemark export schedule, future BPP and GIFMIS connectors; error list | Retry; configure |
| S10 Security desk console | Security desk officer | Incident list across corridors with map; no-go segments editor; visibility rules for live field positions per role | Log; close; draw segment; set visibility |

## Mobile app (M1 to M10)

The mobile app has two modes on one install, site manager and resident engineer, and the site manager's home is a camera button rather than a map.

| Screen | Who | Contents | Actions |
| --- | --- | --- | --- |
| M1 Onboarding | New field users | Invite link, SMS code, PIN setup, camera and location permission prompts, a three-screen picture tutorial, language choice, large-text toggle | Start |
| M2 Home (site manager) | Site manager | Current lot and nearest chainage; big Take photo button; Today's report; Milestones; red Report incident; Sent back with count; sync strip (sent, waiting, failed); Call support | Tap any |
| M3 Capture | Site manager, RE on site | Viewfinder with a location-lock indicator and accuracy; computed chainage shown live; after capture: six what-is-this tiles, voice note button, Send; the item joins the queue | Send; retake |
| M4 Today's report | Site manager | Prefilled from yesterday: workers on site (number), machines (tick list), weather (tile), any problem (yes or no plus voice note) | Send |
| M5 Milestones | Site manager | Milestones on the lot ordered by chainage with status; Mark complete flow takes two photos | Mark complete |
| M6 Report incident | Site manager, RE | Four tiles (accident, security, community, equipment); photo or voice note; confirmation that the RE, PM and security desk were notified | Send |
| M7 Sent back | Site manager | Items returned with the reason; retake flow | Retake and send |
| M8 Outbox | Site manager, RE | The queue with each item's state, retry, storage used, last sync time | Retry; clear sent |
| M9 RE mode home | Resident engineer | Review queue as swipe cards (photo, corridor dot, checks; Verify or Send back); milestones to verify; Verify on site opens M3; tests witnessed list | Verify; Send back |
| M10 Settings | Everyone | Language, large text, PIN change, phone binding, Call support, sign out | Save |

The site manager never sees the map, the gates or anything financial; if a person is on more than one lot, a lot picker sits at the top of M2.

## Map rules

The map shows each person only the projects they belong to, except executives, the Director, M&E and oversight viewers, who see everything and can toggle what they look at.

| Rule | Detail |
| --- | --- |
| Who sees what | Members see their projects; the Minister, Minister of State, Permanent Secretary, Director, M&E analyst and oversight viewers see all projects; lender viewers see the corridors they finance; the public sees the published subset |
| Toggles | Status (identified, funded, contracted, under construction, commissioned, operational, stalled); phase; funding route; contractor; state; layers (legacy lines, state boundaries, stations and structures, lots, no-go segments for permitted roles) |
| Legacy lines | The historic narrow-gauge network (Lagos to Kano and branches, Port Harcourt to Maiduguri, Zaria to Kaura Namoda, Kano to Nguru) drawn as a grey context layer from open data such as OpenStreetMap and GRID3, to be checked against NRC records; clicking one shows a small card (name, year opened, gauge, status, operator) and a link into the rehabilitation project when one exists |
| Past and operational projects | Completed lines such as Abuja to Kaduna, Warri to Itakpe and Lagos to Ibadan are projects in Operational status with their full project view (history, photos, documents), created from public records and NRC files |
| Status colours | One colour per status, the same in the legend, the project card and the gate strip; stalled projects pulse |
| Zoom behaviour | Country level: corridors and counters; state level: lots and stations; corridor level: structures, photo pins and the track-laying front |
| Animations | Fly-to when a project is selected or searched; a pulse on projects with open alerts; the track-laying front advancing along the corridor when progress is updated; a draw-on animation when a new project is published; a short replay of the month's photos by chainage from the project card |
| 3D later | The working map is a 2D satellite map (MapLibre) so it runs on any device; a 3D terrain version built from the Blender asset in three.js is a cinematic mode for executives and presentations, switched on from the layer toggles, never required for any task |
| Security | Exact live field positions and incident locations are hidden on every view except the security desk, PM, Director and executives; the public layer shows corridors at low resolution with cleared photos only |

## Public map (P1 and P2, optional)

A public map shows the published subset only, with nothing the ministry has not cleared.

| Screen | Contents |
| --- | --- |
| P1 Public map | Nigeria with corridors at low resolution, status colours, legend, search by town |
| P2 Public project page | Name, route, status, planned opening, percent complete, cleared milestone photos, the contractor, a contact for complaints |

## Button map by operation

Every operation below is the buttons in the order they are pressed, who presses each one, and what the system does the moment it is pressed.

Conventions that hold everywhere: Send, Submit, Verify, Certify, Approve, Confirm, Publish and Mark paid are the primary buttons and each writes an audit row and creates the next person's task; Approve, Certify, Confirm and Publish ask for the PIN; Return and Send back always ask for a reason from a list and hand the item back to the previous person; Cancel discards nothing already saved as a draft.

### A. Creating a project

| Step | Screen | Button | Who clicks | What happens |
| --- | --- | --- | --- | --- |
| 1 | W3 Map home | New project | Project manager or Director | W6.1 opens with the map beside it; a draft project is created, visible only to the creator and the Director |
| 2 | W6.1 Basics | Next | Project manager | Fields validated; a dashed placeholder line is drawn between the start and end towns; states crossed are filled in; draft saved |
| 3 | W6.2 Funding route | One of four tiles, then Next | Project manager | The gate strip preview changes with the tile; on Next the 15 gates are created from that route's template with their kinds, roles, required documents and reminder days |
| 4 | W6.3 Geography | Upload alignment | Project manager | File parsed; the real line replaces the placeholder; length computed; states and LGAs recomputed from the line |
| 4a | W6.3 Geography | Add station | Project manager | A station row with name and chainage; it appears on the map at that chainage |
| 4b | W6.3 Geography | Ask NRC to check (optional), then Next | Project manager | A task Check alignment goes to the NRC engineer; the wizard continues without waiting |
| 5 | W6.4 People | Add NRC engineer, then Next | Project manager | Membership saved; the person appears on the card as a member; the Director is automatic |
| 6 | W6.5 Documents | Attach concept note, Attach approval minute | Project manager | Files stored as D01 and D02 against gate 1 |
| 6a | W6.5 Documents | Mark gate 1 passed, then Next | Project manager | Date entered; gate 1 becomes Awaiting confirmation |
| 7 | W6.6 Publish | Send for publishing | Project manager | Task Publish project goes to the Director; the draft is locked for editing until the Director acts |
| 8 | W7 Tasks, Publish project | Publish (PIN) or Return | Director | Publish: gate 1 confirmed, project status Identified, the corridor animates onto the map for every member and executive, members get an SMS. Return: the draft unlocks and the PM gets the reason |
| 9 | W5.3 Corridor | Add lot (at gate 8) | Project manager | Form for contract reference, contractor, consultant, chainage from and to, dates, contract sum (permission-gated); on Save the lot awaits the Director's Confirm, then shows as a coloured segment and the two organisations can be given members |

### B. Onboarding people

| Step | Screen | Button | Who clicks | What happens |
| --- | --- | --- | --- | --- |
| 1 | S1 Organisations | Add organisation, then Save | IT administrator | Organisation created with its type; its type decides which roles can be given to its people |
| 2 | S2 Users | Add person | IT administrator | Form: name, phone, organisation, role (list filtered by organisation type), projects or lots to tick |
| 3 | S2 Add person | Send invite | IT administrator | Account created in Invited state; SMS with a one-time link sent; for an external organisation a task Confirm new account goes to the Director; for ministry and NRC staff the account is active on first login |
| 4 | W7.8 Confirm new account | Confirm (PIN) or Decline | Director | Confirm: the account activates when the person logs in. Decline: the invite link is cancelled and the administrator sees the reason |
| 5 | W2 or M1 Accept invite | Accept, then Set PIN | The new user | Code checked; PIN stored; on mobile the device is bound to the account; the user lands on their task list or camera home |
| 6 | S2 User page | Resend invite | IT administrator | A fresh link is sent and the old one cancelled |
| 7 | S2 User page | Reset PIN | IT administrator | PIN cleared; a code is sent; the user sets a new PIN on next login |
| 8 | S2 User page | Move to another lot | IT administrator | Membership changed; if the person's organisation is external the Director gets Confirm; the person's old queue closes |
| 9 | S2 User page | Deactivate, then Name replacement | IT administrator | Sessions revoked; the person's open tasks move to the replacement; history stays under the old name |
| 10 | W5.11 People | Request site manager | Contractor commercial manager | A task Create account goes to the administrator with name, phone and lot prefilled; the administrator continues at step 3 |
| 11 | W5.11 People | Add member (ministry or NRC) | Project manager | Membership saved immediately for ministry and NRC staff; external organisations go to the Director's Confirm |

### C. The Permanent Secretary seeing and monitoring projects

| Step | Screen | Button | Who clicks | What happens |
| --- | --- | --- | --- | --- |
| 1 | W1 Sign in | Enter PIN | Permanent Secretary | W3 opens with every project on the map and the three counters computed across all of them |
| 2 | W3 Map home | A corridor on the map | Permanent Secretary | W4 project card slides in with status, gate, days at gate, percent per discipline, latest photo, person in charge with phone, blockers |
| 3 | W4 Project card | Open project | Permanent Secretary | W5.1 Overview: gate strip, physical versus financial percent, strip map, latest photos, alerts |
| 3a | W4 Project card | Set as my current project | Permanent Secretary | The project is pinned in the top bar and the map opens on it next time |
| 4 | W3 Map home | Filter chip Behind, or Stalled | Permanent Secretary | The map shows only those projects; the counters recompute; stalled corridors pulse |
| 5 | W3 Map home | Layer toggles | Permanent Secretary | Legacy lines, state boundaries, stations, lots and no-go segments switch on or off; the choice is remembered |
| 6 | W8.2 Portfolio dashboard | Sort by days at gate | Permanent Secretary | The table reorders to show which project has waited longest on which approver |
| 7 | W8.2 Portfolio dashboard | Export | Permanent Secretary | PDF or Excel of the current view |
| 8 | W5.2 Gates | Open evidence | Permanent Secretary | The evidence document opens in the viewer (read-only); who uploaded and who confirmed are shown |
| 9 | W5.4 Photos | Replay month | Permanent Secretary | The month's verified photos play along the corridor by chainage |
| 10 | Tasks panel, W7.4 | Approve (PIN) or Return | Permanent Secretary | Approve: the certificate becomes Approved, the finance officer gets Mark paid, the lender viewer sees the new status. Return: it goes back to the Director with the reason |
| 11 | W5.12 Reports | Generate monthly report | Permanent Secretary or their office | The report is built from the data for the chosen month and can be downloaded or shared |
| 12 | Weekly SMS digest | The link | Permanent Secretary | W8.2 opens with the week's changes highlighted |
| 13 | W7.7 Upload document | Submit | The Permanent Secretary's secretary (uploader role) | Tenders Board minutes stored as D10 against gate 5 |

### D. Contractors making uploads

| Step | Screen | Button | Who clicks | What happens |
| --- | --- | --- | --- | --- |
| 1 | M2 Home | Take photo | Site manager | M3 opens with the camera and a live location lock; the computed chainage shows on screen |
| 2 | M3 Capture | Capture, then one of six tiles | Site manager | The photo is stamped with GPS, accuracy, time, heading and device; the tile sets the discipline |
| 3 | M3 Capture | Add voice note (optional), then Send | Site manager | The item joins the outbox; when online it uploads, the server computes chainage, runs the corridor, time, device and duplicate checks, and the item appears in the RE's queue (W7.1 or M9) as Verified-pending or Flagged; the sync strip shows Sent |
| 4 | M2 Home | Today's report, then Send | Site manager | Prefilled report submitted; the 4 pm reminder for that day is cleared |
| 5 | M5 Milestones | Mark complete, then Send after two captures | Site manager | The milestone claim goes to the RE as Verify milestone (W7.2); the strip map shows it as Claimed |
| 6 | M6 Report incident | A tile, then Send | Site manager | The incident is logged in W5.10 and the RE, PM and security desk get an SMS at once |
| 7 | M7 Sent back | Retake, then Send | Site manager | A new version linked to the returned item goes back to the RE; the old one stays visible to approvers |
| 8 | W7.1 Verify photo | Verify or Send back (reason) | Resident engineer | Verify: the photo becomes Verified and counts toward progress and the month's measurement. Send back: the site manager sees it in M7 with the reason |
| 9 | W5.6 Payments | New valuation | Contractor commercial manager | A valuation for the month opens with quantities prefilled from verified measurement |
| 10 | W5.6 Payments | Attach valuation file, then Submit | Contractor commercial manager | Valuation status Submitted; the RE gets Recommend certificate; the chain shows the first step pending |
| 11 | W5.7 Design | Submit package | Contractor commercial manager | Files stored as D21 with discipline and version; the RE gets Review package; the NRC engineer gets Approve once the RE recommends |
| 12 | W5.10 Issues and variations | New claim, then Submit | Contractor commercial manager | A variation or extension request with attachments; the PM and RE get Assess claim |
| 13 | W5.8 Documents | Upload, then Submit | Contractor commercial manager | Documents of the types a contractor may upload (D20 mobilisation set, D21 design, D25 incident reports) are stored and the consultant gets Verify document |

### E. Uploading documents

| Step | Screen | Button | Who clicks | What happens |
| --- | --- | --- | --- | --- |
| 1 | W7.7 Upload document (task-driven) | Choose file | Procurement, legal, finance officer or PM, as the register names | File picker; the task already names the document type and the gate, so nothing else is chosen |
| 2 | W7.7 Upload document | Set date, then Submit | Same | Stored under its register code with version 1, linked to the gate; for an attach-evidence gate the Director gets Confirm gate; the task closes |
| 3 | W7.3 Confirm gate | Confirm (PIN) or Return | Director | Confirm: the gate becomes Passed with that date and the days-at-gate clock stops. Return: the uploader gets the reason and the document stays as a draft version |
| 4 | W5.8 Documents (ad hoc) | Upload | Any uploader role | A document type picker showing only the codes that role may upload, then file and date |
| 5 | W5.8 Documents | Submit | Same | Stored and visible by sensitivity class; a document that belongs to a gate is linked to it automatically |
| 6 | W5.8 Document page | Upload new version, then Submit | The owning unit | The reason is recorded; version 2 is stored; version 1 remains visible to approvers and the auditor |
| 7 | W5.8 Document page | Download, Open in viewer, Link to gate | Anyone permitted | Opens or downloads; Link to gate attaches an existing document as evidence for a gate (Director confirm follows) |
| 8 | W5.6 Payments | Mark paid, then Submit with payment advice | Finance officer | The certificate becomes Paid; D24 payment advice stored; the lender record updated |
| 9 | W5.11 People, Responsibility matrix | Who uploads what | Everyone | The matrix shows, for every gate, which role uploads which document code |

Who uploads which codes: project manager D01, D02, D06, D16, D17; procurement D03, D10, D11, D12, D15; legal D13, D18, D26; finance D07, D08, D14, D19, D24; contractor D20, D21, D22, D25; consultant D23, D28, D29, D30; the system generates D27.
