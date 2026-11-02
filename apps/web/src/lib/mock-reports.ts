/*
 * Portfolio, reports and notification settings in NEXT_PUBLIC_API_MOCK=1
 * mode. A requested report is "generating" for a few seconds, then ready,
 * as the real background job would be.
 */
import type { NotificationPreferences, Obligation, PortfolioRow, Report } from './types';

const KEY = 'fmot.mockReports';
const PREFS = 'fmot.mockPrefs';
const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const ahead = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

const portfolio: PortfolioRow[] = [
  { id: 'p-pm', name: 'Port Harcourt–Maiduguri rehabilitation', status: 'stalled', health: 'stalled', currentGate: { no: 10, name: 'Right-of-way' }, daysAtGate: 141, physicalPercent: 22, financialPercent: 31, nextMilestone: { name: 'Makurdi bridge repairs', dueOn: ahead(-40) }, states: ['Rivers', 'Abia', 'Enugu', 'Benue', 'Plateau', 'Bauchi', 'Gombe', 'Borno'], contractor: 'CCECC' },
  { id: 'p-lc', name: 'Lagos–Calabar coastal line', status: 'funded', health: 'behind', currentGate: { no: 5, name: 'Tender and evaluation' }, daysAtGate: 63, physicalPercent: null, financialPercent: null, nextMilestone: null, states: ['Lagos', 'Ogun', 'Ondo', 'Edo', 'Delta', 'Bayelsa', 'Rivers', 'Akwa Ibom', 'Cross River'], contractor: null },
  { id: 'p-kk', name: 'Kaduna–Kano SGR', status: 'under_construction', health: 'on_track', currentGate: { no: 13, name: 'Certify and pay' }, daysAtGate: 12, physicalPercent: 68, financialPercent: 71, nextMilestone: { name: 'Zaria station', dueOn: ahead(13) }, states: ['Kaduna', 'Kano'], contractor: 'CCECC' },
  { id: 'p-km', name: 'Kano–Katsina–Maradi SGR', status: 'identified', health: 'on_track', currentGate: { no: 6, name: 'BPP no objection' }, daysAtGate: 3, physicalPercent: null, financialPercent: null, nextMilestone: null, states: ['Kano', 'Katsina'], contractor: null },
  { id: 'p-ak', name: 'Abuja–Kaduna SGR', status: 'operational', health: null, currentGate: null, daysAtGate: null, physicalPercent: 100, financialPercent: 100, nextMilestone: null, states: ['FCT', 'Niger', 'Kaduna'], contractor: 'CCECC' },
  { id: 'p-li', name: 'Lagos–Ibadan SGR', status: 'operational', health: null, currentGate: null, daysAtGate: null, physicalPercent: 100, financialPercent: 100, nextMilestone: null, states: ['Lagos', 'Ogun', 'Oyo'], contractor: 'CCECC' },
  { id: 'p-wi', name: 'Warri–Itakpe SGR', status: 'operational', health: null, currentGate: null, daysAtGate: null, physicalPercent: 100, financialPercent: 100, nextMilestone: null, states: ['Delta', 'Edo', 'Kogi'], contractor: 'Julius Berger' },
];

const obligations: Obligation[] = [
  { id: 'ob1', kind: 'advance_payment_guarantee', title: 'Advance payment guarantee, Lot 2', expiresOn: ahead(28), owner: 'Legal unit', documentCode: 'D14' },
  { id: 'ob2', kind: 'performance_bond', title: 'Performance bond, Lot 3', expiresOn: ahead(190), owner: 'Legal unit', documentCode: 'D14' },
  { id: 'ob3', kind: 'insurance', title: 'Contractor\u2019s all-risk insurance', expiresOn: ahead(6), owner: 'Legal unit', documentCode: 'D14' },
  { id: 'ob4', kind: 'eia_condition', title: 'Quarterly dust and noise monitoring report', expiresOn: ahead(45), owner: 'Engr. A. Bello', documentCode: 'D16' },
];

const seedReports = (): Report[] => [
  { id: 'r-auto-10', kind: 'monthly', period: '2026-10', format: 'pdf', status: 'ready', version: 'finance', createdAt: day(1), requestedBy: null },
  { id: 'r-auto-09', kind: 'monthly', period: '2026-09', format: 'pdf', status: 'ready', version: 'finance', createdAt: day(31), requestedBy: null },
  { id: 'r-lender-09', kind: 'lender', period: '2026-09', format: 'pdf', status: 'ready', version: null, createdAt: day(29), requestedBy: 'Engr. A. Bello' },
];

const load = (): Report[] => JSON.parse(sessionStorage.getItem(KEY) ?? 'null') ?? seedReports();
const save = (r: Report[]) => sessionStorage.setItem(KEY, JSON.stringify(r));

/** Reports turn ready four seconds after they were asked for. */
const settle = (r: Report): Report => (r.status === 'generating' && Date.now() - new Date(r.createdAt).getTime() > 4000 ? { ...r, status: 'ready' } : r);

function add(kind: Report['kind'], period: string | null, format: Report['format']): Report {
  const r: Report = { id: `r-${Date.now()}`, kind, period, format, status: 'generating', version: kind === 'monthly' ? 'finance' : null, createdAt: new Date().toISOString(), requestedBy: 'Engr. H. Danjuma' };
  save([r, ...load()]);
  return r;
}

export function mockReports(route: string, method: string, body: Record<string, unknown>): { status: number; body?: unknown } | undefined {
  if (route === '/portfolio') return { status: 200, body: portfolio };
  if (/^\/projects\/[^/]+\/obligations$/.test(route)) return { status: 200, body: obligations };
  if (/^\/projects\/[^/]+\/reports$/.test(route)) {
    if (method === 'POST') return { status: 201, body: add(body.kind as Report['kind'], String(body.period), 'pdf') };
    return { status: 200, body: load().filter((r) => r.kind === 'monthly' || r.kind === 'lender').map(settle) };
  }
  if (route === '/reports/portfolio') {
    if (method === 'POST') return { status: 201, body: add('portfolio', null, body.format as Report['format']) };
    return { status: 200, body: load().filter((r) => r.kind === 'portfolio' || r.kind === 'eyemark').map(settle) };
  }
  if (route === '/reports/eyemark') return { status: 201, body: add('eyemark', null, 'csv') };
  if (/^\/reports\/[^/]+\/file$/.test(route)) return { status: 200, body: { url: '#' } };
  if (route === '/me/notification-preferences') {
    if (method === 'PUT') {
      sessionStorage.setItem(PREFS, JSON.stringify({ ...body, digestEligible: true }));
      return { status: 204 };
    }
    const saved = sessionStorage.getItem(PREFS);
    const prefs: NotificationPreferences = saved ? (JSON.parse(saved) as NotificationPreferences) : { channel: 'sms', weeklyDigest: true, digestEligible: true, quietFrom: '21:00', quietTo: '07:00' };
    return { status: 200, body: prefs };
  }
  return undefined;
}
