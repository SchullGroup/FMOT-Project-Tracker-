/*
 * Portfolio, reports and notification settings in NEXT_PUBLIC_API_MOCK=1
 * mode. A requested report is "generating" for a few seconds, then ready,
 * as the real background job would be. Ready reports download real files
 * (public/sample-reports), made by the API's own report code from the demo
 * data: October monthly and lender reports for every published line, September
 * for Kaduna–Kano, the portfolio as PDF and Excel, and the Eyemark export.
 */
import { mockObligations } from './mock-forms';
import type { NotificationPreferences, Obligation, PortfolioRow, Report } from './types';

const KEY = 'fmot.mockReports.v2';
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

// A report and the project it is for (null for portfolio and Eyemark).
type Stored = Report & { projectId: string | null };

const LINES = ['p-ak', 'p-kk', 'p-lc', 'p-li', 'p-pm', 'p-wi'];
// Sample files with a period other than October 2026.
const OTHER_MONTHS = new Set(['monthly-p-kk-2026-09.pdf', 'lender-p-kk-2026-09.pdf']);

const seedReports = (): Stored[] => [
  ...LINES.map((projectId): Stored => ({ id: `r-auto-10-${projectId}`, projectId, kind: 'monthly', period: '2026-10', format: 'pdf', status: 'ready', version: 'finance', createdAt: day(9), requestedBy: null })),
  { id: 'r-auto-09-p-kk', projectId: 'p-kk', kind: 'monthly', period: '2026-09', format: 'pdf', status: 'ready', version: 'finance', createdAt: day(40), requestedBy: null },
  { id: 'r-lender-09-p-kk', projectId: 'p-kk', kind: 'lender', period: '2026-09', format: 'pdf', status: 'ready', version: null, createdAt: day(38), requestedBy: 'Engr. A. Bello' },
  { id: 'r-portfolio-10', projectId: null, kind: 'portfolio', period: null, format: 'pdf', status: 'ready', version: null, createdAt: day(2), requestedBy: 'Engr. H. Danjuma' },
];

const load = (): Stored[] => JSON.parse(sessionStorage.getItem(KEY) ?? 'null') ?? seedReports();
const save = (r: Stored[]) => sessionStorage.setItem(KEY, JSON.stringify(r));

/** The sample file a ready report downloads: its own month where there is one, else the line's October report. */
function sampleFile(r: Stored): string | null {
  if (r.kind === 'portfolio') return r.format === 'xlsx' ? 'portfolio.xlsx' : 'portfolio.pdf';
  if (r.kind === 'eyemark') return 'eyemark.csv';
  if (!r.projectId || !LINES.includes(r.projectId)) return null;
  const own = `${r.kind}-${r.projectId}-${r.period}.pdf`;
  return OTHER_MONTHS.has(own) ? own : `${r.kind}-${r.projectId}-2026-10.pdf`;
}

// What the screens see: the report without the project it was filed under.
const view = ({ projectId: _projectId, ...r }: Stored): Report => r;

/** Reports turn ready four seconds after they were asked for. */
const settle = (r: Stored): Stored => (r.status === 'generating' && Date.now() - new Date(r.createdAt).getTime() > 4000 ? { ...r, status: 'ready' } : r);

function add(projectId: string | null, kind: Report['kind'], period: string | null, format: Report['format']): Report {
  const r: Stored = { id: `r-${Date.now()}`, projectId, kind, period, format, status: 'generating', version: kind === 'monthly' ? 'finance' : null, createdAt: new Date().toISOString(), requestedBy: 'Engr. H. Danjuma' };
  save([r, ...load()]);
  return view(r);
}

export function mockReports(route: string, method: string, body: Record<string, unknown>): { status: number; body?: unknown } | undefined {
  if (route === '/portfolio') return { status: 200, body: portfolio };
  const ob = mockObligations(route, method, body, obligations);
  if (ob) return ob;
  const project = /^\/projects\/([^/]+)\/reports$/.exec(route)?.[1];
  if (project) {
    if (method === 'POST') return { status: 201, body: add(project, body.kind as Report['kind'], String(body.period), 'pdf') };
    return { status: 200, body: load().filter((r) => r.projectId === project).map(settle).map(view) };
  }
  if (route === '/reports/portfolio') {
    if (method === 'POST') return { status: 201, body: add(null, 'portfolio', null, body.format as Report['format']) };
    return { status: 200, body: load().filter((r) => r.kind === 'portfolio' || r.kind === 'eyemark').map(settle).map(view) };
  }
  if (route === '/reports/eyemark') return { status: 201, body: add(null, 'eyemark', null, 'csv') };
  const fileOf = /^\/reports\/([^/]+)\/file$/.exec(route)?.[1];
  if (fileOf) {
    const r = load().map(settle).find((x) => x.id === fileOf);
    const file = r?.status === 'ready' ? sampleFile(r) : null;
    return file ? { status: 200, body: { url: `/sample-reports/${file}`, expiresAt: new Date(Date.now() + 300_000).toISOString() } } : { status: 404, body: { code: 'not_found', message: 'No such report' } };
  }
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
