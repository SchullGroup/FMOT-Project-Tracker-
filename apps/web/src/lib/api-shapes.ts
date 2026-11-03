/*
 * The API's own response shapes, as the web app reads them (apps/api; Swagger at /api/docs documents the requests).
 * endpoints.ts maps these onto the screen shapes in types.ts. Money is kobo as a string of digits.
 */
import type { FundingRoute, Health, ProjectStatus } from './types';

export type ApiFundingRoute = Exclude<FundingRoute, 'loan'> | 'external_loan';

export interface ApiMe {
  user: { id: string; name: string; phone: string };
  organisation: { id: string; name: string; type: string };
  role: { code: string; name: string };
  permissions: string[];
}

export interface ApiGateRef {
  gateNo: number;
  name: string;
  status: string;
}

export interface ApiMapFeature {
  type: 'Feature';
  id: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: { id: string; name: string; status: ProjectStatus; health: Health | null; currentGate: ApiGateRef | null; daysAtGate: number | null };
}

interface ApiCardCommon {
  disciplines: Array<{ code: string; label: string; percent: number }>;
  physicalPercent: number | null;
}

export type ApiCard =
  | (ApiCardCommon & {
      kind: 'project';
      id: string;
      name: string;
      type: string;
      status: ProjectStatus;
      lengthM: number | null;
      states: string[];
      currentGate: ApiGateRef | null;
      daysAtGate: number | null;
      health: Health | null;
      financialPercent: number | null;
      latestPhoto: { mediaId: string; chainageM: number | null; capturedAt: string | null; verifiedBy: string | null } | null;
      personInCharge: { name: string; phone: string } | null;
      blockers: Array<{ text: string }>;
    })
  | {
      kind: 'lot';
      project: { id: string; name: string; status: ProjectStatus };
      lots: Array<ApiCardCommon & { id: string; name: string; latestVerifiedPhotoId: string | null; openIssues: Array<{ text: string }> }>;
    };

export interface ApiInbox {
  doneToday: number;
  groups: Array<{ project: { id: string; name: string } | null; tasks: Array<{ id: string; type: string; createdAt: string; dueAt: string | null; overdue: boolean; reason: string }> }>;
}

export interface ApiChain {
  status: string;
  path: string | null;
  steps: Array<{ key: string; label: string; role: string; requiresPin: boolean; state: 'done' | 'current' | 'pending'; actedBy: { name: string; at: string } | null }>;
}

export interface ApiTaskDetail {
  id: string;
  type: string;
  status: string;
  projectId: string | null;
  project: { id: string; name: string } | null;
  createdAt: string;
  dueAt: string | null;
  reason: string | null;
  title?: string;
  subject: unknown;
  documents?: Array<{ documentId?: string; id?: string; code: string; title: string; version: number; uploadedBy?: string | null; uploadedAt?: string }>;
  chain?: ApiChain;
  step?: { key: string; label: string; documents: string[] | 'any' | null } | null;
  actions?: string[];
  cannotAct?: string | null;
  pin?: { action: string; subjectId: string } | null;
}

export interface ApiGateRow {
  gateNo: number;
  name: string;
  kind: 'approve_in_system' | 'attach_evidence';
  approverRole: string;
  status: string;
  enteredAt: string | null;
  decisionDate: string | null;
  passedAt: string | null;
  daysWaiting: number | null;
  evidence: Array<{ documentId: string; code: string; title: string }>;
  uploadedBy: string | null;
  confirmedBy: string | null;
}

export interface ApiStripMap {
  project: { lengthM: number | null };
  lots: Array<{ id: string; name: string; chainageFromM: number; chainageToM: number }>;
  disciplines: Array<{ code: string; label: string; measure: 'linear' | 'point'; segments?: Array<{ from: number; to: number; state: 'complete' | 'in_progress' | 'rework' }> }>;
  trackFront: Array<{ lotId: string; chainageM: number }>;
}

export interface ApiProgress {
  project: { physicalPercent: number | null; financialPercent: number | null };
  lots: Array<{
    id: string;
    name: string;
    physicalPercent: number | null;
    plannedPercent: number | null;
    weeksBehind: number | null;
    disciplines: Array<{ label: string; percent: number | null; plannedPercent: number | null }>;
  }>;
  trackLaidByMonth: Array<{ month: string; laidM: number; plannedM: number }>;
}

export interface ApiCertificate {
  id: string;
  number: number;
  periodMonth: string;
  status: string;
  lot: { id: string; name: string };
  amounts: { grossKobo: string; retentionKobo: string; advanceRecoveryKobo: string; netKobo: string } | null;
  valuation: { quantities: Array<{ discipline: string; item: string; unit: string; quantity: number }>; document: { documentId: string; code: string; title: string; version: number } } | null;
  chain?: ApiChain;
}

export interface ApiDesignPackage {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  discipline: { code: string; label: string };
  lot: { id: string; name: string };
  document: { documentId: string; code: string; title: string; version: number };
  reviews?: Array<{ decision: string; comment: string | null; by: string; at: string }>;
}

export interface ApiSubmission {
  id: string;
  kind: string;
  status: string;
  flagged: boolean;
  chainageM: number | null;
  capturedAt: string;
  submittedBy: string | null;
  lotName: string | null;
  discipline: string | null;
  mediaId: string | null;
  summary: string | null;
  returnReason: string | null;
}

export interface ApiReview {
  basics: {
    id: string;
    name: string;
    type: string;
    gauge: string;
    startTown: string;
    endTown: string;
    originReference: string | null;
    originDetail: string | null;
    status: ProjectStatus;
    sentForPublishingAt: string | null;
    gate1DecisionDate: string | null;
    returnReason: string | null;
  };
  fundingRoute: { route: ApiFundingRoute } | null;
  geography: { alignment: { type: 'LineString'; coordinates: [number, number][] } | null; isPlaceholder: boolean; lengthM: number | null; states: string[]; stations: Array<{ id: string; name: string; chainageM: number }> };
  people: { members: Array<{ name: string; organisation: string; projectRole: string; confirmed: boolean }> };
  documents: Array<{ documentId: string; code: string; title: string; version: number }>;
}

export interface ApiReport {
  id: string;
  kind: 'monthly' | 'lender' | 'portfolio' | 'eyemark';
  format: 'pdf' | 'xlsx' | 'csv';
  periodMonth: string | null;
  variant: 'finance' | 'standard' | null;
  status: 'queued' | 'running' | 'done' | 'failed';
  createdAt: string;
  requestedBy?: string | null;
  scheduled: boolean;
}

export interface ApiDesignRequirement {
  discipline: string;
  label: string;
  required: boolean;
  designStatus: string | null;
}

export interface ApiBaselineRevision {
  id: string;
  revision: number;
  status: 'pending' | 'approved' | 'returned' | 'superseded';
  reason: string | null;
  variationId: string | null;
  sha256: string;
  uploadedBy: string;
  uploadedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface ApiPracticalCompletion {
  lotId: string;
  status: 'not_recorded' | 'awaiting_confirmation' | 'confirmed';
  date: string | null;
  recordedBy: string | null;
  confirmedAt: string | null;
  confirmedBy: string | null;
}

export interface ApiObligation {
  id: string;
  kind: 'performance_bond' | 'advance_payment_guarantee' | 'insurance' | 'eia_condition';
  reference: string;
  description: string | null;
  expiresOn: string;
  documentCode?: string | null;
}
