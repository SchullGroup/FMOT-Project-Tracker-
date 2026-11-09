import type { OutboxItem } from '@/outbox/outbox';
import { api } from '@/session/session';
import { getLotMilestones, type Milestone } from './field';
import { prefsStore } from './storage';

/* M5 and the home card: a lot's milestones, kept on the phone for when there is no signal. */

/** The last list seen for a lot, so the screen works without signal. */
const milestonesKey = (lotId: string) => `fmot.milestones.${lotId}`;

/** The milestones of a lot from the API, or the last list kept on the phone when there is no signal. */
export async function loadMilestones(lotId: string): Promise<{ list: Milestone[]; offline: boolean }> {
  try {
    const list = await getLotMilestones(api, lotId);
    await prefsStore.set(milestonesKey(lotId), JSON.stringify(list));
    return { list, offline: false };
  } catch (error) {
    const kept = await prefsStore.get(milestonesKey(lotId));
    if (!kept) throw error;
    return { list: JSON.parse(kept) as Milestone[], offline: true };
  }
}

export type MilestoneState = 'open' | 'onPhone' | 'claimed' | 'verified';

/** A milestone's state on this phone: a claim still in the outbox counts before the server knows it. */
export function milestoneState(m: Milestone, claims: Array<{ milestoneId: string; sent: boolean }>): MilestoneState {
  if (m.status === 'verified') return 'verified';
  if (m.status === 'claimed') return 'claimed';
  const local = claims.find((c) => c.milestoneId === m.id);
  return local ? (local.sent ? 'claimed' : 'onPhone') : 'open';
}


/** The claims in the outbox for a lot: which milestone, and whether the API has it yet. */
export const claimsOf = (items: OutboxItem[], lotId: string) =>
  items
    .filter((i) => i.kind === 'milestone_claim' && i.lotId === lotId)
    .map((i) => ({ milestoneId: String((i.metadata.details as { milestone_id?: string } | undefined)?.milestone_id ?? ''), sent: i.status === 'sent' }));
