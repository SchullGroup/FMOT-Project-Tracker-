/*
 * One sample task of every type for NEXT_PUBLIC_API_MOCK=1. Acting on a task
 * removes it from the inbox for the rest of the browser session.
 */
import type { ChainStep, TaskAction, TaskDetail, TaskInbox } from './types';

const DONE_KEY = 'fmot.mockDone';
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const day = (n: number) => hoursAgo(n * 24);
// Kobo as the API sends it: a string of digits.
const N = (naira: number) => String(naira * 100);

const done = (): string[] => JSON.parse(sessionStorage.getItem(DONE_KEY) ?? '[]') as string[];

const ret = (label = 'Return'): TaskAction => ({ action: 'return', label, kind: 'return', needsPin: false, needsReason: true });
const primary = (action: string, label: string, needsPin = true, extra: Partial<TaskAction> = {}): TaskAction => ({ action, label, kind: 'primary', needsPin, needsReason: false, ...extra });

const kk = { id: 'p-kk', name: 'Kaduna–Kano SGR' };
const km = { id: 'p-km', name: 'Kano–Katsina–Maradi SGR' };

const certChain: ChainStep[] = [
  { step: 'Recommend', role: 'Resident engineer', actor: 'Engr. T. Adeyemi', at: day(4) },
  { step: 'Certify', role: 'NRC project engineer', actor: 'Engr. K. Okafor', at: day(1) },
  { step: 'Approve', role: 'Director, rail', actor: null, at: null, current: true },
  { step: 'Final approval', role: 'Permanent Secretary', actor: null, at: null },
  { step: 'Mark paid', role: 'Finance officer', actor: null, at: null },
];

const base = { dueAt: null, blockedReason: null, documents: [] as TaskDetail['documents'], chain: [] as ChainStep[] };

const ALL: TaskDetail[] = [
  {
    ...base,
    id: 't-photo',
    type: 'verify_submission',
    title: 'Check a flagged photo at km 212+150',
    reason: 'Outside the corridor by 180 m',
    createdAt: hoursAgo(50),
    overdue: true,
    project: kk,
    subjectId: 's2',
    actions: [primary('verify', 'Verify', false), { ...ret('Send back'), action: 'send_back' }],
    subject: {
      kind: 'photo',
      mediaId: 'm-s2',
      chainageM: 212_150,
      offsetM: 680,
      corridorWidthM: 500,
      lotName: 'Lot 3',
      lotFromM: 137_000,
      lotToM: 203_000,
      discipline: 'Earthworks',
      capturedAt: hoursAgo(52),
      submittedBy: 'Musa Garba (CCECC)',
      checks: [
        { name: 'Inside the corridor', result: 'fail', detail: '680 m from the line; the corridor is 500 m each side' },
        { name: 'Inside the lot', result: 'fail', detail: 'km 212+150 is past the end of Lot 3 (km 203+000)' },
        { name: 'Time', result: 'pass', detail: 'Taken 2 hours before it was sent' },
        { name: 'Device', result: 'pass', detail: 'The site manager\u2019s registered phone; location not faked' },
        { name: 'Not a repeat', result: 'pass', detail: 'No match with earlier photos' },
      ],
      previousMediaId: null,
      summary: null,
    },
  },
  {
    ...base,
    id: 't-cert',
    type: 'payment_certificate',
    title: 'Approve payment certificate 14',
    reason: 'NRC engineer certified it; needs your approval',
    createdAt: hoursAgo(24),
    overdue: false,
    project: kk,
    subjectId: 'c14',
    chain: certChain,
    documents: [{ id: 'd31', code: 'D31', title: 'Contractor valuation, September', version: 1 }, { id: 'd23', code: 'D23', title: 'Measurement sheet, September', version: 1 }],
    actions: [primary('approve', 'Approve'), ret()],
    subject: {
      kind: 'certificate',
      number: 14,
      lotName: 'Lot 2',
      period: '2026-09',
      grossKobo: N(2_100_000_000),
      retentionKobo: N(105_000_000),
      advanceRecoveryKobo: N(210_000_000),
      netKobo: N(1_785_000_000),
      verifiedPhotos: 186,
      measurement: [
        { discipline: 'Structures', done: 'km 104+000 to km 112+400 complete' },
        { discipline: 'Track', done: 'km 80+000 to km 88+200 complete' },
        { discipline: 'Stations', done: 'Zaria platform slab complete' },
      ],
    },
  },
  {
    ...base,
    id: 't-gate',
    type: 'confirm_gate',
    title: 'Confirm gate 6: BPP no objection',
    reason: 'Certificate uploaded; confirm the date',
    createdAt: hoursAgo(72),
    overdue: true,
    project: km,
    subjectId: 'g6',
    documents: [{ id: 'd11', code: 'D11', title: 'BPP Certificate of No Objection', version: 1 }],
    actions: [primary('confirm', 'Confirm gate 6'), ret()],
    subject: { kind: 'gate', gateNo: 6, gateName: 'BPP no objection', effectiveDate: day(5), uploadedBy: 'Mr. S. Lawal (Procurement)', uploadedAt: hoursAgo(72) },
  },
  {
    ...base,
    id: 't-account',
    type: 'confirm_account',
    title: 'Confirm new account',
    reason: 'CCECC site manager for Lot 2',
    createdAt: hoursAgo(3),
    overdue: false,
    project: kk,
    subjectId: 'inv-1',
    actions: [primary('confirm', 'Confirm'), { ...ret('Decline'), action: 'decline' }],
    subject: { kind: 'account', name: 'Chinedu Okeke', phone: '+2348031234567', organisation: 'CCECC', organisationType: 'contractor', role: 'contractor_site_manager', lots: ['Kaduna–Kano SGR, Lot 2'], requestedBy: 'IT administrator (Schull Technologies)' },
  },
  {
    ...base,
    id: 't-publish',
    type: 'publish_project',
    title: 'Publish project',
    reason: 'Sent by Engr. A. Bello for publishing',
    createdAt: hoursAgo(1),
    overdue: false,
    project: km,
    subjectId: 'p-km',
    documents: [{ id: 'd1', code: 'D01', title: 'Concept note', version: 1 }, { id: 'd2', code: 'D02', title: 'Minister\u2019s approval minute', version: 1 }],
    actions: [primary('publish', 'Publish'), ret()],
    subject: {
      kind: 'publish',
      review: {
        id: 'p-km',
        status: 'draft',
        locked: true,
        basics: { name: 'Kano–Katsina–Maradi SGR', type: 'new_line', gauge: 'standard', startTown: 'Kano', endTown: 'Maradi (Niger)', originKind: 'master_plan', originReference: 'NRMP 2030, corridor 4' },
        fundingRoute: 'loan',
        alignment: { lengthM: 393_000, states: ['Kano', 'Katsina'], geometry: { type: 'LineString', coordinates: [[8.52, 12.0], [7.6, 12.99], [7.1, 13.5]] } },
        stations: [{ id: 's1', name: 'Kano', chainageM: 0 }, { id: 's2', name: 'Katsina', chainageM: 190_000 }, { id: 's3', name: 'Maradi', chainageM: 393_000 }],
        members: [{ name: 'Engr. A. Bello', role: 'ministry_project_manager', organisation: 'Federal Ministry of Transportation', confirmed: true }, { name: 'Engr. K. Okafor', role: 'nrc_project_engineer', organisation: 'Nigerian Railway Corporation', confirmed: true }],
        documents: [{ id: 'd1', code: 'D01', title: 'Concept note', version: 1 }, { id: 'd2', code: 'D02', title: 'Minister\u2019s approval minute', version: 1 }],
        gate1PassedOn: day(10),
        returnReason: null,
      },
    },
  },
  {
    ...base,
    id: 't-upload',
    type: 'upload_document',
    title: 'Upload: Federal Executive Council extract',
    reason: 'Gate 7 is waiting for it',
    createdAt: hoursAgo(30),
    overdue: false,
    project: km,
    subjectId: 'g7',
    actions: [primary('submit', 'Submit', false, { needsFile: { code: 'D12', title: 'FEC extract and award letter' }, needsDate: true })],
    subject: { kind: 'document_upload', code: 'D12', title: 'FEC extract and award letter', gateNo: 7, gateName: 'FEC award' },
  },
  {
    ...base,
    id: 't-variation',
    type: 'variation',
    title: 'Approve a variation: extra culverts',
    reason: 'Recommended by the project manager',
    createdAt: hoursAgo(20),
    overdue: false,
    project: kk,
    subjectId: 'v1',
    chain: [
      { step: 'Assess', role: 'Resident engineer', actor: 'Engr. R. Nwosu', at: day(6) },
      { step: 'Recommend', role: 'Project manager', actor: 'Engr. A. Bello', at: day(1) },
      { step: 'Approve', role: 'Director, rail', actor: null, at: null, current: true },
    ],
    actions: [primary('approve', 'Approve'), ret()],
    subject: { kind: 'variation', type: 'variation', title: 'Additional culverts at km 160 to 165', amountKobo: N(380_000_000), days: null, assessment: 'Four extra 2 m box culverts needed after the August flood survey; quantities checked.', recommendation: 'Approve; within the limit and needed before the rains.', aboveThreshold: false },
  },
];

export function mockTaskInbox(): TaskInbox {
  const gone = new Set(done());
  const groups = new Map<string, TaskInbox['groups'][number]>();
  for (const t of ALL.filter((t) => !gone.has(t.id))) {
    const key = t.project?.id ?? 'none';
    if (!groups.has(key)) groups.set(key, { project: t.project, tasks: [] });
    const { id, type, title, reason, createdAt, dueAt, overdue } = t;
    groups.get(key)!.tasks.push({ id, type, title, reason, createdAt, dueAt, overdue });
  }
  for (const g of groups.values()) g.tasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { groups: [...groups.values()], doneToday: 4 + gone.size };
}

export function mockTask(id: string): TaskDetail | undefined {
  return done().includes(id) ? undefined : ALL.find((t) => t.id === id);
}

export function mockAct(id: string): void {
  sessionStorage.setItem(DONE_KEY, JSON.stringify([...done(), id]));
}

export const RETURN_REASONS = [
  { id: 'rr1', label: 'Photo unclear' },
  { id: 'rr2', label: 'Wrong chainage' },
  { id: 'rr3', label: 'Outside the corridor' },
  { id: 'rr4', label: 'Missing document' },
  { id: 'rr5', label: 'Amount disputed' },
  { id: 'rr6', label: 'Other' },
];
