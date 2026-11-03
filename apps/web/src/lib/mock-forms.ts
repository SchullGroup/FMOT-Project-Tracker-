/* Sample data for the four Step 7 forms in NEXT_PUBLIC_API_MOCK=1 mode, kept for the browser session. */
import type { BaselineRevision, DesignRequirement, Obligation, PracticalCompletion } from './types';

const KEY = 'fmot.mockForms';
const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

interface Store {
  design: Record<string, DesignRequirement[]>;
  baseline: Record<string, BaselineRevision[]>;
  completion: Record<string, PracticalCompletion>;
  obligations: Obligation[];
}

// The disciplines as seeded on the API (seed-data.ts), in their order.
const disciplines = (status: Record<string, DesignRequirement['status']>, required: string[]): DesignRequirement[] =>
  [
    ['earthworks', 'Earthworks'],
    ['drainage', 'Drainage'],
    ['structures', 'Bridges and culverts'],
    ['track', 'Track laying'],
    ['stations', 'Stations'],
    ['systems', 'Signalling, telecoms and power'],
    ['equipment', 'Equipment'],
    ['other', 'Other'],
  ].map(([code, name]) => ({ disciplineCode: code!, disciplineName: name!, required: required.includes(code!), status: status[code!] ?? 'none' }));

const seed = (): Store => ({
  design: {
    l1: disciplines({ earthworks: 'approved_for_construction', structures: 'approved_for_construction', track: 'approved_for_construction', systems: 'approved_for_construction' }, ['earthworks', 'structures', 'track', 'systems']),
    l2: disciplines({ earthworks: 'approved_for_construction', structures: 'approved_for_construction', track: 'approved_for_construction', systems: 'returned', stations: 'under_review' }, ['earthworks', 'structures', 'track', 'systems', 'stations']),
    l3: disciplines({ structures: 'under_review', stations: 'approved_for_construction' }, ['earthworks', 'structures', 'stations']),
  },
  baseline: {
    l1: [{ id: 'b1-1', revision: 1, uploadedAt: day(400), uploadedBy: 'Engr. A. Bello', reason: null, extensionOfTimeId: null, status: 'approved' }],
    l2: [{ id: 'b2-1', revision: 1, uploadedAt: day(400), uploadedBy: 'Engr. A. Bello', reason: null, extensionOfTimeId: null, status: 'approved' }],
    l3: [],
  },
  completion: {
    l1: { lotId: 'l1', completedOn: null, recordedBy: null, status: 'not_recorded' },
    l2: { lotId: 'l2', completedOn: null, recordedBy: null, status: 'not_recorded' },
    l3: { lotId: 'l3', completedOn: null, recordedBy: null, status: 'not_recorded' },
  },
  obligations: [],
});

const load = (): Store => JSON.parse(sessionStorage.getItem(KEY) ?? 'null') ?? seed();
const save = (s: Store) => sessionStorage.setItem(KEY, JSON.stringify(s));

export function mockForms(route: string, method: string, body: Record<string, unknown>): { status: number; body?: unknown } | undefined {
  const s = load();
  const design = /^\/lots\/([^/]+)\/design-requirements$/.exec(route);
  if (design) {
    const lot = design[1]!;
    if (method === 'PUT') {
      const required = body.required as string[];
      s.design[lot] = (s.design[lot] ?? []).map((d) => ({ ...d, required: required.includes(d.disciplineCode) }));
      save(s);
      return { status: 200, body: s.design[lot] };
    }
    return { status: 200, body: s.design[lot] ?? [] };
  }
  const revisions = /^\/lots\/([^/]+)\/baseline\/revisions$/.exec(route);
  if (revisions) return { status: 200, body: s.baseline[revisions[1]!] ?? [] };
  const completion = /^\/projects\/[^/]+\/lots\/([^/]+)\/practical-completion$/.exec(route);
  if (completion) {
    const lot = completion[1]!;
    if (method === 'POST') {
      s.completion[lot] = { lotId: lot, completedOn: String(body.completedOn), recordedBy: 'Engr. A. Bello', status: 'waiting_for_director' };
      save(s);
      return { status: 200, body: s.completion[lot] };
    }
    return { status: 200, body: s.completion[lot] ?? { lotId: lot, completedOn: null, recordedBy: null, status: 'not_recorded' } };
  }
  return undefined;
}

// As the API: the first upload is revision 1 and used at once; a later one (with its reason) waits for the Director.
export function mockBaselineUpload(route: string, fields: Record<string, string>): unknown | undefined {
  const m = /^\/lots\/([^/]+)\/baseline$/.exec(route);
  if (!m) return undefined;
  const s = load();
  const list = s.baseline[m[1]!] ?? [];
  const r: BaselineRevision = {
    id: `b-${Date.now()}`,
    revision: list.length + 1,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Engr. A. Bello',
    reason: list.length ? fields.reason ?? null : null,
    extensionOfTimeId: fields.variationId ?? null,
    status: list.length ? 'pending' : 'approved',
  };
  s.baseline[m[1]!] = [r, ...list];
  save(s);
  return r;
}

const OWNER: Record<Obligation['kind'], string> = { performance_bond: 'Legal', advance_payment_guarantee: 'Legal', insurance: 'Legal', eia_condition: 'Project manager' };

// The request body is in the API's words (ObligationDto); the list is in the screen's.
export function mockObligations(route: string, method: string, body: Record<string, unknown>, seedList: Obligation[]): { status: number; body?: unknown } | undefined {
  if (!/^\/projects\/[^/]+\/obligations$/.test(route)) return undefined;
  const s = load();
  if (method === 'POST') {
    const kind = body.kind as Obligation['kind'];
    const o: Obligation = {
      id: `ob-${Date.now()}`,
      kind,
      title: body.description ? `${String(body.reference)}: ${String(body.description)}` : String(body.reference),
      expiresOn: String(body.expiresOn),
      owner: OWNER[kind],
      documentCode: body.documentId ? 'D14' : null,
    };
    s.obligations.push(o);
    save(s);
    return { status: 201, body: o };
  }
  return { status: 200, body: [...seedList, ...s.obligations] };
}
