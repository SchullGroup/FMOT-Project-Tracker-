import type { Api } from './api';
import { apiBaseUrl } from './config';

/* The field API as the home screens use it (apps/api/src/field). */

export interface FieldLot {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  chainageFromM: number;
  chainageToM: number;
  label: string;
  /** Where the phone is, against this lot's line (only when a location was sent). */
  nearest: { chainageM: number; chainage: string; offsetM: number; inLot: boolean } | null;
}

export interface Coded {
  code: string;
  label: string;
}

export interface FieldContext {
  serverTime: string;
  lots: FieldLot[];
  disciplines?: Coded[];
  returnReasons?: Coded[];
  incidentTypes?: Coded[];
}

/** A milestone of one of the site manager's lots (GET /lots/:id/milestones). */
export interface Milestone {
  id: string;
  name: string;
  chainageM: number;
  plannedDate: string | null;
  status: 'planned' | 'claimed' | 'verified';
  claimedAt: string | null;
  verifiedAt: string | null;
  discipline: string | null;
}

/** A daily report's answers (M4). */
export interface ReportDetails {
  report_date: string;
  workers: number;
  machines: string[];
  weather: Weather;
  problem: boolean;
  note?: string;
}
export type Weather = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'harmattan';
export const WEATHER: Weather[] = ['sunny', 'cloudy', 'rain', 'storm', 'harmattan'];

export type CheckResult = 'pass' | 'warn' | 'fail' | 'not_available';

export interface MySubmission {
  id: string;
  clientId: string;
  chainageM: number | null;
  /** "km 142+300", from the server. */
  chainage: string | null;
  discipline: string | null;
  capturedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  lotId: string;
  kind: 'photo' | 'daily_report' | 'milestone_claim' | 'incident';
  status: 'queued' | 'sent' | 'checked' | 'pending_re' | 'verified' | 'sent_back';
  supersedesId: string | null;
  reportDate: string | null;
  receivedAt: string;
  returnReason: { code: string; label: string } | null;
  /** Daily reports only: the answers, to prefill the next one. */
  details?: ReportDetails;
}

export interface ReviewItem {
  id: string;
  kind: 'photo' | 'daily_report' | 'milestone_claim' | 'incident';
  lotId: string;
  lotName: string;
  chainageM: number | null;
  flagged: boolean;
  capturedAt: string;
  submittedBy: string;
  thumbMediaId: string | null;
  discipline: string | null;
  milestoneName: string | null;
  details: Record<string, unknown> | null;
  checks: Record<string, { result: CheckResult; reason: string }> | null;
}

export interface ReviewQueue {
  total: number;
  flagged: number;
  items: ReviewItem[];
}

export const getContext = (api: Api, at?: { lat: number; lon: number }) =>
  api.request<FieldContext>(`/field/context${at ? `?lat=${at.lat}&lon=${at.lon}` : ''}`);
export const getMySubmissions = (api: Api, since?: string) =>
  api.request<{ serverTime: string; items: MySubmission[] }>(`/field/my-submissions${since ? `?since=${encodeURIComponent(since)}` : ''}`);
export const getReviewQueue = (api: Api) => api.request<ReviewQueue>('/field/review-queue');
export const getLotMilestones = (api: Api, lotId: string) => api.request<Milestone[]>(`/lots/${lotId}/milestones`);
export const verifyItem = (api: Api, id: string) => api.request<{ id: string; status: 'verified' }>(`/field/submissions/${id}/verify`, { method: 'POST' });
export const sendBackItem = (api: Api, id: string, returnReasonCode: string) =>
  api.request<{ id: string; status: 'sent_back' }>(`/field/submissions/${id}/send-back`, { method: 'POST', body: { returnReasonCode } });
/** A signed link to a photo (5 minutes, no token needed), made absolute against the API's address. */
export async function mediaUrl(api: Api, mediaId: string, size: 'thumb' | 'web' = 'web') {
  const { url } = await api.request<{ url: string }>(`/media/${mediaId}?size=${size}`);
  return `${apiBaseUrl().replace(/\/api$/, '')}${url}`;
}

/**
 * The photo status ladder (gap review) for the sync strip: Queued is on the phone (the outbox comes in the next step);
 * Sent covers everything on the server not yet decided; Sent back counts only items not already retaken.
 */
export function ladder(items: MySubmission[], queued = 0) {
  const retaken = new Set(items.map((i) => i.supersedesId).filter((x): x is string => !!x));
  const live = items.filter((i) => !retaken.has(i.id));
  const sentBack = live.filter((i) => i.status === 'sent_back');
  return {
    queued,
    sent: live.filter((i) => i.status === 'sent' || i.status === 'checked' || i.status === 'pending_re').length,
    verified: live.filter((i) => i.status === 'verified').length,
    sentBack: sentBack.length,
    firstReason: sentBack[0]?.returnReason?.label ?? null,
  };
}

/** Lagos calendar date (UTC+1 all year), as the API's report dates. */
export const lagosToday = (now = new Date()) => new Date(now.getTime() + 3_600_000).toISOString().slice(0, 10);

/** Whether today's daily report has reached the server. */
export const reportSentToday = (items: MySubmission[], today = lagosToday()) => items.some((i) => i.kind === 'daily_report' && i.reportDate === today);
