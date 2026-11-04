/*
 * The shapes the screens work with. The API's own responses are mapped onto
 * these in endpoints.ts (and the sample data in mock*.ts is written in them).
 * Money is kobo; the API sends it as a string of digits (bigint), which
 * formatNaira accepts.
 * Types that are the same on both sides come from @fmot/shared (generated from
 * the API's OpenAPI document).
 */
import type { ApiBody, OrganisationType, RoleCode } from '@fmot/shared';

export type ProjectStatus =
  | 'draft'
  | 'identified'
  | 'funded'
  | 'contracted'
  | 'under_construction'
  | 'commissioned'
  | 'operational'
  | 'stalled'
  | 'closed';

export type Health = 'on_track' | 'behind' | 'stalled';

export interface Me {
  id: string;
  name: string;
  phone: string;
  role: string;
  organisation: { id: string; name: string; type: string };
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
}

export interface OtpVerifyResult {
  ticket: string;
  hasPin: boolean;
}

export interface InvitePreview {
  name: string;
  role: string;
  organisation: string;
  phoneMasked: string;
  /** Where the code goes: the person's chosen channel, and that phone or email address masked. */
  codeChannel?: 'sms' | 'email';
  codeSentTo?: string;
}

export interface MapProjectProperties {
  id: string;
  name: string;
  status: ProjectStatus;
  health: Health | null;
  currentGate: number | null;
  daysAtGate: number | null;
  /** For the filter chips (Web Step 9). */
  fundingRoute?: 'loan' | 'budget' | 'ppp' | 'state_private' | null;
  contractors?: string[];
  states?: string[];
}

export type MapLayerName = 'legacy-lines' | 'state-boundaries' | 'stations' | 'lots' | 'no-go';

export interface MapProjectsResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'LineString'; coordinates: [number, number][] };
    properties: MapProjectProperties;
  }>;
}

export interface MapCounters {
  onTrack: number;
  behind: number;
  stalled: number;
  drafts: number;
}

export interface ProjectCard {
  id: string;
  name: string;
  type: string;
  lengthM: number | null;
  states: string[];
  status: ProjectStatus;
  health: Health | null;
  currentGate: { no: number; name: string } | null;
  daysAtGate: number | null;
  disciplines: Array<{ name: string; percent: number }>;
  physicalPercent: number | null;
  financialPercent: number | null; // null without the financial permission
  latestPhoto: {
    mediaId: string;
    chainageM: number | null;
    capturedAt: string | null;
    verifiedBy: string | null;
  } | null;
  personInCharge: { name: string; role: string; phone: string } | null;
  blockers: Array<{ text: string }>;
}

export interface TaskSummary {
  id: string;
  type: string;
  title: string;
  reason: string;
  createdAt: string;
  dueAt: string | null;
  overdue: boolean;
}

export interface TaskInbox {
  groups: Array<{ project: { id: string; name: string } | null; tasks: TaskSummary[] }>;
  doneToday: number;
}

export interface SignedMedia {
  url: string;
}

/* ---------- Project view (Web Step 2) ---------- */

export type GateStatus = 'not_started' | 'in_progress' | 'awaiting_confirmation' | 'passed' | 'blocked';

export interface GateRow {
  no: number;
  name: string;
  kind: 'approve_in_system' | 'attach_evidence';
  approverRole: string;
  status: GateStatus;
  enteredAt: string | null;
  passedAt: string | null;
  daysWaiting: number | null;
  evidence: Array<{ documentId: string; code: string; title: string }>;
  uploadedBy: string | null;
  confirmedBy: string | null;
}

// rework: complete work taken back to in progress (with a reason).
export type SegmentState = 'complete' | 'in_progress' | 'rework';

export interface StripMap {
  lengthM: number;
  lots: Array<{ name: string; fromM: number; toM: number }>;
  disciplines: Array<{ code: string; name: string; segments: Array<{ fromM: number; toM: number; state: SegmentState }> }>;
  trackFrontM: number | null;
}

export interface ProgressSummary {
  physicalPercent: number;
  plannedPercent: number;
  financialPercent: number | null;
  weeksBehind: number;
  lots: Array<{
    id: string;
    name: string;
    disciplines: Array<{ name: string; planned: number; actual: number }>;
  }>;
  trackKmByMonth: Array<{ month: string; planned: number; actual: number }>;
}

export interface Lot {
  id: string;
  name: string;
  contractRef: string;
  contractor: string;
  consultant: string;
  chainageFromM: number;
  chainageToM: number;
  contractSumKobo: string | null;
}

export type SubmissionStatus = 'pending_re' | 'verified' | 'sent_back';

export interface Submission {
  id: string;
  kind: 'photo' | 'daily_report' | 'milestone_claim' | 'incident';
  status: SubmissionStatus;
  flagged: boolean;
  chainageM: number | null;
  capturedAt: string;
  submittedBy: string;
  discipline: string | null;
  lotName: string;
  mediaId: string | null;
  summary: string | null;
  returnReason: string | null;
}

export type CertificateStatus = 'draft' | 'recommended' | 'certified' | 'approved' | 'final_approved' | 'paid' | 'returned';

export interface Certificate {
  id: string;
  number: number;
  lotName: string;
  period: string;
  // Null without the financial permission.
  grossKobo: string | null;
  retentionKobo: string | null;
  advanceRecoveryKobo: string | null;
  netKobo: string | null;
  status: CertificateStatus;
  chain: Array<{ step: string; role: string; actor: string | null; at: string | null }>;
}

export interface DesignPackage {
  id: string;
  title: string;
  discipline: string;
  lotName: string;
  status: 'submitted' | 'under_review' | 'recommended' | 'approved' | 'approved_for_construction' | 'returned';
  version: number;
  updatedAt: string;
}

export interface DocumentGroup {
  gateNo: number | null;
  gateName: string;
  documents: Array<{ id: string; code: string; title: string; version: number; uploadedBy: string; uploadedAt: string }>;
}

export interface Parcel {
  id: string;
  ref: string;
  fromM: number;
  toM: number;
  owner: string;
  valuationKobo: string | null;
  paidKobo: string | null;
  status: 'unpaid' | 'disputed' | 'queried' | 'paid';
}

export interface Grievance {
  id: string;
  ref: string;
  summary: string;
  chainageM: number | null;
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  openedAt: string;
}

export interface SiteSection {
  id: string;
  fromM: number;
  toM: number;
  status: 'blocked' | 'available';
  signedOffBy: string | null;
}

export interface Incident {
  id: string;
  type: string;
  chainageM: number | null;
  status: 'open' | 'under_review' | 'closed';
  reportedAt: string;
  summary: string;
}

export interface Variation {
  id: string;
  type: 'variation' | 'extension_of_time';
  title: string;
  amountKobo: string | null;
  days: number | null;
  status: string;
  /** Approved, so a revised programme can name it. */
  approved: boolean;
  raisedBy: string;
  raisedAt: string;
}

export interface PeopleView {
  members: Array<{ id: string; name: string; role: string; organisation: string; phone: string; lot: string | null }>;
  matrix: Array<{ gateNo: number; gateName: string; uploader: string | null; verifier: string | null; approver: string }>;
}

export interface ActivityItem {
  id: string;
  at: string;
  actor: string;
  action: string;
  summary: string;
}

/* ---------- Create-project wizard (Web Step 3) ---------- */

export type FundingRoute = 'budget' | 'loan' | 'ppp' | 'state_private';
// From the API's OpenAPI document (@fmot/shared): the same values on both sides.
export type ProjectType = ApiBody<'CreateProjectDto'>['type'];

export interface ProjectBasics {
  name: string;
  type: ProjectType;
  gauge: ApiBody<'CreateProjectDto'>['gauge'];
  startTown: string;
  endTown: string;
  originKind: 'master_plan' | 'presidential_directive' | 'state_request' | 'unsolicited_proposal';
  originReference: string;
}

export interface AlignmentResult {
  lengthM: number;
  states: string[];
  geometry: { type: 'LineString'; coordinates: [number, number][] };
}

export interface Station {
  id: string;
  name: string;
  chainageM: number;
}

export interface UserOption {
  id: string;
  name: string;
  organisation: string;
}

export interface UploadedDocument {
  id: string;
  code: string;
  title: string;
  version: number;
}

export interface DraftReview {
  id: string;
  status: ProjectStatus;
  locked: boolean;
  basics: ProjectBasics | null;
  fundingRoute: FundingRoute | null;
  alignment: AlignmentResult | null;
  stations: Station[];
  members: Array<{ name: string; role: string; organisation: string; confirmed: boolean }>;
  documents: UploadedDocument[];
  gate1PassedOn: string | null;
  returnReason: string | null;
}

/* ---------- Task views (Web Step 5) ---------- */

export interface TaskAction {
  action: string; // verify, send_back, recommend, certify, approve, final_approve, countersign, confirm, publish, return, decline, mark_paid, submit
  label: string;
  kind: 'primary' | 'return';
  needsPin: boolean;
  needsReason: boolean;
  /** For upload tasks and mark paid: the document the action needs. */
  needsFile?: { code: string; title: string } | null;
  needsDate?: boolean;
}

export interface ChainStep {
  step: string;
  role: string;
  actor: string | null;
  at: string | null;
  current?: boolean;
}

export interface CheckResult {
  name: string;
  result: 'pass' | 'warn' | 'fail';
  detail: string;
}

export type TaskSubject =
  | {
      kind: 'photo';
      mediaId: string | null;
      chainageM: number | null;
      offsetM: number | null;
      corridorWidthM: number;
      lotName: string;
      lotFromM: number;
      lotToM: number;
      discipline: string | null;
      capturedAt: string;
      submittedBy: string;
      checks: CheckResult[];
      previousMediaId: string | null;
      summary: string | null;
    }
  | { kind: 'milestone'; name: string; chainageM: number; lotName: string; mediaIds: string[]; submittedBy: string; claimedAt: string }
  | { kind: 'gate'; gateNo: number; gateName: string; effectiveDate: string | null; uploadedBy: string; uploadedAt: string }
  | {
      kind: 'certificate';
      number: number;
      lotName: string;
      period: string;
      grossKobo: string | null;
      retentionKobo: string | null;
      advanceRecoveryKobo: string | null;
      netKobo: string | null;
      /** Verified photos behind the measurement; null when the API does not say. */
      verifiedPhotos: number | null;
      measurement: Array<{ discipline: string; done: string }>;
    }
  | { kind: 'design'; title: string; discipline: string; lotName: string; version: number; comments: Array<{ by: string; text: string }> }
  | { kind: 'variation'; type: 'variation' | 'extension_of_time'; title: string; amountKobo: string | null; days: number | null; assessment: string | null; recommendation: string | null; aboveThreshold: boolean }
  | { kind: 'document_upload'; code: string; title: string; gateNo: number; gateName: string }
  | { kind: 'account'; name: string; phone: string; organisation: string; organisationType: string; role: string; lots: string[]; requestedBy: string }
  | { kind: 'publish'; review: DraftReview }
  /** Any other decision (confirm a lot or member, sign off a section, a baseline revision, practical completion, takeover, the review queue). */
  | { kind: 'generic'; heading: string; lines: Array<{ label: string; value: string }>; link: { href: string; label: string } | null };

export interface TaskDetail extends TaskSummary {
  project: { id: string; name: string } | null;
  subjectId: string;
  actions: TaskAction[];
  /** Why this person cannot act, when they can see the task but not decide it. */
  blockedReason: string | null;
  chain: ChainStep[];
  documents: Array<{ id: string; code: string; title: string; version: number }>;
  subject: TaskSubject;
}

export interface ReturnReason {
  id: string;
  label: string;
}

/* ---------- Admin (Web Step 4) ---------- */

export type { OrganisationType };

export interface Organisation {
  id: string;
  name: string;
  type: OrganisationType;
  contactName: string | null;
  contactPhone: string | null;
  active: boolean;
  people: number;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  codeChannel?: 'sms' | 'email';
  organisation: { id: string; name: string; type: OrganisationType };
  role: string;
  status: 'invited' | 'active' | 'locked' | 'deactivated';
  lastLoginAt: string | null;
  lastUploadAt: string | null;
  openTasks: number;
  memberships: Array<{ project: string; lot: string | null }>;
  awaitingDirector: boolean;
}

export interface NewUser {
  name: string;
  phone: string;
  email: string;
  /** Where the invite and codes the system sends go. Signing in sends the code to what the person types. */
  codeChannel: 'sms' | 'email';
  organisationId: string;
  role: string; // '' until the form has a role; endpoints.ts sends it as the API's role code
  memberships: Array<{ projectId: string; lotId: string | null }>;
}

export interface Setting {
  key: string;
  label: string;
  value: string;
  unit: string | null;
  confirmedByMinistry: boolean;
}

export interface ReminderRule {
  key: string;
  label: string;
  value: number;
  unit: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  project: string | null;
}

export interface NotificationLogEntry {
  id: string;
  at: string;
  to: string;
  channel: 'sms' | 'push' | 'email';
  template: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
}

/* ---------- Portfolio, reports, notification settings (Web Step 6) ---------- */

export interface PortfolioRow {
  id: string;
  name: string;
  status: ProjectStatus;
  health: Health | null;
  currentGate: { no: number; name: string } | null;
  daysAtGate: number | null;
  physicalPercent: number | null;
  financialPercent: number | null; // null without the financial permission
  nextMilestone: { name: string; dueOn: string | null } | null;
  states: string[];
  contractor: string | null;
}

export type ReportKind = 'monthly' | 'lender' | 'portfolio' | 'eyemark';

export interface Report {
  id: string;
  kind: ReportKind;
  period: string | null; // YYYY-MM for monthly and lender reports
  format: 'pdf' | 'xlsx' | 'csv';
  status: 'queued' | 'generating' | 'ready' | 'failed';
  version: 'finance' | 'standard' | null;
  createdAt: string;
  requestedBy: string | null; // null for the reports made automatically on the 2nd
}

export interface NotificationPreferences {
  channel: 'sms' | 'push' | 'email';
  weeklyDigest: boolean;
  digestEligible: boolean;
  quietFrom: string | null; // "21:00"
  quietTo: string | null; // "07:00"
}

export interface Obligation {
  id: string;
  kind: 'performance_bond' | 'advance_payment_guarantee' | 'insurance' | 'eia_condition';
  title: string;
  expiresOn: string;
  owner: string;
  documentCode: string | null;
}

/* ---------- Design requirements, programme, practical completion, obligations (Web Step 7) ---------- */

/** One discipline of a lot for gate 12: whether its design must be approved for construction, and how far it has got. */
export interface DesignRequirement {
  disciplineCode: string;
  disciplineName: string;
  required: boolean;
  /** The best status among the lot's design packages for the discipline; none when there is no package. */
  status: 'none' | DesignPackage['status'];
}

/** One upload of a lot's programme. Revision 1 is the first programme and is used at once. */
export interface BaselineRevision {
  id: string;
  revision: number;
  uploadedAt: string;
  uploadedBy: string;
  reason: string | null;
  /** The approved extension of time behind a revision, if any. */
  extensionOfTimeId: string | null;
  status: 'pending' | 'approved' | 'returned' | 'superseded';
}

export interface PracticalCompletion {
  lotId: string;
  completedOn: string | null;
  recordedBy: string | null;
  status: 'not_recorded' | 'waiting_for_director' | 'confirmed';
}

export interface NewObligation {
  kind: Obligation['kind'];
  /** The bond, policy or certificate number. */
  reference: string;
  description: string;
  expiresOn: string;
  lotId: string | null;
  /** The bond, policy or certificate in the register. */
  documentId: string | null;
}

/* ---------- Valuations, lots, members, design packages (Web Step 8) ---------- */

/** The resident engineer's measurement of a lot for one month, shown before the contractor claims it. */
export interface ValuationPrefill {
  period: string;
  lines: Array<{ code: string; discipline: string; measured: string; unit: string; quantity: number }>;
  /** Verified field submissions the measurement rests on. */
  verifiedPhotos: number;
}

export interface OrganisationOption {
  id: string;
  name: string;
  type: OrganisationType;
}

export interface NewLot {
  name: string;
  contractRef: string;
  contractorOrgId: string;
  consultantOrgId: string;
  chainageFromM: number;
  chainageToM: number;
  /** Kobo as a string of digits. */
  contractSumKobo: string;
}

export interface NewMember {
  userId: string;
  role: RoleCode;
  lotId: string | null;
}
