/* Sample data for the administration screens in NEXT_PUBLIC_API_MOCK=1 mode. */
import type { AdminUser, AuditEntry, NotificationLogEntry, Organisation, ReminderRule, Setting } from './types';

const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const KEY = 'fmot.mockAdmin';

interface Store {
  organisations: Organisation[];
  users: AdminUser[];
  settings: Setting[];
  rules: ReminderRule[];
}

const seed: Store = {
  organisations: [
    { id: 'o1', name: 'Federal Ministry of Transportation, rail directorate', type: 'ministry_unit', contactName: 'Engr. H. Danjuma', contactPhone: '+2348030000001', active: true, people: 14 },
    { id: 'o2', name: 'Nigerian Railway Corporation', type: 'nrc', contactName: 'Engr. K. Okafor', contactPhone: '+2348030000002', active: true, people: 6 },
    { id: 'o3', name: 'CCECC', type: 'contractor', contactName: 'Mr. Li Wei', contactPhone: '+2348030000010', active: true, people: 9 },
    { id: 'o4', name: 'TEAM Consultants', type: 'consultant', contactName: 'Engr. T. Adeyemi', contactPhone: '+2348030000003', active: true, people: 4 },
    { id: 'o5', name: 'China Development Bank', type: 'lender', contactName: null, contactPhone: null, active: true, people: 2 },
    { id: 'o6', name: 'Schull Technologies', type: 'service_provider', contactName: 'Tochi Nwachukwu', contactPhone: '+2348030000099', active: true, people: 2 },
  ],
  users: [
    user('u1', 'Engr. A. Bello', '+2348030000000', 'o1', 'ministry_project_manager', 'active', 0, 2, [['Kaduna–Kano SGR', null], ['Kano–Katsina–Maradi SGR', null]]),
    user('u2', 'Engr. H. Danjuma', '+2348030000001', 'o1', 'director_rail', 'active', 0, 7, []),
    user('u3', 'Engr. K. Okafor', '+2348030000002', 'o2', 'nrc_project_engineer', 'active', 1, 3, [['Kaduna–Kano SGR', null]]),
    user('u4', 'Engr. T. Adeyemi', '+2348030000003', 'o4', 'consultant_resident_engineer', 'active', 0, 12, [['Kaduna–Kano SGR', 'Lot 1'], ['Kaduna–Kano SGR', 'Lot 2']]),
    user('u6', 'Musa Garba', '+2348030004417', 'o3', 'contractor_site_manager', 'active', 0, 0, [['Kaduna–Kano SGR', 'Lot 3']], 0),
    user('u7', 'Ibrahim Sule', '+2348030005521', 'o3', 'contractor_site_manager', 'locked', 3, 0, [['Kaduna–Kano SGR', 'Lot 2']], 2),
    user('u10', 'Chinedu Okeke', '+2348031234567', 'o3', 'contractor_site_manager', 'invited', null, 0, [['Kaduna–Kano SGR', 'Lot 2']]),
  ],
  settings: [
    { key: 'variation_limit_amount', label: 'Variation the Director can approve, up to', value: '500000000', unit: 'naira', confirmedByMinistry: false },
    { key: 'variation_limit_days', label: 'Extension of time the Director can approve, up to', value: '90', unit: 'days', confirmedByMinistry: false },
    { key: 'corridor_width_m', label: 'Corridor width each side of the line', value: '500', unit: 'metres', confirmedByMinistry: false },
    { key: 'offline_warn_hours', label: 'Warn when a photo is sent late after', value: '24', unit: 'hours', confirmedByMinistry: false },
    { key: 'offline_refuse_hours', label: 'Refuse a photo sent later than', value: '72', unit: 'hours', confirmedByMinistry: false },
  ],
  rules: [
    { key: 'no_photo_by', label: 'Remind a site manager with no photo by', value: 16, unit: 'o\u2019clock' },
    { key: 'review_queue_days', label: 'Tell the project manager when the review queue is older than', value: 2, unit: 'days' },
    { key: 'certificate_step_days', label: 'Tell the Director when a payment step has waited', value: 10, unit: 'days' },
    { key: 'expiry_warning_days', label: 'Warn before a bond or guarantee expires', value: 30, unit: 'days' },
    { key: 'stalled_days', label: 'Show a project as stalled after waiting at a gate for', value: 90, unit: 'days' },
  ],
};

function user(id: string, name: string, phone: string, org: string, role: string, status: AdminUser['status'], lastLoginDays: number | null, openTasks: number, ms: Array<[string, string | null]>, lastUploadDays: number | null = null): AdminUser {
  // The organisation's name and type are filled in by load(), once the seed exists.
  return {
    id, name, phone, role, status, openTasks,
    organisation: { id: org, name: org, type: 'ministry_unit' },
    lastLoginAt: lastLoginDays === null ? null : day(lastLoginDays),
    lastUploadAt: lastUploadDays === null ? null : day(lastUploadDays),
    memberships: ms.map(([project, lot]) => ({ project, lot })),
    awaitingDirector: false,
  };
}

const load = (): Store => {
  const raw = sessionStorage.getItem(KEY);
  if (raw) return JSON.parse(raw) as Store;
  // Fill organisation names now that the seed exists.
  for (const u of seed.users) {
    const o = seed.organisations.find((x) => x.id === u.organisation.id)!;
    u.organisation = { id: o.id, name: o.name, type: o.type };
  }
  return structuredClone(seed);
};
const save = (s: Store) => sessionStorage.setItem(KEY, JSON.stringify(s));

const audit: AuditEntry[] = [
  ['Engr. K. Okafor', 'Certified', 'Payment certificate 14', 'Kaduna–Kano SGR'],
  ['IT administrator', 'Invited', 'User Chinedu Okeke', null],
  ['Ibrahim Sule', 'Locked out', 'Five wrong PINs', null],
  ['Engr. H. Danjuma', 'Published', 'Project Kano–Katsina–Maradi SGR', 'Kano–Katsina–Maradi SGR'],
].map(([actor, action, entity, project], i) => ({ id: `au${i}`, at: day(i * 0.4), actor: actor!, action: action!, entity: entity!, project: project ?? null }));

const notifications: NotificationLogEntry[] = [
  ['+2348031234567', 'sms', 'invite', 'delivered'],
  ['+2348030000001', 'sms', 'task_created', 'delivered'],
  ['+2348030005521', 'sms', 'reminder_no_photo', 'failed'],
  ['+2348030000002', 'sms', 'task_created', 'sent'],
].map(([to, channel, template, status], i) => ({ id: `n${i}`, at: day(i * 0.2), to: to!, channel: channel as 'sms', template: template!, status: status as NotificationLogEntry['status'] }));

export function mockAdmin(route: string, method: string, body: Record<string, unknown>): { status: number; body?: unknown } | undefined {
  if (!route.startsWith('/admin/')) return undefined;
  const s = load();
  const path = route.split('?')[0]!;
  if (path === '/admin/organisations' && method === 'GET') return { status: 200, body: s.organisations };
  if (path === '/admin/organisations' && method === 'POST') {
    const o: Organisation = { id: `o${Date.now()}`, name: String(body.name), type: body.type as Organisation['type'], contactName: String(body.contactName || '') || null, contactPhone: String(body.contactPhone || '') || null, active: true, people: 0 };
    s.organisations.push(o);
    save(s);
    return { status: 201, body: o };
  }
  if (path === '/admin/users' && method === 'GET') return { status: 200, body: s.users };
  if (path === '/admin/users' && method === 'POST') {
    const o = s.organisations.find((x) => x.id === body.organisationId)!;
    const external = ['contractor', 'consultant', 'lender'].includes(o.type);
    const u: AdminUser = {
      id: `u${Date.now()}`, name: String(body.name), phone: String(body.phone), email: body.email ? String(body.email) : null, codeChannel: body.codeChannel === 'email' ? 'email' : 'sms', role: String(body.role), status: 'invited', openTasks: 0,
      organisation: { id: o.id, name: o.name, type: o.type }, lastLoginAt: null, lastUploadAt: null,
      memberships: (body.memberships as Array<{ projectId: string; lotId: string | null }>).map((m) => ({ project: m.projectId === 'p-kk' ? 'Kaduna–Kano SGR' : 'Kano–Katsina–Maradi SGR', lot: m.lotId ? `Lot ${m.lotId.slice(1)}` : null })),
      awaitingDirector: external,
    };
    s.users.unshift(u);
    save(s);
    return { status: 201, body: u };
  }
  const userAction = /^\/admin\/users\/([^/]+)\/(resend-invite|reset-pin|deactivate)$/.exec(path);
  if (userAction) {
    const u = s.users.find((x) => x.id === userAction[1]);
    if (u && userAction[2] === 'reset-pin') u.status = 'invited';
    if (u && userAction[2] === 'deactivate') { u.status = 'deactivated'; u.openTasks = 0; }
    save(s);
    return { status: 204 };
  }
  if (path === '/admin/projects') return { status: 200, body: [{ id: 'p-kk', name: 'Kaduna–Kano SGR', lots: [{ id: 'l1', name: 'Lot 1' }, { id: 'l2', name: 'Lot 2' }, { id: 'l3', name: 'Lot 3' }] }, { id: 'p-km', name: 'Kano–Katsina–Maradi SGR', lots: [] }] };
  if (path === '/admin/settings') return { status: 200, body: s.settings };
  const setting = /^\/admin\/settings\/(.+)$/.exec(path);
  if (setting && method === 'PUT') { const x = s.settings.find((y) => y.key === setting[1]); if (x) x.value = String(body.value); save(s); return { status: 204 }; }
  if (path === '/admin/reminder-rules') return { status: 200, body: s.rules };
  const rule = /^\/admin\/reminder-rules\/(.+)$/.exec(path);
  if (rule && method === 'PUT') { const x = s.rules.find((y) => y.key === rule[1]); if (x) x.value = Number(body.value); save(s); return { status: 204 }; }
  if (path === '/admin/audit') return { status: 200, body: audit };
  if (path === '/admin/notifications') return { status: 200, body: notifications };
  return undefined;
}
