import type { StepUpAction } from './permissions.js';
import type { RoleCode } from './roles.js';

// One approvals engine runs every chain below. The server enforces them; the web and mobile apps read them to
// draw the chain (who acts next, who already did) and to know which actions need the PIN.

export const WORKFLOW_KEYS = [
  'payment_certificate',
  'design_package',
  'variation',
  'extension_of_time',
  'publish_project',
  'confirm_gate',
  'confirm_account',
  'confirm_lot',
  'confirm_member',
  'sign_off_section',
] as const;
export type WorkflowKey = (typeof WORKFLOW_KEYS)[number];

// The verbs written to approvals.decision. "return" sends the item back one step; "resubmit" restarts after a return to the submitter.
export const ACTION_VERBS = [
  'recommend',
  'certify',
  'approve',
  'final_approve',
  'mark_paid',
  'countersign',
  'assess',
  'attach_evidence',
  'confirm',
  'publish',
  'sign_off',
  'return',
  'resubmit',
] as const;
export type ActionVerb = (typeof ACTION_VERBS)[number];

/**
 * Who may act on a step beyond holding the role:
 *  consultant_of_lot  a member of the lot whose organisation is the lot's supervising consultant
 *  project_member     a confirmed member of the project
 *  in_scope           anyone with the project in scope (the Director, the Permanent Secretary)
 */
export type Relation = 'consultant_of_lot' | 'project_member' | 'in_scope';

export interface WorkflowStep {
  key: string;
  label: string;
  action: Exclude<ActionVerb, 'return' | 'resubmit'>;
  // A fixed role, or the approver named by the gate template (confirm_gate).
  role: RoleCode | 'gate_approver';
  relation: Relation;
  // The PIN step-up action, or null when the step needs no PIN.
  stepUp: StepUpAction | null;
  // Decisions count toward "one person, one step of a chain"; preparing evidence does not.
  decision: boolean;
  // The task the step opens in the inbox (W7).
  taskType: string;
  // Default due time; the reminder rule due.<workflow>.<step> overrides it.
  dueHours: number;
  // Variations: which path the step belongs to.
  only?: 'within_threshold' | 'above_threshold';
  // Register codes the action must carry as documents (any document when 'any').
  documents?: string[] | 'any';
}

export interface WorkflowDefinition {
  key: WorkflowKey;
  label: string;
  subjectTable: string;
  steps: WorkflowStep[];
  // Payment certificates: these steps by different people from at least `min` organisations.
  distinctOrganisations?: { steps: string[]; min: number };
  // The task the submitter gets when the first step returns the item.
  returnTaskType: string;
}

const step = (s: WorkflowStep) => s;

const claimSteps: WorkflowStep[] = [
  step({ key: 'assess', label: 'Assess', action: 'assess', role: 'consultant_resident_engineer', relation: 'consultant_of_lot', stepUp: null, decision: true, taskType: 'assess_claim', dueHours: 120 }),
  step({ key: 'recommend', label: 'Recommend', action: 'recommend', role: 'ministry_project_manager', relation: 'project_member', stepUp: null, decision: true, taskType: 'recommend_variation', dueHours: 72 }),
  step({ key: 'approve', label: 'Approve', action: 'approve', role: 'director_rail', relation: 'in_scope', stepUp: 'variation.approve', decision: true, taskType: 'approve_variation', dueHours: 120, only: 'within_threshold' }),
  step({ key: 'attach_evidence', label: 'Attach BPP and FEC evidence', action: 'attach_evidence', role: 'ministry_project_manager', relation: 'project_member', stepUp: null, decision: false, taskType: 'attach_variation_evidence', dueHours: 336, only: 'above_threshold', documents: 'any' }),
  step({ key: 'confirm', label: 'Confirm', action: 'confirm', role: 'director_rail', relation: 'in_scope', stepUp: 'variation.confirm', decision: true, taskType: 'confirm_variation', dueHours: 120, only: 'above_threshold' }),
];

export const WORKFLOWS: Record<WorkflowKey, WorkflowDefinition> = {
  payment_certificate: {
    key: 'payment_certificate',
    label: 'Interim payment certificate',
    subjectTable: 'payment_certificates',
    returnTaskType: 'revise_submission',
    distinctOrganisations: { steps: ['recommend', 'certify', 'approve', 'final_approve'], min: 3 },
    steps: [
      step({ key: 'recommend', label: 'Recommend', action: 'recommend', role: 'consultant_resident_engineer', relation: 'consultant_of_lot', stepUp: null, decision: true, taskType: 'recommend_certificate', dueHours: 72 }),
      step({ key: 'certify', label: 'Certify', action: 'certify', role: 'nrc_project_engineer', relation: 'project_member', stepUp: 'certificate.certify', decision: true, taskType: 'certify_certificate', dueHours: 120 }),
      step({ key: 'approve', label: 'Approve', action: 'approve', role: 'director_rail', relation: 'in_scope', stepUp: 'certificate.approve', decision: true, taskType: 'approve_certificate', dueHours: 120 }),
      step({ key: 'final_approve', label: 'Final approval', action: 'final_approve', role: 'accounting_officer', relation: 'in_scope', stepUp: 'certificate.final_approve', decision: true, taskType: 'final_approve_certificate', dueHours: 120 }),
      step({ key: 'mark_paid', label: 'Mark paid', action: 'mark_paid', role: 'finance_officer', relation: 'project_member', stepUp: null, decision: true, taskType: 'mark_paid', dueHours: 240, documents: ['D24'] }),
    ],
  },
  design_package: {
    key: 'design_package',
    label: 'Design package',
    subjectTable: 'design_packages',
    returnTaskType: 'revise_submission',
    steps: [
      step({ key: 'recommend', label: 'Recommend', action: 'recommend', role: 'consultant_resident_engineer', relation: 'consultant_of_lot', stepUp: null, decision: true, taskType: 'review_design_package', dueHours: 120 }),
      step({ key: 'approve', label: 'Approve', action: 'approve', role: 'nrc_project_engineer', relation: 'project_member', stepUp: 'design.approve', decision: true, taskType: 'approve_design_package', dueHours: 120 }),
      step({ key: 'countersign', label: 'Countersign', action: 'countersign', role: 'director_rail', relation: 'in_scope', stepUp: 'design.countersign', decision: true, taskType: 'countersign_design_package', dueHours: 72 }),
    ],
  },
  variation: { key: 'variation', label: 'Variation', subjectTable: 'variations', returnTaskType: 'revise_submission', steps: claimSteps },
  extension_of_time: { key: 'extension_of_time', label: 'Extension of time', subjectTable: 'variations', returnTaskType: 'revise_submission', steps: claimSteps },
  publish_project: {
    key: 'publish_project',
    label: 'Publish project',
    subjectTable: 'projects',
    returnTaskType: 'revise_submission',
    steps: [step({ key: 'publish', label: 'Publish', action: 'publish', role: 'director_rail', relation: 'in_scope', stepUp: 'project.publish', decision: true, taskType: 'publish_project', dueHours: 120 })],
  },
  confirm_gate: {
    key: 'confirm_gate',
    label: 'Confirm gate',
    subjectTable: 'project_gates',
    // A returned gate goes back to the step's uploader role, as an upload task.
    returnTaskType: 'upload_document',
    steps: [step({ key: 'confirm', label: 'Confirm', action: 'confirm', role: 'gate_approver', relation: 'in_scope', stepUp: 'gate.confirm', decision: true, taskType: 'confirm_gate', dueHours: 336 })],
  },
  confirm_account: {
    key: 'confirm_account',
    label: 'Confirm new account',
    subjectTable: 'invites',
    returnTaskType: 'revise_submission',
    steps: [step({ key: 'confirm', label: 'Confirm', action: 'confirm', role: 'director_rail', relation: 'in_scope', stepUp: 'invite.confirm', decision: true, taskType: 'confirm_account', dueHours: 72 })],
  },
  confirm_lot: {
    key: 'confirm_lot',
    label: 'Confirm lot',
    subjectTable: 'lots',
    returnTaskType: 'revise_submission',
    steps: [step({ key: 'confirm', label: 'Confirm', action: 'confirm', role: 'director_rail', relation: 'in_scope', stepUp: 'lot.confirm', decision: true, taskType: 'confirm_lot', dueHours: 120 })],
  },
  confirm_member: {
    key: 'confirm_member',
    label: 'Confirm member',
    subjectTable: 'memberships',
    returnTaskType: 'revise_submission',
    steps: [step({ key: 'confirm', label: 'Confirm', action: 'confirm', role: 'director_rail', relation: 'in_scope', stepUp: 'membership.confirm', decision: true, taskType: 'confirm_membership', dueHours: 72 })],
  },
  sign_off_section: {
    key: 'sign_off_section',
    label: 'Sign off site section',
    subjectTable: 'site_sections',
    returnTaskType: 'revise_submission',
    steps: [step({ key: 'sign_off', label: 'Sign off', action: 'sign_off', role: 'director_rail', relation: 'in_scope', stepUp: 'section.sign_off', decision: true, taskType: 'sign_off_section', dueHours: 120 })],
  },
};

export type Path = 'within_threshold' | 'above_threshold' | null;

// The steps a given instance runs: variations take one of two paths, everything else runs every step.
export const stepsFor = (key: WorkflowKey, path: Path = null): WorkflowStep[] =>
  WORKFLOWS[key].steps.filter((s) => !s.only || s.only === path);

// Every task type the definitions open, for the database enum check.
export const WORKFLOW_TASK_TYPES = [...new Set(Object.values(WORKFLOWS).flatMap((w) => [w.returnTaskType, ...w.steps.map((s) => s.taskType)]))];
