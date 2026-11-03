/*
 * Every API call the web app makes, in one place. The API's responses (api-shapes.ts) are mapped onto the screen
 * shapes (types.ts) here, and the screens' requests onto the API's fields, so the components never see the
 * difference. In sample-data mode (NEXT_PUBLIC_API_MOCK=1) the mock already speaks the screen shapes and nothing
 * is mapped.
 */
import { type ApiBody, roleLabel, type RoleCode } from '@fmot/shared';
import { api, MOCK, setAccessToken, upload } from './api';
import type {
  ApiBaselineRevision,
  ApiCard,
  ApiCertificate,
  ApiChain,
  ApiDesignPackage,
  ApiDesignRequirement,
  ApiFundingRoute,
  ApiGateRow,
  ApiInbox,
  ApiMapFeature,
  ApiObligation,
  ApiPracticalCompletion,
  ApiMe,
  ApiProgress,
  ApiReport,
  ApiReview,
  ApiStripMap,
  ApiSubmission,
  ApiTaskDetail,
} from './api-shapes';
import { getDeviceId } from './device';
import { TOWNS } from './towns';
import type {
  ActivityItem,
  AdminUser,
  AlignmentResult,
  AuditEntry,
  AuthTokens,
  BaselineRevision,
  Certificate,
  ChainStep,
  DesignPackage,
  DesignRequirement,
  DocumentGroup,
  DraftReview,
  FundingRoute,
  GateRow,
  Grievance,
  Incident,
  InvitePreview,
  Lot,
  MapCounters,
  MapProjectsResponse,
  Me,
  NewObligation,
  NewUser,
  NotificationLogEntry,
  NotificationPreferences,
  Obligation,
  Organisation,
  OrganisationType,
  OtpVerifyResult,
  Parcel,
  PeopleView,
  PortfolioRow,
  PracticalCompletion,
  ProgressSummary,
  ProjectBasics,
  ProjectCard,
  ReminderRule,
  Report,
  ReturnReason,
  Setting,
  SignedMedia,
  SiteSection,
  Station,
  StripMap,
  Submission,
  TaskAction,
  TaskDetail,
  TaskInbox,
  TaskSubject,
  UploadedDocument,
  UserOption,
  Variation,
} from './types';

// Map an API response onto the screen shape; in sample-data mode the response already is the screen shape.
function viaApi<A, W>(request: Promise<unknown>, map: (a: A) => W | Promise<W>): Promise<W> {
  return MOCK ? (request as Promise<W>) : request.then((a) => map(a as A));
}
// A request body in the screen's words for the mock, in the API's for the API.
const body = <W, A>(screen: W, apiBody: A) => (MOCK ? screen : apiBody);

const ROUTE_TO_API: Record<FundingRoute, ApiFundingRoute> = { loan: 'external_loan', budget: 'budget', ppp: 'ppp', state_private: 'state_private' };
const routeFromApi = (r: ApiFundingRoute): FundingRoute => (r === 'external_loan' ? 'loan' : r);
const ORIGIN_TO_API: Record<ProjectBasics['originKind'], NonNullable<ApiBody<'CreateProjectDto'>['originReference']>> = {
  master_plan: 'master_plan',
  presidential_directive: 'directive',
  state_request: 'state_request',
  unsolicited_proposal: 'unsolicited_proposal',
};
const originFromApi = (o: string | null): ProjectBasics['originKind'] => (o === 'directive' ? 'presidential_directive' : ((o ?? 'master_plan') as ProjectBasics['originKind']));

// Task titles for the inbox and the task screen.
const TASK_TITLE: Record<string, string> = {
  publish_project: 'Publish project',
  confirm_gate: 'Confirm gate',
  upload_document: 'Upload document',
  confirm_account: 'Confirm new account',
  unlock_account: 'Unlock account',
  confirm_membership: 'Confirm member',
  confirm_lot: 'Confirm lot',
  sign_off_section: 'Sign off site section',
  review_queue: 'Review queue',
  recommend_certificate: 'Recommend payment certificate',
  certify_certificate: 'Certify payment certificate',
  approve_certificate: 'Approve payment certificate',
  final_approve_certificate: 'Final approval of payment certificate',
  mark_paid: 'Mark payment certificate paid',
  review_design_package: 'Review design package',
  approve_design_package: 'Approve design package',
  countersign_design_package: 'Countersign design package',
  assess_claim: 'Assess claim',
  recommend_variation: 'Recommend claim',
  approve_variation: 'Approve claim',
  attach_variation_evidence: 'Attach BPP and FEC evidence',
  confirm_variation: 'Confirm claim',
  revise_submission: 'Revise and resubmit',
  approve_baseline_revision: 'Approve baseline revision',
  confirm_practical_completion: 'Confirm practical completion',
  confirm_takeover: 'Confirm takeover',
};
const taskTitle = (type: string) => TASK_TITLE[type] ?? type.charAt(0).toUpperCase() + type.slice(1).replaceAll('_', ' ');
const words = (s: string) => s.replaceAll('_', ' ');
const km = (m: number) => `km ${Math.floor(m / 1000)}+${String(m % 1000).padStart(3, '0')}`;

/* Sign-in */

export const requestCode = (phone: string) => api<void>('/auth/otp/request', { method: 'POST', body: { phone }, noRefresh: true });

export const verifyCode = (phone: string, code: string) =>
  api<OtpVerifyResult>('/auth/otp/verify', { method: 'POST', body: { phone, code, deviceId: getDeviceId() }, noRefresh: true });

export async function signInWithPin(phone: string, pin: string, ticket?: string): Promise<void> {
  const tokens = await api<AuthTokens>('/auth/pin/login', { method: 'POST', body: { phone, pin, deviceId: getDeviceId(), ticket }, noRefresh: true });
  setAccessToken(tokens.accessToken);
}

export async function setPin(phone: string, ticket: string, pin: string): Promise<void> {
  const tokens = await api<AuthTokens>('/auth/pin/set', { method: 'POST', body: { phone, ticket, pin, deviceId: getDeviceId() }, noRefresh: true });
  setAccessToken(tokens.accessToken);
}

export async function signOut(): Promise<void> {
  try {
    await api<void>('/auth/logout', { method: 'POST', noRefresh: true });
  } finally {
    setAccessToken(null);
  }
}

export const getMe = () =>
  viaApi<ApiMe, Me>(api('/me'), (m) => ({ id: m.user.id, name: m.user.name, phone: m.user.phone, role: m.role.code, organisation: m.organisation, permissions: m.permissions }));

// The PIN action each task screen asks for, keyed by the subject the confirmation names (filled by getTask).
const pinActions = new Map<string, string>();

/** Ask for a single-use PIN confirmation bound to one action on one record. */
export const confirmPin = (pin: string, action: string, subjectId: string) =>
  viaApi<{ confirmationToken: string }, { token: string }>(
    api('/auth/pin/confirm', { method: 'POST', body: { pin, action: action.includes('.') ? action : (pinActions.get(subjectId) ?? action), subjectId } }),
    (r) => ({ token: r.confirmationToken }),
  );

/* Invites */

export const getInvite = (token: string) => api<InvitePreview>(`/invites/${encodeURIComponent(token)}`, { noRefresh: true });
export const sendInviteCode = (token: string) => api<void>('/invites/code', { method: 'POST', body: { token }, noRefresh: true });

export async function acceptInvite(token: string, code: string, pin: string): Promise<void> {
  const tokens = await api<AuthTokens>('/invites/accept', { method: 'POST', body: { token, code, pin, deviceId: getDeviceId() }, noRefresh: true });
  setAccessToken(tokens.accessToken);
}

/* Map home */

export const getMapProjects = () =>
  viaApi<{ type: 'FeatureCollection'; features: ApiMapFeature[] }, MapProjectsResponse>(api('/map/projects'), (fc) => ({
    type: 'FeatureCollection',
    features: fc.features.map((f) => ({
      type: 'Feature',
      geometry: f.geometry,
      properties: { id: f.properties.id, name: f.properties.name, status: f.properties.status, health: f.properties.health, currentGate: f.properties.currentGate?.gateNo ?? null, daysAtGate: f.properties.daysAtGate },
    })),
  }));

export const getMapCounters = () => api<MapCounters>('/map/counters');

export const getProjectCard = (id: string) =>
  viaApi<ApiCard, ProjectCard>(api(`/projects/${id}/card`), (c) => {
    if (c.kind === 'lot') {
      // A contractor sees their own lot: the card shows the first of their lots.
      const lot = c.lots[0];
      return {
        id: c.project.id,
        name: lot ? `${c.project.name}, ${lot.name}` : c.project.name,
        type: '',
        lengthM: null,
        states: [],
        status: c.project.status,
        health: null,
        currentGate: null,
        daysAtGate: null,
        disciplines: (lot?.disciplines ?? []).map((d) => ({ name: d.label, percent: d.percent })),
        physicalPercent: lot?.physicalPercent ?? null,
        financialPercent: null,
        latestPhoto: lot?.latestVerifiedPhotoId ? { mediaId: lot.latestVerifiedPhotoId, chainageM: null, capturedAt: null, verifiedBy: null } : null,
        personInCharge: null,
        blockers: (lot?.openIssues ?? []).map((i) => ({ text: i.text })),
      };
    }
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      lengthM: c.lengthM,
      states: c.states,
      status: c.status,
      health: c.health,
      currentGate: c.currentGate ? { no: c.currentGate.gateNo, name: c.currentGate.name } : null,
      daysAtGate: c.daysAtGate,
      disciplines: c.disciplines.map((d) => ({ name: d.label, percent: d.percent })),
      physicalPercent: c.physicalPercent,
      financialPercent: c.financialPercent,
      latestPhoto: c.latestPhoto,
      personInCharge: c.personInCharge ? { ...c.personInCharge, role: 'ministry_project_manager' } : null,
      blockers: c.blockers.map((b) => ({ text: b.text })),
    };
  });

export const getMediaUrl = (mediaId: string, size: 'thumb' | 'web' | 'original' = 'web') => api<SignedMedia>(`/media/${mediaId}?size=${size}`);

/* Tasks */

export const getTasks = () =>
  viaApi<ApiInbox, TaskInbox>(api('/tasks'), (inbox) => ({
    doneToday: inbox.doneToday,
    groups: inbox.groups.map((g) => ({
      project: g.project,
      tasks: g.tasks.map((t) => ({ id: t.id, type: t.type, title: taskTitle(t.type), reason: t.reason, createdAt: t.createdAt, dueAt: t.dueAt, overdue: t.overdue })),
    })),
  }));

/* Project view */

const p = (id: string, rest: string) => `/projects/${encodeURIComponent(id)}${rest}`;

export const getGates = (id: string) =>
  viaApi<ApiGateRow[], GateRow[]>(api(p(id, '/gates')), (rows) =>
    rows.map((g) => ({
      no: g.gateNo,
      name: g.name,
      kind: g.kind,
      approverRole: g.approverRole,
      status: g.status as GateRow['status'],
      enteredAt: g.enteredAt,
      passedAt: g.passedAt,
      daysWaiting: g.daysWaiting,
      evidence: g.evidence.map((e) => ({ documentId: e.documentId, code: e.code, title: e.title })),
      uploadedBy: g.uploadedBy,
      confirmedBy: g.confirmedBy,
    })),
  );

export const getStripMap = (id: string) =>
  viaApi<ApiStripMap, StripMap>(api(p(id, '/strip-map')), (s) => ({
    lengthM: s.project.lengthM ?? Math.max(0, ...s.lots.map((l) => l.chainageToM)),
    lots: s.lots.map((l) => ({ name: l.name, fromM: l.chainageFromM, toM: l.chainageToM })),
    // The strip draws the disciplines measured along the line; stations and structures are counted, not drawn.
    disciplines: s.disciplines
      .filter((d) => d.measure === 'linear')
      .map((d) => ({ code: d.code, name: d.label, segments: (d.segments ?? []).map((x) => ({ fromM: x.from, toM: x.to, state: x.state })) })),
    trackFrontM: s.trackFront.length ? Math.max(...s.trackFront.map((f) => f.chainageM)) : null,
  }));

export const getProgress = (id: string) =>
  viaApi<ApiProgress, ProgressSummary>(api(p(id, '/progress')), (pr) => {
    const planned = pr.lots.map((l) => l.plannedPercent).filter((x): x is number => x !== null);
    const behind = pr.lots.map((l) => l.weeksBehind).filter((x): x is number => x !== null);
    const actual = pr.project.physicalPercent ?? (pr.lots.length === 1 ? pr.lots[0]!.physicalPercent : null);
    return {
      physicalPercent: actual ?? 0,
      plannedPercent: planned.length ? Math.round((planned.reduce((a, b) => a + b, 0) / planned.length) * 10) / 10 : 0,
      financialPercent: pr.project.financialPercent,
      weeksBehind: behind.length ? Math.max(...behind) : 0,
      lots: pr.lots.map((l) => ({ id: l.id, name: l.name, disciplines: l.disciplines.map((d) => ({ name: d.label, planned: d.plannedPercent ?? 0, actual: d.percent ?? 0 })) })),
      trackKmByMonth: pr.trackLaidByMonth.map((m) => ({ month: m.month.slice(0, 7), planned: Math.round(m.plannedM / 100) / 10, actual: Math.round(m.laidM / 100) / 10 })),
    };
  });

export const getCorridor = (id: string) =>
  viaApi<GeoJSON.FeatureCollection, GeoJSON.FeatureCollection>(api(p(id, '/corridor')), (fc) => ({
    ...fc,
    features: fc.features.map((f) => {
      const props = { ...(f.properties ?? {}) } as Record<string, unknown>;
      // Lots draw green when complete, orange otherwise; stations and halts draw as stations.
      if (props.kind === 'lot') props.state = Number(props.physicalPercent ?? 0) >= 100 ? 'complete' : 'in_progress';
      if (props.kind === 'asset' && (props.type === 'station' || props.type === 'halt')) props.kind = 'station';
      return { ...f, properties: props };
    }),
  }));

export const getLots = (id: string) => api<Lot[]>(p(id, '/lots'));

export const getSubmissions = (id: string, query = '') =>
  viaApi<ApiSubmission[], Submission[]>(api(`/field/projects/${encodeURIComponent(id)}/submissions${MOCK ? query : ''}`), (rows) => {
    // The API returns everything the person may see; the screens' filters are applied here.
    const want = new URLSearchParams(query);
    const status = (s: ApiSubmission): Submission['status'] => (s.status === 'verified' ? 'verified' : s.status === 'sent_back' ? 'sent_back' : 'pending_re');
    return rows
      .map((s) => ({
        id: s.id,
        kind: s.kind as Submission['kind'],
        status: status(s),
        flagged: s.flagged,
        chainageM: s.chainageM,
        capturedAt: s.capturedAt,
        submittedBy: s.submittedBy ?? 'Unknown',
        discipline: s.discipline,
        lotName: s.lotName ?? '',
        mediaId: s.mediaId,
        summary: s.summary,
        returnReason: s.returnReason,
      }))
      .filter((s) => (!want.get('kind') || s.kind === want.get('kind')) && (!want.get('status') || s.status === want.get('status')));
  });

const chainSteps = (chain: ApiChain | undefined): ChainStep[] =>
  (chain?.steps ?? []).map((s) => ({ step: s.label, role: s.role, actor: s.actedBy?.name ?? null, at: s.actedBy?.at ?? null, current: s.state === 'current' }));

const certificate = (c: ApiCertificate): Certificate => ({
  id: c.id,
  number: c.number,
  lotName: c.lot.name,
  period: c.periodMonth.slice(0, 7),
  grossKobo: c.amounts?.grossKobo ?? null,
  retentionKobo: c.amounts?.retentionKobo ?? null,
  advanceRecoveryKobo: c.amounts?.advanceRecoveryKobo ?? null,
  netKobo: c.amounts?.netKobo ?? null,
  status: c.status as Certificate['status'],
  chain: chainSteps(c.chain).map(({ current: _c, ...s }) => s),
});

export const getCertificates = (lotId: string) => viaApi<ApiCertificate[], Certificate[]>(api(`/lots/${encodeURIComponent(lotId)}/certificates`), (rows) => rows.map(certificate));

export const getDesignPackages = (lotId: string) =>
  viaApi<ApiDesignPackage[], DesignPackage[]>(api(`/lots/${encodeURIComponent(lotId)}/design-packages`), (rows) =>
    rows.map((d) => ({ id: d.id, title: d.title, discipline: d.discipline.label, lotName: d.lot.name, status: d.status as DesignPackage['status'], version: d.document.version, updatedAt: d.updatedAt })),
  );

export const getDocuments = (id: string) =>
  viaApi<{ gates: Array<{ gateNo: number; name: string; documents: Array<{ documentId: string; code: string; title: string; version: number; uploadedBy: string | null; uploadedAt: string }> }> }, DocumentGroup[]>(
    api(p(id, '/documents')),
    (r) =>
      r.gates.map((g) => ({
        gateNo: g.gateNo,
        gateName: g.name,
        documents: g.documents.map((d) => ({ id: d.documentId, code: d.code, title: d.title, version: d.version, uploadedBy: d.uploadedBy ?? 'FMoT Rail Tracker', uploadedAt: d.uploadedAt })),
      })),
  );

export const getParcels = (id: string) =>
  viaApi<Array<{ id: string; parcelRef: string; chainageFromM: number; chainageToM: number; ownerReference: string; valuationKobo: string | null; paidKobo: string | null; status: Parcel['status'] }>, Parcel[]>(
    api(p(id, '/parcels')),
    (rows) => rows.map((x) => ({ id: x.id, ref: x.parcelRef, fromM: x.chainageFromM, toM: x.chainageToM, owner: x.ownerReference, valuationKobo: x.valuationKobo, paidKobo: x.paidKobo, status: x.status })),
  );

export const getGrievances = (id: string) =>
  viaApi<Array<{ id: string; summary: string; chainageM: number | null; status: Grievance['status']; receivedAt: string }>, Grievance[]>(api(p(id, '/grievances')), (rows) =>
    rows.map((g) => ({ id: g.id, ref: `G-${g.id.slice(0, 6).toUpperCase()}`, summary: g.summary, chainageM: g.chainageM, status: g.status, openedAt: g.receivedAt })),
  );

export const getSections = (id: string) =>
  viaApi<Array<{ id: string; chainageFromM: number; chainageToM: number; status: SiteSection['status']; signedOffBy: string | null }>, SiteSection[]>(api(p(id, '/sections')), (rows) =>
    rows.map((s) => ({ id: s.id, fromM: s.chainageFromM, toM: s.chainageToM, status: s.status, signedOffBy: s.signedOffBy })),
  );

export const getIncidents = (id: string) =>
  viaApi<Array<{ id: string; type: string; chainageM: number | null; status: Incident['status']; reportedAt: string; description: string | null }>, Incident[]>(
    api(MOCK ? p(id, '/incidents') : `/incidents?projectId=${encodeURIComponent(id)}`),
    (rows) =>
      rows.map((i) => ({ id: i.id, type: i.type, chainageM: i.chainageM, status: i.status, reportedAt: i.reportedAt, summary: i.description ?? 'Details are for the security desk only.' })),
  );

export const getVariations = (id: string) =>
  viaApi<Array<{ id: string; type: Variation['type']; description: string; amountKobo: string | null; days: number | null; status: string; raisedBy: string; createdAt: string }>, Variation[]>(
    api(p(id, '/variations')),
    (rows) => rows.map((v) => ({ id: v.id, type: v.type, title: v.description, amountKobo: v.amountKobo, days: v.days, status: v.status, approved: v.status === 'approved', raisedBy: v.raisedBy, raisedAt: v.createdAt })),
  );

export const getPeople = (id: string) =>
  viaApi<
    {
      organisations: Array<{ organisation: { name: string }; members: Array<{ membershipId: string; name: string; role: string; phone: string; lot: { name: string } | null }> }>;
      responsibilityMatrix: Array<{ gateNo: number; name: string; uploaderRole: string | null; verifierRole: string | null; approverRole: string }>;
    },
    PeopleView
  >(api(p(id, '/people')), (r) => ({
    members: r.organisations.flatMap((o) => o.members.map((m) => ({ id: m.membershipId, name: m.name, role: m.role, organisation: o.organisation.name, phone: m.phone, lot: m.lot?.name ?? null }))),
    matrix: r.responsibilityMatrix.map((g) => ({ gateNo: g.gateNo, gateName: g.name, uploader: g.uploaderRole, verifier: g.verifierRole, approver: g.approverRole })),
  }));

// The audit trail in one plain line per entry.
const activityLine = (action: string, after: Record<string, unknown> | null) => {
  const detail = after && typeof after === 'object' ? (after.reason ?? after.name ?? after.title ?? (after.gateNo ? `gate ${String(after.gateNo)}` : null)) : null;
  const what = words(action.replace(/^workflow\./, '').replace('.', ': '));
  return detail ? `${what} (${String(detail)})` : what;
};

export const getActivity = (id: string) =>
  viaApi<{ items: Array<{ id: string; at: string; action: string; actor: { name: string | null } | null; after: Record<string, unknown> | null }> }, ActivityItem[]>(api(p(id, '/activity')), (r) =>
    r.items.map((i) => ({ id: i.id, at: i.at, actor: i.actor?.name ?? 'System', action: i.action, summary: activityLine(i.action, i.after) })),
  );

export const getDocumentUrl = (documentId: string) => api<SignedMedia>(`/documents/${encodeURIComponent(documentId)}/download`);

/* Create-project wizard */

// The basics as the API takes them; the placeholder line is drawn between the two towns when both are known.
const basicsBody = (b: ProjectBasics) => {
  const from = TOWNS[b.startTown];
  const to = TOWNS[b.endTown];
  // Every request body below is checked against the API's DTO (ApiBody, generated from its OpenAPI document).
  return {
    name: b.name,
    type: b.type,
    gauge: b.gauge,
    startTown: b.startTown,
    endTown: b.endTown,
    originReference: ORIGIN_TO_API[b.originKind],
    originDetail: b.originReference || undefined,
    placeholder: from && to ? { from: { lon: from[0], lat: from[1] }, to: { lon: to[0], lat: to[1] } } : undefined,
  } satisfies ApiBody<'CreateProjectDto'>;
};

export const createProject = (basics: ProjectBasics) => api<{ id: string }>('/projects', { method: 'POST', body: body(basics, basicsBody(basics)) });
export const updateBasics = (id: string, basics: ProjectBasics) => {
  const { placeholder: _p, ...rest } = basicsBody(basics);
  return api<void>(p(id, ''), { method: 'PUT', body: body(basics, rest satisfies ApiBody<'UpdateBasicsDto'>) });
};
export const setFundingRoute = (id: string, route: FundingRoute) => api<void>(p(id, '/funding-route'), { method: 'PUT', body: body({ route }, { fundingRoute: ROUTE_TO_API[route] } satisfies ApiBody<'FundingRouteDto'>) });

export const uploadAlignment = (id: string, file: File) =>
  viaApi<{ alignment: AlignmentResult['geometry']; lengthM: number; states: string[] }, AlignmentResult>(upload(p(id, '/alignment'), {}, file), (r) => ({ lengthM: r.lengthM, states: r.states, geometry: r.alignment }));

export const addStation = (id: string, name: string, chainageM: number) => api<Station>(p(id, '/stations'), { method: 'POST', body: { name, chainageM } satisfies ApiBody<'StationDto'> });
export const removeStation = (id: string, stationId: string) => api<void>(p(id, `/stations/${stationId}`), { method: 'DELETE' });
export const findUsers = (role: string) => api<UserOption[]>(`/users?role=${encodeURIComponent(role)}`);
export const addMember = (id: string, userId: string, role: RoleCode) =>
  api<void>(p(id, '/members'), { method: 'POST', body: body({ userId, role }, { userId, projectRole: role } satisfies ApiBody<'AddMemberDto'>) });

export const uploadDocument = (id: string, code: string, gateNo: number, title: string, file: File) =>
  viaApi<{ documentId: string; code: string; version: number }, UploadedDocument>(
    upload(p(id, '/documents'), MOCK ? { code, gateNo: String(gateNo), title } : { typeCode: code, gateNo: String(gateNo), title }, file),
    (r) => ({ id: r.documentId, code: r.code, title, version: r.version }),
  );

// Gate 1's date travels with "Send for publishing" on the API; the wizard enters it a step earlier, so it is kept
// for the session until then.
const gate1Date = (id: string, date?: string) => {
  const key = `fmot.gate1.${id}`;
  try {
    if (date) sessionStorage.setItem(key, date);
    return sessionStorage.getItem(key);
  } catch {
    return date ?? null;
  }
};

export const attachGateEvidence = (id: string, gateNo: number, documentIds: string[], date: string) => {
  if (!MOCK && gateNo === 1) {
    // D01 and D02 are already on gate 1 from their upload; the Director confirms gate 1 by publishing.
    gate1Date(id, date);
    return Promise.resolve();
  }
  return api<void>(p(id, `/gates/${gateNo}/evidence`), { method: 'POST', body: body({ documentIds, effectiveDate: date }, { documentIds, decisionDate: date } satisfies ApiBody<'GateEvidenceDto'>) });
};

export const getReview = (id: string) =>
  viaApi<ApiReview, DraftReview>(api(p(id, '/review')), (r) => ({
    id: r.basics.id,
    status: r.basics.status,
    locked: !!r.basics.sentForPublishingAt,
    basics: {
      name: r.basics.name,
      type: r.basics.type as ProjectBasics['type'],
      gauge: r.basics.gauge as ProjectBasics['gauge'],
      startTown: r.basics.startTown,
      endTown: r.basics.endTown,
      originKind: originFromApi(r.basics.originReference),
      originReference: r.basics.originDetail ?? '',
    },
    fundingRoute: r.fundingRoute ? routeFromApi(r.fundingRoute.route) : null,
    alignment: r.geography.alignment && !r.geography.isPlaceholder ? { lengthM: r.geography.lengthM ?? 0, states: r.geography.states, geometry: r.geography.alignment } : null,
    stations: r.geography.stations.map((s) => ({ id: s.id, name: s.name, chainageM: s.chainageM })),
    members: r.people.members.map((m) => ({ name: m.name, role: m.projectRole, organisation: m.organisation, confirmed: m.confirmed })),
    documents: r.documents.map((d) => ({ id: d.documentId, code: d.code, title: d.title, version: d.version })),
    gate1PassedOn: r.basics.gate1DecisionDate ?? gate1Date(r.basics.id),
    returnReason: r.basics.returnReason,
  }));

export const sendForPublishing = (id: string) =>
  api<void>(p(id, '/send-for-publishing'), { method: 'POST', body: MOCK ? undefined : ({ gate1DecisionDate: gate1Date(id) ?? new Date().toISOString().slice(0, 10) } satisfies ApiBody<'SendForPublishingDto'>) });

/* Task views */

// The task screen's subject panel, from the API's description of the item.
async function taskSubject(t: ApiTaskDetail): Promise<TaskSubject> {
  const s = (t.subject ?? {}) as Record<string, unknown>;
  const generic = (heading: string, lines: Array<[string, unknown]>, link: { href: string; label: string } | null = null): TaskSubject => ({
    kind: 'generic',
    heading,
    lines: lines.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([label, v]) => ({ label, value: String(v) })),
    link,
  });
  switch (t.type) {
    case 'publish_project':
      return { kind: 'publish', review: await getReview(String(s.projectId ?? t.projectId)) };
    case 'confirm_gate': {
      const first = t.documents?.[0];
      return { kind: 'gate', gateNo: Number(s.gateNo), gateName: String(s.name), effectiveDate: (s.decisionDate as string | null) ?? null, uploadedBy: first?.uploadedBy ?? '', uploadedAt: first?.uploadedAt ?? t.createdAt };
    }
    case 'upload_document':
      return { kind: 'document_upload', code: ((s.requiredDocumentCodes as string[] | undefined) ?? [])[0] ?? '', title: String(s.name ?? 'Gate evidence'), gateNo: Number(s.gateNo), gateName: String(s.name ?? '') };
    case 'recommend_certificate':
    case 'certify_certificate':
    case 'approve_certificate':
    case 'final_approve_certificate':
    case 'mark_paid': {
      const c = s as unknown as ApiCertificate;
      return {
        kind: 'certificate',
        number: c.number,
        lotName: c.lot.name,
        period: c.periodMonth.slice(0, 7),
        grossKobo: c.amounts?.grossKobo ?? null,
        retentionKobo: c.amounts?.retentionKobo ?? null,
        advanceRecoveryKobo: c.amounts?.advanceRecoveryKobo ?? null,
        netKobo: c.amounts?.netKobo ?? null,
        verifiedPhotos: 0,
        measurement: (c.valuation?.quantities ?? []).map((q) => ({ discipline: q.discipline, done: `${q.quantity} ${q.unit} ${q.item}` })),
      };
    }
    case 'review_design_package':
    case 'approve_design_package':
    case 'countersign_design_package': {
      const d = s as unknown as ApiDesignPackage;
      return {
        kind: 'design',
        title: d.title,
        discipline: d.discipline.label,
        lotName: d.lot.name,
        version: d.document.version,
        comments: (d.reviews ?? []).filter((r) => r.comment).map((r) => ({ by: r.by, text: r.comment! })),
      };
    }
    case 'assess_claim':
    case 'recommend_variation':
    case 'approve_variation':
    case 'attach_variation_evidence':
    case 'confirm_variation':
      return {
        kind: 'variation',
        type: s.type as 'variation' | 'extension_of_time',
        title: String(s.description ?? ''),
        amountKobo: (s.amountKobo as string | null) ?? null,
        days: (s.days as number | null) ?? null,
        assessment: null,
        recommendation: null,
        aboveThreshold: s.path === 'above_threshold',
      };
    case 'confirm_account':
      return { kind: 'account', name: String(s.name), phone: String(s.phone), organisation: String(s.organisation), organisationType: '', role: String(s.role), lots: [], requestedBy: '' };
    case 'confirm_lot':
      return generic(String(s.name ?? 'Lot'), [['Contract', s.contractRef], ['Stretch', s.chainageFromM !== undefined ? `${km(Number(s.chainageFromM))} to ${km(Number(s.chainageToM))}` : null]]);
    case 'confirm_membership':
      return generic(String(s.name ?? 'New member'), [['Role', s.role ? roleLabel(String(s.role)) : null]]);
    case 'sign_off_section':
      return generic(t.reason ?? 'Site section', [['Stretch', s.chainageFromM !== undefined ? `${km(Number(s.chainageFromM))} to ${km(Number(s.chainageToM))}` : null], ['Note', s.note]]);
    case 'approve_baseline_revision':
      return generic(t.reason ?? 'Baseline revision', [['Lot', s.lot], ['Revision', s.revision], ['Reason', s.reason]]);
    case 'confirm_practical_completion':
      return generic(t.reason ?? 'Practical completion', [['Lot', s.name], ['Date', s.date]]);
    case 'review_queue':
      return generic(t.reason ?? 'Review queue', [], t.projectId ? { href: `/projects/${t.projectId}/photos`, label: 'Open the photos and reports to verify them' } : null);
    default:
      return generic(t.reason ?? taskTitle(t.type), []);
  }
}

// The buttons: the step's own action (with its label, PIN and documents), Return, or Resubmit after a return.
function taskActions(t: ApiTaskDetail): TaskAction[] {
  const step = t.step;
  return (t.actions ?? []).map((verb) => {
    if (verb === 'return') return { action: 'return', label: 'Return', kind: 'return', needsPin: false, needsReason: true };
    if (verb === 'resubmit') return { action: 'resubmit', label: 'Resubmit', kind: 'primary', needsPin: false, needsReason: false };
    const docs = step?.documents;
    const code = Array.isArray(docs) ? docs[0] : null;
    return {
      action: verb,
      label: step?.label ?? taskTitle(verb),
      kind: 'primary',
      needsPin: !!t.pin,
      needsReason: false,
      needsFile: code ? { code, title: code === 'D24' ? 'Payment advice' : code } : null,
    };
  });
}

export const getTask = (id: string) =>
  viaApi<ApiTaskDetail, TaskDetail>(api(`/tasks/${encodeURIComponent(id)}`), async (t) => {
    const subject = await taskSubject(t);
    if (t.pin) pinActions.set(t.pin.subjectId, t.pin.action);
    const overdue = !!t.dueAt && new Date(t.dueAt).getTime() < Date.now();
    const actions =
      t.type === 'upload_document' && subject.kind === 'document_upload' && !t.actions?.length
        ? [{ action: 'submit', label: 'Submit', kind: 'primary' as const, needsPin: false, needsReason: false, needsFile: { code: subject.code, title: subject.title }, needsDate: true }]
        : taskActions(t);
    return {
      id: t.id,
      type: t.type,
      title: t.title ?? taskTitle(t.type),
      reason: t.reason ?? '',
      createdAt: t.createdAt,
      dueAt: t.dueAt,
      overdue,
      project: t.project,
      subjectId: t.pin?.subjectId ?? ((t.subject as { id?: string } | null)?.id ?? t.id),
      actions,
      blockedReason: actions.length ? null : (t.cannotAct ?? 'Nothing to do here: open the item from its project.'),
      chain: chainSteps(t.chain),
      documents: (t.documents ?? []).map((d) => ({ id: d.documentId ?? d.id ?? '', code: d.code, title: d.title, version: d.version })),
      subject,
    };
  });

export const getReturnReasons = () => api<ReturnReason[]>('/reference/return-reasons');

export interface ActInput {
  action: string;
  returnReasonId?: string;
  comment?: string;
  documentId?: string;
  effectiveDate?: string;
}

export async function actOnTask(id: string, input: ActInput, pinConfirmation?: string): Promise<void> {
  if (MOCK) return api<void>(`/tasks/${encodeURIComponent(id)}/act`, { method: 'POST', body: input, pinConfirmation });
  if (input.action === 'submit') {
    // A returned gate goes back through its evidence: the new document with the decision date.
    const task = await getTask(id);
    if (task.subject.kind !== 'document_upload' || !task.project) throw new Error('This task cannot be submitted here');
    return api<void>(p(task.project.id, `/gates/${task.subject.gateNo}/evidence`), {
      method: 'POST',
      body: { documentIds: input.documentId ? [input.documentId] : [], decisionDate: input.effectiveDate ?? '' } satisfies ApiBody<'GateEvidenceDto'>,
    });
  }
  return api<void>(`/tasks/${encodeURIComponent(id)}/act`, {
    method: 'POST',
    body: { action: input.action as ApiBody<'ActDto'>['action'], returnReasonCode: input.returnReasonId, comment: input.comment, documentIds: input.documentId ? [input.documentId] : undefined } satisfies ApiBody<'ActDto'>,
    pinConfirmation,
  });
}

/** For upload and mark-paid tasks: send the file first, then act with its id. */
export const uploadTaskDocument = (projectId: string, code: string, gateNo: number, title: string, file: File) => uploadDocument(projectId, code, gateNo, title, file);

/* Admin */

export const getOrganisations = () => api<Organisation[]>('/admin/organisations');
export const createOrganisation = (o: { name: string; type: OrganisationType; contactName: string; contactPhone: string }) => api<Organisation>('/admin/organisations', { method: 'POST', body: o satisfies ApiBody<'OrganisationDto'> });
export const getAdminUsers = (search = '') => api<AdminUser[]>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const createUser = (u: NewUser) =>
  api<AdminUser>('/admin/users', {
    method: 'POST',
    body: body(u, { ...u, role: u.role as RoleCode, memberships: u.memberships.map((m) => ({ projectId: m.projectId, lotId: m.lotId ?? undefined })) } satisfies ApiBody<'CreateUserDto'>),
  });
export const resendInvite = (id: string) => api<void>(`/admin/users/${id}/resend-invite`, { method: 'POST' });
export const resetPin = (id: string) => api<void>(`/admin/users/${id}/reset-pin`, { method: 'POST' });
export const deactivateUser = (id: string, replacementUserId: string | null) =>
  api<void>(`/admin/users/${id}/deactivate`, { method: 'POST', body: body({ replacementUserId }, (replacementUserId ? { replacementUserId } : {}) satisfies ApiBody<'DeactivateUserDto'>) });
export const getProjectsForPicker = () => api<Array<{ id: string; name: string; lots: Array<{ id: string; name: string }> }>>('/admin/projects');

// Money settings are kept in kobo; the settings screen shows and takes whole naira.
const isKobo = (key: string) => key.endsWith('_kobo');
const SETTING_UNIT: Record<string, string> = { 'variation.director_limit_days': 'days' };
export const getSettings = () =>
  viaApi<Array<{ key: string; value: string | number | boolean; description: string; confirmedByMinistry: boolean }>, Setting[]>(api('/admin/settings'), (rows) =>
    rows.map((s) => ({
      key: s.key,
      label: s.description,
      value: isKobo(s.key) ? String(BigInt(String(s.value)) / 100n) : String(s.value),
      unit: isKobo(s.key) ? 'naira' : (SETTING_UNIT[s.key] ?? null),
      confirmedByMinistry: s.confirmedByMinistry,
    })),
  );
export const updateSetting = (key: string, value: string) =>
  api<void>(`/admin/settings/${encodeURIComponent(key)}`, { method: 'PUT', body: { value: !MOCK && isKobo(key) ? String(BigInt(value) * 100n) : value } });

const RULE_UNIT: Record<string, string> = {
  no_photo_by_hour: 'hour of the day',
  daily_report_due: 'hour of the day',
  review_queue_age: 'hours',
  certificate_age: 'hours',
  document_expiry: 'hours',
  gate_waiting: '',
  task_due: '',
  weekly_digest: 'hour on Monday',
};
export const getReminderRules = () =>
  viaApi<Array<{ code: string; kind: string; name: string; threshold: number }>, ReminderRule[]>(api('/admin/reminder-rules'), (rows) =>
    rows.map((r) => ({
      key: r.code,
      label: r.name,
      value: r.threshold,
      unit: r.code.startsWith('due.') ? 'hours' : r.kind === 'task_due' ? 'times the due time' : r.code === 'health.behind_factor' ? 'times the gate reminder days' : r.code === 'health.stalled_days' ? 'days' : (RULE_UNIT[r.kind] ?? ''),
    })),
  );
export const updateReminderRule = (key: string, value: number) =>
  api<void>(`/admin/reminder-rules/${encodeURIComponent(key)}`, { method: 'PUT', body: body({ value }, { threshold: value } satisfies ApiBody<'ReminderRuleDto'>) });

export const getAuditLog = (query = '') => api<AuditEntry[]>(`/admin/audit${query}`);
export const getNotificationLog = () =>
  viaApi<{ items: Array<{ id: string; createdAt: string; to: { name: string; phone: string }; template: string; status: string; deliveryStatus: string | null }> }, NotificationLogEntry[]>(
    api('/admin/notifications'),
    (r) =>
      r.items.map((n) => ({
        id: n.id,
        at: n.createdAt,
        to: `${n.to.name} (${n.to.phone})`,
        channel: 'sms',
        template: n.template,
        status: n.deliveryStatus && /deliver/i.test(n.deliveryStatus) ? 'delivered' : n.status === 'merged' ? 'sent' : n.status === 'cancelled' ? 'failed' : (n.status as NotificationLogEntry['status']),
      })),
  );

/* Portfolio, reports, notification settings */

export const getPortfolio = () =>
  viaApi<
    Array<{
      id: string;
      name: string;
      status: PortfolioRow['status'];
      health: PortfolioRow['health'];
      currentGate: { gateNo: number; name: string } | null;
      daysAtGate: number | null;
      physicalPercent: number | null;
      financialPercent: number | null;
      nextMilestone: { name: string; plannedDate: string | null } | null;
      states: string[];
      contractor: string | null;
    }>,
    PortfolioRow[]
  >(api('/portfolio'), (rows) =>
    rows.map((r) => ({
      ...r,
      currentGate: r.currentGate ? { no: r.currentGate.gateNo, name: r.currentGate.name } : null,
      nextMilestone: r.nextMilestone ? { name: r.nextMilestone.name, dueOn: r.nextMilestone.plannedDate } : null,
    })),
  );

const report = (r: ApiReport): Report => ({
  id: r.id,
  kind: r.kind,
  period: r.periodMonth,
  format: r.format,
  status: r.status === 'done' ? 'ready' : r.status === 'running' ? 'generating' : r.status,
  version: r.variant,
  createdAt: r.createdAt,
  requestedBy: r.scheduled ? null : (r.requestedBy ?? 'You'),
});

export const getProjectReports = (id: string) => viaApi<ApiReport[], Report[]>(api(p(id, '/reports')), (rows) => rows.map(report));
export const generateProjectReport = (id: string, kind: 'monthly' | 'lender', period: string) =>
  viaApi<ApiReport, Report>(api(p(id, '/reports'), { method: 'POST', body: body({ kind, period }, { kind, periodMonth: period } satisfies ApiBody<'ProjectReportDto'>) }), report);
export const getPortfolioReports = () => viaApi<ApiReport[], Report[]>(api('/reports/portfolio'), (rows) => rows.map(report));
export const generatePortfolioReport = (format: 'pdf' | 'xlsx') => viaApi<ApiReport, Report>(api('/reports/portfolio', { method: 'POST', body: { format } satisfies ApiBody<'PortfolioReportDto'> }), report);
export const exportEyemark = () => viaApi<ApiReport, Report>(api('/reports/eyemark', { method: 'POST' }), report);
export const getReportFile = (reportId: string) => api<SignedMedia>(`/reports/${encodeURIComponent(reportId)}/file`);
export const getMyPreferences = () => api<NotificationPreferences>('/me/notification-preferences');
export const saveMyPreferences = (prefs: Omit<NotificationPreferences, 'digestEligible'>) => api<void>('/me/notification-preferences', { method: 'PUT', body: prefs satisfies ApiBody<'PreferencesDto'> });

const OBLIGATION_OWNER: Record<Obligation['kind'], string> = {
  performance_bond: 'Legal',
  advance_payment_guarantee: 'Legal',
  insurance: 'Legal',
  eia_condition: 'Project manager',
};
const obligation = (o: ApiObligation): Obligation => ({
  id: o.id,
  kind: o.kind,
  title: o.description ? `${o.reference}: ${o.description}` : o.reference,
  expiresOn: o.expiresOn,
  owner: OBLIGATION_OWNER[o.kind],
  documentCode: o.documentCode ?? null,
});
export const getObligations = (id: string) => viaApi<ApiObligation[], Obligation[]>(api(p(id, '/obligations')), (rows) => rows.map(obligation));
// The API has no owner field: who is reminded follows from the kind (legal officers, or the project manager for EIA conditions).
export const addObligation = (id: string, o: NewObligation) =>
  viaApi<ApiObligation, Obligation>(
    api(p(id, '/obligations'), {
      method: 'POST',
      body: {
        kind: o.kind,
        reference: o.reference,
        ...(o.description ? { description: o.description } : {}),
        expiresOn: o.expiresOn,
        ...(o.lotId ? { lotId: o.lotId } : {}),
        ...(o.documentId ? { documentId: o.documentId } : {}),
      } satisfies ApiBody<'ObligationDto'>,
    }),
    obligation,
  );

/* Gate 12 design requirements, the programme (baseline) and gate 13 practical completion, per lot. */

const lotPath = (lotId: string, rest: string) => `/lots/${encodeURIComponent(lotId)}${rest}`;
const designRequirement = (r: ApiDesignRequirement): DesignRequirement => ({
  disciplineCode: r.discipline,
  disciplineName: r.label,
  required: r.required,
  status: (r.designStatus ?? 'none') as DesignRequirement['status'],
});
export const getDesignRequirements = (lotId: string) =>
  viaApi<ApiDesignRequirement[], DesignRequirement[]>(api(lotPath(lotId, '/design-requirements')), (rows) => rows.map(designRequirement));
// The API takes every discipline with its flag; the mock only the ones required.
export const saveDesignRequirements = (lotId: string, disciplines: string[], required: string[]) =>
  api<unknown>(lotPath(lotId, '/design-requirements'), {
    method: 'PUT',
    body: body({ required }, { requirements: disciplines.map((discipline) => ({ discipline, required: required.includes(discipline) })) } satisfies ApiBody<'RequirementsDto'>),
  });

export const getBaselineRevisions = (lotId: string) =>
  viaApi<ApiBaselineRevision[], BaselineRevision[]>(api(lotPath(lotId, '/baseline/revisions')), (rows) =>
    rows.map((r) => ({ id: r.id, revision: r.revision, uploadedAt: r.uploadedAt, uploadedBy: r.uploadedBy, reason: r.reason, extensionOfTimeId: r.variationId, status: r.status })),
  );
// Multipart: file (CSV: discipline,month,planned_percent), reason (a revision), variationId (the approved extension of time).
export const uploadBaseline = (lotId: string, file: File, reason: string, extensionOfTimeId: string | null) =>
  upload<unknown>(lotPath(lotId, '/baseline'), { ...(reason ? { reason } : {}), ...(extensionOfTimeId ? { variationId: extensionOfTimeId } : {}) }, file);

const COMPLETION_STATUS: Record<ApiPracticalCompletion['status'], PracticalCompletion['status']> = {
  not_recorded: 'not_recorded',
  awaiting_confirmation: 'waiting_for_director',
  confirmed: 'confirmed',
};
export const getPracticalCompletion = (projectId: string, lotId: string) =>
  viaApi<ApiPracticalCompletion, PracticalCompletion>(api(p(projectId, `/lots/${encodeURIComponent(lotId)}/practical-completion`)), (r) => ({
    lotId: r.lotId,
    completedOn: r.date,
    recordedBy: r.recordedBy,
    status: COMPLETION_STATUS[r.status],
  }));
// PIN action completion.record, subject the lot.
export const recordPracticalCompletion = (projectId: string, lotId: string, completedOn: string, pinConfirmation: string) =>
  api<unknown>(p(projectId, `/lots/${encodeURIComponent(lotId)}/practical-completion`), {
    method: 'POST',
    body: body({ completedOn }, { date: completedOn } satisfies ApiBody<'PracticalCompletionDto'>),
    pinConfirmation,
  });
