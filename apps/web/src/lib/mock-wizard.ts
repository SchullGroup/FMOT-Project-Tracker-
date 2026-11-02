/*
 * The create-project wizard in sample-data mode: one draft kept in
 * sessionStorage so a reload keeps your place.
 */
import { TOWNS } from './towns';
import type { DraftReview } from './types';

const KEY = 'fmot.mockDraft';

const load = (): DraftReview | null => {
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as DraftReview) : null;
};
const save = (d: DraftReview) => sessionStorage.setItem(KEY, JSON.stringify(d));

function blank(id: string): DraftReview {
  return { id, status: 'draft', locked: false, basics: null, fundingRoute: null, alignment: null, stations: [], members: [], documents: [], gate1PassedOn: null, returnReason: null };
}

export function mockWizard(route: string, method: string, body: Record<string, unknown>): { status: number; body?: unknown } | undefined {
  if (route === '/projects' && method === 'POST') {
    const d = blank(`draft-${Date.now().toString(36)}`);
    d.basics = body as unknown as DraftReview['basics'];
    d.members = [
      { name: 'Engr. A. Bello', role: 'ministry_project_manager', organisation: 'Federal Ministry of Transportation', confirmed: true },
      { name: 'Engr. H. Danjuma', role: 'director_rail', organisation: 'Federal Ministry of Transportation', confirmed: true },
    ];
    save(d);
    return { status: 201, body: { id: d.id } };
  }
  if (route.startsWith('/users')) {
    return { status: 200, body: [{ id: 'u3', name: 'Engr. K. Okafor', organisation: 'Nigerian Railway Corporation' }, { id: 'u9', name: 'Engr. L. Ade', organisation: 'Nigerian Railway Corporation' }] };
  }
  const m = /^\/projects\/(draft-[^/]+)(\/.*)?$/.exec(route);
  if (!m) return undefined;
  const d = load() ?? blank(m[1]!);
  const rest = m[2] ?? '';
  switch (`${method} ${rest}`) {
    case 'PUT ':
      d.basics = body as unknown as DraftReview['basics'];
      break;
    case 'PUT /funding-route':
      d.fundingRoute = body.route as DraftReview['fundingRoute'];
      break;
    case 'POST /stations': {
      const st = { id: `st-${d.stations.length + 1}`, name: String(body.name), chainageM: Number(body.chainageM) };
      d.stations = [...d.stations, st].sort((a, b) => a.chainageM - b.chainageM);
      save(d);
      return { status: 201, body: st };
    }
    case 'POST /members':
      d.members = [...d.members, { name: body.userId === 'u3' ? 'Engr. K. Okafor' : 'Engr. L. Ade', role: String(body.role), organisation: 'Nigerian Railway Corporation', confirmed: true }];
      break;
    case 'POST /gates/1/evidence':
      d.gate1PassedOn = String(body.effectiveDate);
      break;
    case 'GET /review':
      return { status: 200, body: d };
    case 'POST /send-for-publishing':
      d.locked = true;
      break;
    case 'GET /card':
      return { status: 404 };
    default:
      if (rest.startsWith('/stations/') && method === 'DELETE') {
        d.stations = d.stations.filter((s) => s.id !== rest.split('/')[2]);
        break;
      }
      return undefined;
  }
  save(d);
  return { status: 204 };
}

export function mockWizardUpload(route: string, fields: Record<string, string>, file: File): unknown {
  const m = /^\/projects\/(draft-[^/]+)\/(alignment|documents)$/.exec(route);
  const d = load();
  if (!m || !d) throw new Error('No draft');
  if (m[2] === 'alignment') {
    const a = TOWNS[d.basics?.startTown ?? ''] ?? TOWNS.Kano!;
    const b = TOWNS[d.basics?.endTown ?? ''] ?? TOWNS['Maradi (Niger)']!;
    const mid: [number, number] = [(a[0] + b[0]) / 2 - 0.25, (a[1] + b[1]) / 2 + 0.1];
    const km = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 111 * 1.08);
    d.alignment = { lengthM: km * 1000, states: ['Kano', 'Katsina'], geometry: { type: 'LineString', coordinates: [a, mid, b] } };
    void file;
    save(d);
    return d.alignment;
  }
  const doc = { id: `doc-${d.documents.length + 1}`, code: fields.code!, title: fields.title || file.name, version: 1 };
  d.documents = [...d.documents.filter((x) => x.code !== doc.code), doc];
  save(d);
  return doc;
}
