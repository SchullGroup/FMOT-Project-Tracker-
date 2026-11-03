/*
 * Sample data for NEXT_PUBLIC_API_MOCK=1, so the screens can be opened and
 * demonstrated without the API. Sign in with any phone, code 123456 and any
 * four-digit PIN that is not an easy one (1111, 1234 and similar are refused,
 * as on the real API). Coordinates are approximate and for display only.
 */
import { mockProjectRoute } from './mock-project';
import { mockWizard, mockWizardUpload } from './mock-wizard';
import { mockAct, mockTask, mockTaskInbox, RETURN_REASONS } from './mock-tasks';
import { mockAdmin } from './mock-admin';
import { mockReports } from './mock-reports';
import { mockBaselineUpload, mockForms } from './mock-forms';
import type { MapCounters, MapProjectsResponse, Me, ProjectCard, TaskInbox } from './types';

const me: Me = {
  id: 'u-director',
  name: 'Engr. H. Danjuma',
  phone: '+2348030000001',
  role: 'director_rail',
  organisation: { id: 'o-fmot', name: 'Federal Ministry of Transportation', type: 'ministry_unit' },
  // Sample mode shows every area; on the real API only the IT administrator has the admin permissions.
  permissions: ['projects:create', 'projects:read', 'reports:read', 'reports:generate', 'finance:read_amounts', 'tasks:read', 'admin:users', 'admin:organisations', 'admin:reminders', 'audit:read', 'reports:export_eyemark', 'progress:plan', 'completion:record', 'obligations:manage'],
};

const projects: MapProjectsResponse = {
  type: 'FeatureCollection',
  features: [
    feature('p-kk', 'Kaduna–Kano SGR', 'under_construction', 'on_track', 13, 12, [
      [7.43, 10.52], [7.71, 11.08], [8.1, 11.55], [8.52, 12.0],
    ]),
    feature('p-km', 'Kano–Katsina–Maradi SGR', 'draft', null, 1, 2, [
      [8.52, 12.0], [8.0, 12.5], [7.6, 12.99], [7.1, 13.5],
    ]),
    feature('p-ak', 'Abuja–Kaduna SGR', 'operational', 'on_track', null, null, [
      [7.4, 9.05], [7.3, 9.6], [7.43, 10.52],
    ]),
    feature('p-li', 'Lagos–Ibadan SGR', 'operational', 'on_track', null, null, [
      [3.38, 6.45], [3.6, 6.9], [3.9, 7.38],
    ]),
    feature('p-wi', 'Warri–Itakpe SGR', 'operational', 'on_track', null, null, [
      [5.75, 5.52], [6.0, 6.6], [6.3, 7.62],
    ]),
    feature('p-pm', 'Port Harcourt–Maiduguri rehabilitation', 'stalled', 'stalled', 10, 41, [
      [7.03, 4.82], [7.51, 6.44], [8.54, 7.73], [8.89, 9.9], [10.3, 10.6], [13.16, 11.85],
    ]),
    feature('p-lc', 'Lagos–Calabar coastal line', 'funded', 'behind', 5, 63, [
      [3.38, 6.45], [5.63, 6.34], [5.75, 5.52], [7.03, 4.82], [8.33, 4.96],
    ]),
  ],
};

const counters: MapCounters = { onTrack: 4, behind: 1, stalled: 1, drafts: 1 };

const cards: Record<string, ProjectCard> = {
  'p-kk': {
    id: 'p-kk',
    name: 'Kaduna–Kano SGR',
    type: 'new_line',
    lengthM: 203_000,
    states: ['Kaduna', 'Kano'],
    status: 'under_construction',
    health: 'on_track',
    currentGate: { no: 13, name: 'Certify and pay' },
    daysAtGate: 12,
    disciplines: [
      { name: 'Earthworks', percent: 80 },
      { name: 'Structures', percent: 60 },
      { name: 'Track laying', percent: 40 },
    ],
    physicalPercent: 68,
    financialPercent: 71,
    latestPhoto: null,
    personInCharge: { name: 'Engr. A. Bello', role: 'Ministry project manager', phone: '+2348030000000' },
    blockers: [{ text: 'Compensation unpaid for 14 parcels, km 140 to 152' }],
  },
};

const tasks: TaskInbox = {
  doneToday: 4,
  groups: [
    {
      project: { id: 'p-km', name: 'Kano–Katsina–Maradi SGR' },
      tasks: [
        task('t1', 'publish_project', 'Publish project', 'Sent by Engr. A. Bello for publishing', 1),
        task('t2', 'confirm_gate', 'Confirm gate 6: BPP no objection', 'Certificate uploaded; confirm the date', 72),
      ],
    },
    {
      project: { id: 'p-kk', name: 'Kaduna–Kano SGR' },
      tasks: [
        task('t3', 'payment_certificate', 'Approve payment certificate 14', 'NRC engineer certified it; needs your approval', 24),
        task('t4', 'confirm_account', 'Confirm new account', 'CCECC site manager for Lot 2', 3),
      ],
    },
  ],
};

function feature(
  id: string,
  name: string,
  status: MapProjectsResponse['features'][number]['properties']['status'],
  health: MapProjectsResponse['features'][number]['properties']['health'],
  currentGate: number | null,
  daysAtGate: number | null,
  coordinates: [number, number][],
): MapProjectsResponse['features'][number] {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties: { id, name, status, health, currentGate, daysAtGate },
  };
}

function task(id: string, type: string, title: string, reason: string, hoursAgo: number) {
  return {
    id,
    type,
    title,
    reason,
    createdAt: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
    dueAt: null,
    overdue: hoursAgo > 48,
  };
}

const EASY_PINS = /^(\d)\1{3}$|^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/;

const SIGNED_IN_KEY = 'fmot.mockSignedIn';
let signedIn = typeof window !== 'undefined' && sessionStorage.getItem(SIGNED_IN_KEY) === '1';
const setSignedIn = (v: boolean) => {
  signedIn = v;
  sessionStorage.setItem(SIGNED_IN_KEY, v ? '1' : '0');
};

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function mockFetch(path: string, init: RequestInit): Promise<Response> {
  await new Promise((r) => setTimeout(r, 250)); // feel like a network
  const body = init.body ? (JSON.parse(String(init.body)) as Record<string, string>) : {};
  const route = path.split('?')[0] ?? path;

  switch (route) {
    case '/auth/otp/request':
      return json(204);
    case '/auth/otp/verify':
      return body.code === '123456'
        ? json(200, { ticket: 'mock-ticket', hasPin: false })
        : json(400, { code: 'code_incorrect', message: 'That code is not right.' });
    case '/auth/pin/set':
    case '/auth/pin/login':
    case '/invites/accept':
      if (body.pin && EASY_PINS.test(body.pin)) {
        return json(400, { code: 'pin_too_easy', message: 'Choose a PIN that is harder to guess.' });
      }
      setSignedIn(true);
      return json(200, { accessToken: 'mock-access' });
    case '/auth/refresh':
      return signedIn ? json(200, { accessToken: 'mock-access' }) : json(401);
    case '/auth/logout':
      setSignedIn(false);
      return json(204);
    case '/invites/code':
      return json(204);
  }

  if (route.startsWith('/invites/')) {
    return json(200, {
      name: 'Musa Garba',
      role: 'Contractor site manager',
      organisation: 'CCECC',
      phoneMasked: '0803 *** 4417',
    });
  }

  if (!signedIn) return json(401);

  if (route === '/me') return json(200, me);
  if (route === '/map/projects') return json(200, projects);
  if (route === '/map/counters') return json(200, counters);
  if (route === '/tasks') return json(200, mockTaskInbox());
  if (route.startsWith('/media/')) return json(404);

  const method = String(init.method ?? 'GET');
  if (!signedIn && !route.startsWith('/auth') && !route.startsWith('/invites')) return json(401);
  const forms = mockForms(route, method, body);
  if (forms) return json(forms.status, forms.body);
  const reports = mockReports(route, method, body);
  if (reports) return json(reports.status, reports.body);
  const admin = mockAdmin(route, method, body);
  if (admin) return json(admin.status, admin.body);
  if (route === '/reference/return-reasons') return json(200, RETURN_REASONS);
  const taskAct = /^\/tasks\/([^/]+)\/act$/.exec(route);
  if (taskAct?.[1]) {
    const needsPin = ['approve', 'confirm', 'publish', 'certify', 'final_approve', 'countersign', 'mark_paid'].includes(String(body.action));
    const headers = new Headers(init.headers);
    if (needsPin && !headers.get('X-Pin-Confirmation')) return json(403, { code: 'pin_confirmation_required', message: 'PIN needed' });
    mockAct(taskAct[1]);
    return json(204);
  }
  const taskOne = /^\/tasks\/([^/]+)$/.exec(route);
  if (taskOne?.[1]) {
    const t = mockTask(taskOne[1]);
    return t ? json(200, t) : json(404, { code: 'task_done', message: 'Already done' });
  }
  if (route === '/auth/pin/confirm') {
    return EASY_PINS.test(String(body.pin)) || String(body.pin).length !== 4
      ? json(400, { code: 'pin_incorrect', message: 'Wrong PIN' })
      : json(200, { token: 'mock-pin-token' });
  }

  const wizard = mockWizard(route, method, body);
  if (wizard) return json(wizard.status, wizard.body);

  const projectData = mockProjectRoute(route);
  if (projectData !== undefined) return json(200, projectData);

  const cardMatch = /^\/projects\/([^/]+)\/card$/.exec(route);
  if (cardMatch?.[1]) {
    const card = cards[cardMatch[1]];
    if (card) return json(200, card);
    const f = projects.features.find((p) => p.properties.id === cardMatch[1]);
    if (!f) return json(404);
    return json(200, {
      ...cards['p-kk']!,
      id: f.properties.id,
      name: f.properties.name,
      status: f.properties.status,
      health: f.properties.health,
      currentGate: f.properties.currentGate ? { no: f.properties.currentGate, name: `Gate ${f.properties.currentGate}` } : null,
      daysAtGate: f.properties.daysAtGate,
      blockers: [],
    } satisfies ProjectCard);
  }

  return json(404, { code: 'not_found', message: `No mock for ${route}` });
}

export async function mockUpload(path: string, fields: Record<string, string>, file: File): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 600));
  if (/^\/projects\/draft-/.test(path)) return mockWizardUpload(path, fields, file);
  const baseline = mockBaselineUpload(path, fields);
  if (baseline) return baseline;
  return { id: `doc-${Date.now()}`, code: fields.code ?? 'D00', title: fields.title || file.name, version: 1 };
}
