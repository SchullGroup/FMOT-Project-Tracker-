import { lowerFirst, roleInSentence } from './format';
import type { TaskDetail } from './types';

/*
 * The short explanations beside each task: why this person decides it, and
 * what happens after. Plain words, one or two sentences each. If the API
 * later sends its own wording, prefer that.
 */
const WHY: Record<string, string> = {
  verify_submission: 'You check site photos and reports for your lot. Nothing counts toward progress or payment until you verify it.',
  verify_milestone: 'A milestone counts only when the resident engineer has seen the evidence, on screen or on site.',
  payment_certificate: 'Each payment passes four people from at least three organisations. This is your step in that chain.',
  confirm_gate: 'This decision was made outside the ministry. You confirm that the uploaded evidence is genuine and the date is right.',
  confirm_account: 'People from contractors, consultants and lenders get access only after the Director confirms them.',
  publish_project: 'A project appears on the map only when the Director publishes it. The person who created it cannot.',
  upload_document: 'This gate is waiting for a document your unit keeps.',
  variation: 'Claims for more money or more time are approved by the Director within the limit, and by BPP and FEC above it.',
  design_package: 'Designs are approved for construction in turn by the resident engineer, the NRC engineer and the Director.',
  confirm_membership: 'People from outside the ministry join a project only after the Director confirms them. Whoever added them cannot.',
  confirm_lot: 'A lot is a signed contract. The Director confirms it before its contractor and consultant can be given people.',
  sign_off_section: 'The contractor may work on a stretch only after the Director signs off that the site is available.',
  approve_baseline_revision: 'Planned progress is measured against the approved programme, so a change to it needs the Director.',
  confirm_practical_completion: 'Gate 13 passes when the Director has confirmed practical completion of every lot.',
  confirm_takeover: 'The line becomes operational when the Director confirms the NRC has taken it over.',
};

// The API names each step's task ("approve_certificate"); the sample data names the chain. Both find the same words.
const GROUP: Record<string, string> = {
  review_queue: 'verify_submission',
  verify_photo: 'verify_submission',
  verify_report: 'verify_submission',
  recommend_certificate: 'payment_certificate',
  certify_certificate: 'payment_certificate',
  approve_certificate: 'payment_certificate',
  final_approve_certificate: 'payment_certificate',
  mark_paid: 'payment_certificate',
  review_design_package: 'design_package',
  approve_design_package: 'design_package',
  countersign_design_package: 'design_package',
  assess_claim: 'variation',
  recommend_variation: 'variation',
  approve_variation: 'variation',
  attach_variation_evidence: 'variation',
  confirm_variation: 'variation',
};
const group = (type: string) => GROUP[type] ?? type;

const AFTER: Record<string, string> = {
  verify_submission: 'Verified photos appear on the project and count toward the month\u2019s measurement. Sent-back ones go to the site manager with your reason.',
  confirm_gate: 'The gate is passed with this date and the next gates open.',
  confirm_account: 'The invite text goes to the person, who sets a PIN and can start.',
  publish_project: 'The line is drawn on the map for every member, and gates 2 to 15 open.',
  upload_document: 'The Director checks it and confirms the gate.',
};

// Chain steps are named as verbs ("Certify", "Mark paid"); after "for" they read as nouns.
const STEP_NOUN: Record<string, string> = {
  Recommend: 'a recommendation',
  Assess: 'assessment',
  Certify: 'certification',
  Approve: 'approval',
  'Final approval': 'final approval',
  'Mark paid': 'payment',
  Countersign: 'countersigning',
  Confirm: 'confirmation',
  Publish: 'publishing',
  'Sign off': 'sign-off',
  'Attach BPP and FEC evidence': 'the BPP and FEC evidence',
};

export const whyText = (t: TaskDetail) => WHY[group(t.type)] ?? null;

/** What pressing the main button does, for the action bar. */
export function afterText(t: TaskDetail, actionLabel: string): string | null {
  const i = t.chain.findIndex((c) => c.current);
  if (i >= 0) {
    const next = t.chain[i + 1];
    return next
      ? `${actionLabel} sends it to the ${roleInSentence(next.role)} for ${STEP_NOUN[next.step] ?? lowerFirst(next.step)}, and is recorded with your name.`
      : `${actionLabel} completes the chain, and is recorded with your name.`;
  }
  return AFTER[group(t.type)] ?? null;
}
