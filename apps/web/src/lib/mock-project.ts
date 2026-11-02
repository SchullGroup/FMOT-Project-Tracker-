/*
 * Sample data for the project view in NEXT_PUBLIC_API_MOCK=1 mode. Every
 * project returns the Kaduna–Kano data set; names and figures are invented.
 */
import type {
  ActivityItem,
  Certificate,
  DesignPackage,
  DocumentGroup,
  GateRow,
  Grievance,
  Incident,
  Lot,
  Parcel,
  PeopleView,
  ProgressSummary,
  SiteSection,
  StripMap,
  Submission,
  Variation,
} from './types';

const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
// Kobo as the API sends it: a string of digits.
const N = (naira: number) => String(naira * 100);

export const GATE_NAMES = [
  'Initiation', 'Feasibility accepted', 'Funding route chosen', 'Funding approved', 'Tender and evaluation',
  'BPP no objection', 'FEC award', 'Contract signed', 'Environmental approval', 'Right-of-way',
  'Financial close', 'Detailed design', 'Certify and pay', 'Commissioning', 'Handover',
];
const APPROVER = ['director_rail', 'director_rail', 'director_rail', 'director_rail', 'director_rail', 'director_rail', 'director_rail', 'director_rail', 'director_rail', 'director_rail', 'director_rail', 'nrc_project_engineer', 'accounting_officer', 'nrc_project_engineer', 'nrc_project_engineer'];

const gates: GateRow[] = GATE_NAMES.map((name, i) => {
  const no = i + 1;
  const passed = no <= 12;
  return {
    no,
    name,
    kind: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(no) ? 'attach_evidence' : 'approve_in_system',
    approverRole: APPROVER[i]!,
    status: passed ? 'passed' : no === 13 ? 'in_progress' : 'not_started',
    enteredAt: no <= 13 ? day(900 - no * 60) : null,
    passedAt: passed ? day(880 - no * 60) : null,
    daysWaiting: no === 13 ? 12 : null,
    evidence: passed && no <= 11 ? [{ documentId: `d-g${no}`, code: `D${String(no + 1).padStart(2, '0')}`, title: `Evidence for gate ${no}` }] : [],
    uploadedBy: passed && no <= 11 ? 'Engr. A. Bello' : null,
    confirmedBy: passed ? (no >= 12 ? 'Engr. K. Okafor (NRC)' : 'Engr. H. Danjuma') : null,
  };
});

const stripMap: StripMap = {
  lengthM: 203_000,
  lots: [
    { name: 'Lot 1', fromM: 0, toM: 68_000 },
    { name: 'Lot 2', fromM: 68_000, toM: 137_000 },
    { name: 'Lot 3', fromM: 137_000, toM: 203_000 },
  ],
  disciplines: [
    { code: 'earthworks', name: 'Earthworks', segments: [{ fromM: 0, toM: 140_000, state: 'complete' }, { fromM: 152_000, toM: 168_000, state: 'complete' }, { fromM: 168_000, toM: 182_000, state: 'in_progress' }] },
    { code: 'structures', name: 'Structures', segments: [{ fromM: 0, toM: 104_000, state: 'complete' }, { fromM: 104_000, toM: 126_000, state: 'in_progress' }, { fromM: 160_000, toM: 170_000, state: 'in_progress' }] },
    { code: 'track', name: 'Track', segments: [{ fromM: 0, toM: 80_000, state: 'complete' }, { fromM: 80_000, toM: 92_000, state: 'in_progress' }] },
    { code: 'stations', name: 'Stations', segments: [{ fromM: 0, toM: 3_000, state: 'complete' }, { fromM: 74_000, toM: 78_000, state: 'in_progress' }] },
    { code: 'signalling', name: 'Signalling', segments: [{ fromM: 0, toM: 24_000, state: 'complete' }] },
  ],
  trackFrontM: 92_000,
};

const progress: ProgressSummary = {
  physicalPercent: 68,
  plannedPercent: 74,
  financialPercent: 71,
  weeksBehind: 6,
  lots: [
    { id: 'l1', name: 'Lot 1, km 0 to 68', disciplines: [{ name: 'Earthworks', planned: 100, actual: 100 }, { name: 'Structures', planned: 100, actual: 100 }, { name: 'Track', planned: 100, actual: 100 }, { name: 'Signalling', planned: 45, actual: 35 }] },
    { id: 'l2', name: 'Lot 2, km 68 to 137', disciplines: [{ name: 'Earthworks', planned: 100, actual: 100 }, { name: 'Structures', planned: 85, actual: 62 }, { name: 'Track', planned: 40, actual: 35 }, { name: 'Signalling', planned: 10, actual: 0 }] },
    { id: 'l3', name: 'Lot 3, km 137 to 203', disciplines: [{ name: 'Earthworks', planned: 80, actual: 45 }, { name: 'Structures', planned: 40, actual: 15 }, { name: 'Track', planned: 0, actual: 0 }, { name: 'Signalling', planned: 0, actual: 0 }] },
  ],
  trackKmByMonth: [
    { month: '2026-03', planned: 8, actual: 7 },
    { month: '2026-04', planned: 9, actual: 9 },
    { month: '2026-05', planned: 10, actual: 6 },
    { month: '2026-06', planned: 10, actual: 8 },
    { month: '2026-07', planned: 11, actual: 9 },
    { month: '2026-08', planned: 11, actual: 7 },
    { month: '2026-09', planned: 12, actual: 10 },
    { month: '2026-10', planned: 12, actual: 9 },
  ],
};

const kk: [number, number][] = [[7.43, 10.52], [7.55, 10.78], [7.71, 11.08], [7.9, 11.3], [8.1, 11.55], [8.3, 11.78], [8.52, 12.0]];
const corridor: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { kind: 'lot', name: 'Lot 1', state: 'complete' }, geometry: { type: 'LineString', coordinates: kk.slice(0, 3) } },
    { type: 'Feature', properties: { kind: 'lot', name: 'Lot 2', state: 'in_progress' }, geometry: { type: 'LineString', coordinates: kk.slice(2, 5) } },
    { type: 'Feature', properties: { kind: 'lot', name: 'Lot 3', state: 'in_progress' }, geometry: { type: 'LineString', coordinates: kk.slice(4) } },
    ...[['Kaduna', kk[0]!], ['Zaria', kk[2]!], ['Kano', kk[6]!]].map(([name, c]) => ({ type: 'Feature' as const, properties: { kind: 'station', name: name as string }, geometry: { type: 'Point' as const, coordinates: c as [number, number] } })),
    ...[kk[1]!, kk[3]!, [8.2, 11.66] as [number, number]].map((c, i) => ({ type: 'Feature' as const, properties: { kind: 'photo', name: `Verified photo ${i + 1}` }, geometry: { type: 'Point' as const, coordinates: c } })),
    { type: 'Feature', properties: { kind: 'incident', name: 'Community access dispute' }, geometry: { type: 'Point', coordinates: [8.25, 11.72] } },
  ],
};

const lots: Lot[] = [
  { id: 'l1', name: 'Lot 1', contractRef: 'FMOT/RL/KK/01', contractor: 'CCECC', consultant: 'TEAM Consultants', chainageFromM: 0, chainageToM: 68_000, contractSumKobo: N(410_000_000_000) },
  { id: 'l2', name: 'Lot 2', contractRef: 'FMOT/RL/KK/02', contractor: 'CCECC', consultant: 'TEAM Consultants', chainageFromM: 68_000, chainageToM: 137_000, contractSumKobo: N(395_000_000_000) },
  { id: 'l3', name: 'Lot 3', contractRef: 'FMOT/RL/KK/03', contractor: 'CCECC', consultant: 'Sigma Engineering', chainageFromM: 137_000, chainageToM: 203_000, contractSumKobo: N(405_000_000_000) },
];

const submissions: Submission[] = [
  sub('s1', 'photo', 'verified', false, 142_300, 5, 'Musa Garba', 'Earthworks', 'Lot 3'),
  sub('s2', 'photo', 'pending_re', true, 212_150, 2, 'Musa Garba', 'Earthworks', 'Lot 3', 'Outside the corridor by 180 m'),
  sub('s3', 'photo', 'verified', false, 104_350, 4, 'Ibrahim Sule', 'Structures', 'Lot 2'),
  sub('s4', 'daily_report', 'pending_re', false, null, 1, 'Ibrahim Sule', null, 'Lot 2', '46 workers, 9 machines, dry'),
  sub('s5', 'photo', 'sent_back', false, 98_200, 6, 'Ibrahim Sule', 'Track', 'Lot 2', null, 'Photo unclear'),
  sub('s6', 'milestone_claim', 'pending_re', false, 76_400, 1, 'Ibrahim Sule', 'Stations', 'Lot 2', 'Zaria station platform slab complete'),
  sub('s7', 'photo', 'verified', false, 61_050, 7, 'Aisha Bello', 'Signalling', 'Lot 1'),
  sub('s8', 'incident', 'pending_re', false, 150_800, 3, 'Musa Garba', null, 'Lot 3', 'Community blocked access road'),
  sub('s9', 'photo', 'verified', false, 33_700, 9, 'Aisha Bello', 'Track', 'Lot 1'),
];

function sub(id: string, kind: Submission['kind'], status: Submission['status'], flagged: boolean, chainageM: number | null, daysAgo: number, by: string, discipline: string | null, lotName: string, summary: string | null = null, returnReason: string | null = null): Submission {
  return { id, kind, status, flagged, chainageM, capturedAt: day(daysAgo), submittedBy: by, discipline, lotName, mediaId: kind === 'photo' || kind === 'milestone_claim' ? `m-${id}` : null, summary, returnReason };
}

const chain = (done: number): Certificate['chain'] =>
  [
    ['Recommend', 'Resident engineer', 'Engr. T. Adeyemi'],
    ['Certify', 'NRC project engineer', 'Engr. K. Okafor'],
    ['Approve', 'Director, rail', 'Engr. H. Danjuma'],
    ['Final approval', 'Permanent Secretary', 'Dr. F. Musa'],
    ['Mark paid', 'Finance officer', 'Mrs. O. Eze'],
  ].map(([step, role, actor], i) => ({ step: step!, role: role!, actor: i < done ? actor! : null, at: i < done ? day(30 - i * 4) : null }));

const certificates: Record<string, Certificate[]> = {
  l2: [
    { id: 'c15', number: 15, lotName: 'Lot 2', period: '2026-10', grossKobo: N(2_400_000_000), retentionKobo: N(120_000_000), advanceRecoveryKobo: N(240_000_000), netKobo: N(2_040_000_000), status: 'draft', chain: chain(0) },
    { id: 'c14', number: 14, lotName: 'Lot 2', period: '2026-09', grossKobo: N(2_100_000_000), retentionKobo: N(105_000_000), advanceRecoveryKobo: N(210_000_000), netKobo: N(1_785_000_000), status: 'certified', chain: chain(2) },
    { id: 'c13', number: 13, lotName: 'Lot 2', period: '2026-08', grossKobo: N(1_900_000_000), retentionKobo: N(95_000_000), advanceRecoveryKobo: N(190_000_000), netKobo: N(1_615_000_000), status: 'final_approved', chain: chain(4) },
    { id: 'c12', number: 12, lotName: 'Lot 2', period: '2026-07', grossKobo: N(2_000_000_000), retentionKobo: N(100_000_000), advanceRecoveryKobo: N(200_000_000), netKobo: N(1_700_000_000), status: 'paid', chain: chain(5) },
  ],
};

const design: Record<string, DesignPackage[]> = {
  l3: [
    { id: 'dp1', title: 'Rigachikun river bridge, piers and deck', discipline: 'Structures', lotName: 'Lot 3', status: 'under_review', version: 2, updatedAt: day(3) },
    { id: 'dp2', title: 'Kano station building', discipline: 'Stations', lotName: 'Lot 3', status: 'approved', version: 4, updatedAt: day(40) },
  ],
  l2: [{ id: 'dp3', title: 'Zaria interlocking and signals', discipline: 'Signalling', lotName: 'Lot 2', status: 'returned', version: 1, updatedAt: day(8) }],
};

const documents: DocumentGroup[] = [
  { gateNo: 1, gateName: 'Initiation', documents: [{ id: 'd1', code: 'D01', title: 'Concept note', version: 1, uploadedBy: 'Engr. A. Bello', uploadedAt: day(880) }, { id: 'd2', code: 'D02', title: 'Minister\u2019s approval minute', version: 1, uploadedBy: 'Engr. A. Bello', uploadedAt: day(878) }] },
  { gateNo: 6, gateName: 'BPP no objection', documents: [{ id: 'd11', code: 'D11', title: 'BPP Certificate of No Objection', version: 1, uploadedBy: 'Mr. S. Lawal (Procurement)', uploadedAt: day(520) }] },
  { gateNo: 8, gateName: 'Contract signed', documents: [{ id: 'd13', code: 'D13', title: 'Signed EPC contract with annexes', version: 2, uploadedBy: 'Barr. N. Uche (Legal)', uploadedAt: day(400) }, { id: 'd14', code: 'D14', title: 'Performance bond and advance payment guarantee', version: 1, uploadedBy: 'Mrs. O. Eze (Finance)', uploadedAt: day(398) }] },
  { gateNo: 13, gateName: 'Certify and pay', documents: [{ id: 'd24', code: 'D24', title: 'Payment advice, IPC 12', version: 1, uploadedBy: 'Mrs. O. Eze (Finance)', uploadedAt: day(20) }, { id: 'd31', code: 'D31', title: 'Contractor valuation, September', version: 1, uploadedBy: 'CCECC commercial', uploadedAt: day(14) }] },
];

const parcels: Parcel[] = [
  ['P-140-01', 140_050, 'Malam Sani Garba', 4_200_000, 0, 'unpaid'],
  ['P-140-02', 140_620, 'Kofar Gabas community', 18_600_000, 0, 'disputed'],
  ['P-141-03', 141_300, 'Hajiya Amina Yusuf', 3_100_000, 3_100_000, 'paid'],
  ['P-143-01', 143_900, 'Unguwar Rimi farmers', 26_000_000, 0, 'unpaid'],
  ['P-146-02', 146_150, 'Alhaji Bello Musa', 7_800_000, 0, 'unpaid'],
  ['P-148-04', 148_700, 'Dan Kade community', 12_400_000, 0, 'queried'],
  ['P-150-01', 150_200, 'Ibrahim Lawan', 2_900_000, 2_900_000, 'paid'],
  ['P-151-02', 151_800, 'Gidan Waya church', 5_500_000, 0, 'unpaid'],
].map(([ref, at, owner, val, paid, status], i) => ({ id: `pa${i}`, ref: ref as string, fromM: at as number, toM: (at as number) + 300, owner: owner as string, valuationKobo: N(val as number), paidKobo: N(paid as number), status: status as Parcel['status'] }));

const grievances: Grievance[] = [
  { id: 'g1', ref: 'G-031', summary: 'Kofar Gabas community disputes the farmland valuation', chainageM: 140_620, status: 'open', openedAt: day(12) },
  { id: 'g2', ref: 'G-029', summary: 'Crops destroyed before compensation was paid', chainageM: 143_900, status: 'escalated', openedAt: day(20) },
  { id: 'g3', ref: 'G-027', summary: 'Access road to the market cut by the embankment', chainageM: 145_400, status: 'open', openedAt: day(26) },
  { id: 'g4', ref: 'G-022', summary: 'Wrong name on the compensation list', chainageM: 141_300, status: 'resolved', openedAt: day(40) },
];

const sections: SiteSection[] = [
  { id: 'se1', fromM: 0, toM: 140_000, status: 'available', signedOffBy: 'Engr. H. Danjuma' },
  { id: 'se2', fromM: 140_000, toM: 152_000, status: 'blocked', signedOffBy: null },
  { id: 'se3', fromM: 152_000, toM: 203_000, status: 'available', signedOffBy: 'Engr. H. Danjuma' },
];

const incidents: Incident[] = [
  { id: 'i1', type: 'Community', chainageM: 150_800, status: 'open', reportedAt: day(3), summary: 'Community blocked the access road at Dan Kade' },
  { id: 'i2', type: 'Equipment', chainageM: 88_200, status: 'closed', reportedAt: day(18), summary: 'Track-laying machine hydraulic failure' },
];

const variations: Variation[] = [
  { id: 'v1', type: 'variation', title: 'Additional culverts at km 160 to 165', amountKobo: N(380_000_000), days: null, status: 'Recommended, with the Director', raisedBy: 'CCECC commercial', raisedAt: day(9) },
  { id: 'v2', type: 'extension_of_time', title: 'Delay from unpaid compensation, km 140 to 152', amountKobo: null, days: 60, status: 'Assessed by the resident engineer', raisedBy: 'CCECC commercial', raisedAt: day(5) },
];

const people: PeopleView = {
  members: [
    { id: 'u1', name: 'Engr. A. Bello', role: 'ministry_project_manager', organisation: 'Federal Ministry of Transportation', phone: '+2348030000000', lot: null },
    { id: 'u2', name: 'Engr. H. Danjuma', role: 'director_rail', organisation: 'Federal Ministry of Transportation', phone: '+2348030000001', lot: null },
    { id: 'u3', name: 'Engr. K. Okafor', role: 'nrc_project_engineer', organisation: 'Nigerian Railway Corporation', phone: '+2348030000002', lot: null },
    { id: 'u4', name: 'Engr. T. Adeyemi', role: 'consultant_resident_engineer', organisation: 'TEAM Consultants', phone: '+2348030000003', lot: 'Lot 1, Lot 2' },
    { id: 'u5', name: 'Engr. R. Nwosu', role: 'consultant_resident_engineer', organisation: 'Sigma Engineering', phone: '+2348030000004', lot: 'Lot 3' },
    { id: 'u6', name: 'Musa Garba', role: 'contractor_site_manager', organisation: 'CCECC', phone: '+2348030004417', lot: 'Lot 3' },
    { id: 'u7', name: 'Ibrahim Sule', role: 'contractor_site_manager', organisation: 'CCECC', phone: '+2348030005521', lot: 'Lot 2' },
    { id: 'u8', name: 'Mrs. O. Eze', role: 'finance_officer', organisation: 'Federal Ministry of Transportation', phone: '+2348030000005', lot: null },
  ],
  matrix: GATE_NAMES.map((gateName, i) => ({
    gateNo: i + 1,
    gateName,
    uploader: i < 11 ? (i === 4 || i === 5 || i === 6 ? 'procurement_officer' : i === 7 ? 'legal_officer' : 'ministry_project_manager') : null,
    verifier: i === 12 ? 'consultant_resident_engineer' : null,
    approver: APPROVER[i]!,
  })),
};

const activity: ActivityItem[] = [
  ['Engr. K. Okafor', 'Certified', 'Payment certificate 14, Lot 2, gross ₦2.1bn'],
  ['Engr. T. Adeyemi', 'Recommended', 'Payment certificate 14, Lot 2'],
  ['Engr. T. Adeyemi', 'Sent back', 'Photo at km 98+200: photo unclear'],
  ['Engr. R. Nwosu', 'Verified', 'Photo at km 142+300, earthworks'],
  ['Mrs. O. Eze', 'Marked paid', 'Payment certificate 12, Lot 2'],
  ['Engr. H. Danjuma', 'Signed off', 'Section km 152 to 203 available'],
  ['Engr. A. Bello', 'Uploaded', 'D31 Contractor valuation, September'],
].map(([actor, action, summary], i) => ({ id: `a${i}`, at: day(i * 2 + 1), actor: actor!, action: action!, summary: summary! }));

export function mockProjectRoute(route: string): unknown | undefined {
  const m = /^\/projects\/[^/]+\/(.+)$/.exec(route);
  const lot = /^\/lots\/([^/]+)\/(certificates|design-packages)$/.exec(route);
  if (lot) return lot[2] === 'certificates' ? (certificates[lot[1]!] ?? []) : (design[lot[1]!] ?? []);
  if (/^\/field\/projects\/[^/]+\/submissions$/.test(route)) return submissions;
  if (route.startsWith('/documents/')) return { url: '#' };
  if (!m) return undefined;
  const table: Record<string, unknown> = {
    gates,
    'strip-map': stripMap,
    progress,
    corridor,
    lots,
    documents,
    parcels,
    grievances,
    sections,
    incidents,
    variations,
    people,
    activity,
  };
  return table[m[1]!];
}
