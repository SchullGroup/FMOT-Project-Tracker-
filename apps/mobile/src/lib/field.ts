import type { Api } from './api';

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

export interface FieldContext {
  serverTime: string;
  lots: FieldLot[];
}

export interface MySubmission {
  id: string;
  kind: 'photo' | 'daily_report' | 'milestone_claim' | 'incident';
  status: 'queued' | 'sent' | 'checked' | 'pending_re' | 'verified' | 'sent_back';
  supersedesId: string | null;
  reportDate: string | null;
  receivedAt: string;
  returnReason: { code: string; label: string } | null;
}

export interface ReviewQueue {
  total: number;
  flagged: number;
  items: Array<{ id: string; kind: string; lotName: string; chainageM: number | null; flagged: boolean; capturedAt: string; submittedBy: string }>;
}

export const getContext = (api: Api, at?: { lat: number; lon: number }) =>
  api.request<FieldContext>(`/field/context${at ? `?lat=${at.lat}&lon=${at.lon}` : ''}`);
export const getMySubmissions = (api: Api) => api.request<{ serverTime: string; items: MySubmission[] }>('/field/my-submissions');
export const getReviewQueue = (api: Api) => api.request<ReviewQueue>('/field/review-queue');

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
