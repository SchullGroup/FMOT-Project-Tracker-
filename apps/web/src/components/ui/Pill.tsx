type Tone = 'good' | 'warn' | 'bad' | 'neutral' | 'info';

const TONES: Record<Tone, string> = {
  good: 'bg-[#e3f1e6] text-[#1f5a2b]',
  warn: 'bg-[#fbecd9] text-[#7a4304]',
  bad: 'bg-[#fbe3e6] text-[#8a0019]',
  neutral: 'bg-canvas text-ink-muted',
  info: 'bg-brand-50 text-brand-800',
};

/** A small status label. Text always says the status; colour only supports it. */
export function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full px-3 text-sm font-semibold ${TONES[tone]}`}>{children}</span>;
}

export const toneFor: Record<string, Tone> = {
  // gates
  passed: 'good',
  in_progress: 'warn',
  awaiting_confirmation: 'info',
  blocked: 'bad',
  not_started: 'neutral',
  // field
  verified: 'good',
  pending_re: 'info',
  sent_back: 'bad',
  // certificates
  draft: 'neutral',
  recommended: 'info',
  certified: 'info',
  approved: 'info',
  final_approved: 'info',
  paid: 'good',
  returned: 'bad',
  // design
  submitted: 'info',
  under_review: 'info',
  approved_for_construction: 'good',
  // land
  unpaid: 'bad',
  disputed: 'bad',
  queried: 'warn',
  available: 'good',
  // issues
  open: 'warn',
  escalated: 'bad',
  resolved: 'good',
  closed: 'neutral',
};

export const labelFor: Record<string, string> = {
  passed: 'Passed',
  in_progress: 'In progress',
  awaiting_confirmation: 'Waiting for confirmation',
  blocked: 'Blocked',
  not_started: 'Not started',
  verified: 'Verified',
  pending_re: 'Waiting for the engineer',
  sent_back: 'Sent back',
  draft: 'Draft',
  recommended: 'Recommended',
  certified: 'Certified',
  approved: 'Approved',
  final_approved: 'Final approval given',
  paid: 'Paid',
  returned: 'Returned',
  submitted: 'Submitted',
  under_review: 'Under review',
  approved_for_construction: 'Approved for construction',
  unpaid: 'Unpaid',
  disputed: 'Disputed',
  queried: 'Queried',
  available: 'Available',
  open: 'Open',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function StatusPill({ status }: { status: string }) {
  return <Pill tone={toneFor[status] ?? 'neutral'}>{labelFor[status] ?? status.replace(/_/g, ' ')}</Pill>;
}
