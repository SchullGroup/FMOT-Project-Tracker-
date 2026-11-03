/* Sample data for the Web Step 8 actions in NEXT_PUBLIC_API_MOCK=1 mode, kept for the browser session. */
import type { Lot, PeopleView, ValuationPrefill } from './types';

const KEY = 'fmot.mockStep8';
interface Store {
  lots: Lot[];
  members: PeopleView['members'];
}
const load = (): Store => JSON.parse(sessionStorage.getItem(KEY) ?? 'null') ?? { lots: [], members: [] };
const save = (s: Store) => sessionStorage.setItem(KEY, JSON.stringify(s));

const ORGS = [
  { id: 'o3', name: 'CCECC', type: 'contractor' },
  { id: 'o7', name: 'Mota-Engil Nigeria', type: 'contractor' },
  { id: 'o4', name: 'TEAM Consultants', type: 'consultant' },
  { id: 'o8', name: 'Sigma Engineering', type: 'consultant' },
];
// People with accounts, by role, as GET /users?role= returns them.
const PEOPLE: Record<string, Array<{ id: string; name: string; organisation: string; external: boolean }>> = {
  consultant_resident_engineer: [
    { id: 'u4', name: 'Engr. T. Adeyemi', organisation: 'TEAM Consultants', external: true },
    { id: 'u5', name: 'Engr. R. Nwosu', organisation: 'Sigma Engineering', external: true },
  ],
  contractor_site_manager: [
    { id: 'u6', name: 'Musa Garba', organisation: 'CCECC', external: true },
    { id: 'u10', name: 'Chinedu Okeke', organisation: 'CCECC', external: true },
  ],
  contractor_commercial_manager: [{ id: 'u11', name: 'Li Wei', organisation: 'CCECC', external: true }],
  legal_officer: [{ id: 'u12', name: 'Barr. N. Uche', organisation: 'Federal Ministry of Transportation', external: false }],
  finance_officer: [{ id: 'u8', name: 'Mrs. O. Eze', organisation: 'Federal Ministry of Transportation', external: false }],
  procurement_officer: [{ id: 'u13', name: 'Mr. S. Lawal', organisation: 'Federal Ministry of Transportation', external: false }],
};

export function mockStep8(route: string, method: string, body: Record<string, unknown>, members: PeopleView['members'] = []): { status: number; body?: unknown } | undefined {
  const [path, query = ''] = route.split('?');
  const q = new URLSearchParams(query);
  if (path === '/organisations') return { status: 200, body: ORGS.filter((o) => o.type === q.get('type')) };
  if (path === '/users' && q.get('role') && PEOPLE[q.get('role')!]) return { status: 200, body: PEOPLE[q.get('role')!]!.map(({ external: _e, ...p }) => p) };
  if (/^\/lots\/[^/]+\/valuations\/prefill$/.test(path!)) {
    const prefill: ValuationPrefill = {
      period: q.get('periodMonth') ?? '',
      verifiedPhotos: 142,
      lines: [
        { code: 'structures', discipline: 'Bridges and culverts', unit: 'no.', quantity: 2, measured: '2 completed this month (Rigasa culvert, Jaji culvert)' },
        { code: 'track', discipline: 'Track laying', unit: 'm', quantity: 3800, measured: '3.8 km completed this month (km 88.2 to 92)' },
      ],
    };
    return { status: 200, body: prefill };
  }
  const s = load();
  if (/^\/projects\/[^/]+\/lots$/.test(path!) && method === 'POST') {
    const lot: Lot = {
      id: `l-new-${Date.now()}`,
      name: String(body.name),
      contractRef: String(body.contractRef),
      contractor: ORGS.find((o) => o.id === body.contractorOrgId)?.name ?? '',
      consultant: ORGS.find((o) => o.id === body.consultantOrgId)?.name ?? '',
      chainageFromM: Number(body.chainageFromM),
      chainageToM: Number(body.chainageToM),
      contractSumKobo: body.contractSumKobo ? String(body.contractSumKobo) : null,
    };
    s.lots.push(lot);
    save(s);
    return { status: 201, body: { id: lot.id, status: 'awaiting_confirmation' } };
  }
  // Members of a published project; the wizard's drafts are handled by mock-wizard.
  if (/^\/projects\/(?!draft-)[^/]+\/members$/.test(path!) && method === 'POST') {
    const person = Object.values(PEOPLE).flat().find((x) => x.id === body.userId);
    const lot = body.lotId ? `Lot ${String(body.lotId).replace(/\D/g, '')}` : null;
    // As the API: one membership per person, role and lot.
    if ([...members, ...s.members].some((m) => m.name === person?.name && m.role === body.role && m.lot === lot)) {
      return { status: 409, body: { statusCode: 409, code: 'conflict', message: 'This person is already a member in that role' } };
    }
    s.members.push({ id: String(body.userId), name: person?.name ?? 'New member', role: String(body.role), organisation: person?.organisation ?? '', phone: '+2348030000777', lot });
    save(s);
    return { status: 201, body: { membershipId: `m-${Date.now()}`, confirmed: !person?.external, requiresDirectorConfirmation: !!person?.external } };
  }
  return undefined;
}

/** Lots and members added in this session, merged into the sample project data. */
export function addedLots(): Lot[] {
  return load().lots;
}
export function addedMembers(): PeopleView['members'] {
  return load().members;
}
