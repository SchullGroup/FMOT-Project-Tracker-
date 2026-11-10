import { ROLE_LABELS, ROLE_PERMISSIONS, type RoleCode } from '@fmot/shared';

/*
 * The test accounts of sample-data mode (NEXT_PUBLIC_API_MOCK=1): the demo people of docs/demo-data.md, each signing
 * in as their role with that role's permissions. Everyone uses the code 000000 and the PIN 4826. The sign-in page lists
 * them in sample mode only; on the real API none of this exists.
 */

export const DEMO_CODE = '000000';
export const DEMO_PIN = '4826';

export type DemoGroup = 'Ministry' | 'NRC' | 'Consultants' | 'Contractor' | 'Security and viewers' | 'Administration';

export interface DemoAccount {
  /** As typed: 0700 000 0103. */
  phone: string;
  name: string;
  role: RoleCode;
  organisation: { name: string; type: string };
  group: DemoGroup;
  /** One line on what to try with this person in sample mode. */
  tryThis: string;
  /** Locked or invited people cannot sign in, as in the demo data. */
  state?: 'locked' | 'invited';
  /** Only the automated walkthroughs use it: not listed on the sign-in page. */
  hidden?: boolean;
}

const fmot = (unit: string) => ({ name: `FMoT, ${unit}`, type: 'ministry_unit' });
const nrc = { name: 'Nigerian Railway Corporation', type: 'agency' };
const ccecc = { name: 'CCECC', type: 'contractor' };

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { phone: '0700 000 0101', name: 'Hon. Y. Abubakar', role: 'executive_viewer', organisation: fmot('office of the Minister'), group: 'Ministry', tryThis: 'The map and the portfolio of every corridor; open Kaduna–Kano and its payments.' },
  { phone: '0700 000 0102', name: 'Dr. F. Musa', role: 'accounting_officer', organisation: fmot('office of the Permanent Secretary'), group: 'Ministry', tryThis: 'Every project with exact amounts; the payment certificates and who approved each step.' },
  { phone: '0700 000 0103', name: 'Engr. H. Danjuma', role: 'director_rail', organisation: fmot('rail directorate'), group: 'Ministry', tryThis: 'Tasks: publish Kano–Katsina–Maradi, confirm gate 6, approve payment certificate 14 with the PIN, confirm a new account.' },
  { phone: '0700 000 0104', name: 'Engr. A. Bello', role: 'ministry_project_manager', organisation: fmot('rail directorate'), group: 'Ministry', tryThis: 'Create a project in the six-step wizard; on Kaduna–Kano, plan the programme, what needs design approval, lots and members.' },
  { phone: '0700 000 0105', name: 'Mr. S. Lawal', role: 'procurement_officer', organisation: fmot('procurement department'), group: 'Ministry', tryThis: 'Gates and documents: the procurement evidence for tenders, the BPP no objection and the award.' },
  { phone: '0700 000 0106', name: 'Barr. N. Uche', role: 'legal_officer', organisation: fmot('legal unit'), group: 'Ministry', tryThis: 'Documents: the contract, and the bonds, guarantees and insurances with their expiry dates.' },
  { phone: '0700 000 0107', name: 'Mrs. O. Eze', role: 'finance_officer', organisation: fmot('finance and accounts'), group: 'Ministry', tryThis: 'Payments with exact amounts; marking a certificate paid.' },
  { phone: '0700 000 0108', name: 'Mrs. C. Obi', role: 'me_analyst', organisation: fmot('monitoring and evaluation unit'), group: 'Ministry', tryThis: 'The portfolio, monthly reports and the Eyemark export.' },
  { phone: '0700 000 0109', name: 'Engr. K. Okafor', role: 'nrc_project_engineer', organisation: nrc, group: 'NRC', tryThis: 'Payment certificates to certify and design packages to approve.' },
  { phone: '0700 000 0110', name: 'Engr. L. Ade', role: 'nrc_asset_manager', organisation: nrc, group: 'NRC', tryThis: 'Stations and structures along the corridor.' },
  { phone: '0700 000 0111', name: 'Engr. T. Adeyemi', role: 'consultant_resident_engineer', organisation: { name: 'TEAM Consultants', type: 'consultant' }, group: 'Consultants', tryThis: 'Photos and reports: open one, verify it or send it back with a reason; recommend a payment certificate.' },
  { phone: '0700 000 0119', name: 'Engr. R. Nwosu', role: 'consultant_resident_engineer', organisation: { name: 'Sigma Engineering', type: 'consultant' }, group: 'Consultants', tryThis: 'The Lot 3 photos, including the one flagged outside the corridor.' },
  { phone: '0700 000 0112', name: 'Musa Garba', role: 'contractor_site_manager', organisation: ccecc, group: 'Contractor', tryThis: 'Site managers work in the phone app (photos, reports, milestones, incidents); the website has little for them.' },
  { phone: '0700 000 0121', name: 'Aisha Bello', role: 'contractor_site_manager', organisation: ccecc, group: 'Contractor', tryThis: 'As Musa Garba, on Lot 1.' },
  { phone: '0700 000 0113', name: 'Mr. Li Wei', role: 'contractor_commercial_manager', organisation: ccecc, group: 'Contractor', tryThis: 'Payments: send a new valuation; Design: send a design package.' },
  { phone: '0700 000 0120', name: 'Ibrahim Sule', role: 'contractor_site_manager', organisation: ccecc, group: 'Contractor', tryThis: 'Locked after five wrong PINs: shows what a locked person sees.', state: 'locked' },
  { phone: '0700 000 0122', name: 'Chinedu Okeke', role: 'contractor_site_manager', organisation: ccecc, group: 'Contractor', tryThis: 'Invited, waiting for the Director to confirm: cannot sign in yet.', state: 'invited' },
  { phone: '0700 000 0114', name: 'Mr. D. Ibrahim', role: 'security_desk_officer', organisation: fmot('security desk'), group: 'Security and viewers', tryThis: 'Issues: incidents with their exact places, and no-go stretches.' },
  { phone: '0700 000 0115', name: 'Ms. Wang Fang', role: 'lender_viewer', organisation: { name: 'China Development Bank', type: 'lender' }, group: 'Security and viewers', tryThis: 'Kaduna–Kano: progress, payments and reports for the lender.' },
  { phone: '0700 000 0116', name: 'Mr. P. Akande', role: 'oversight_viewer', organisation: { name: 'Office of the Auditor-General for the Federation', type: 'oversight' }, group: 'Security and viewers', tryThis: 'Read-only: gates, documents, reports and the activity log.' },
  { phone: '0700 000 0117', name: 'Ms. J. Okon', role: 'public_viewer', organisation: { name: 'Public access', type: 'public' }, group: 'Security and viewers', tryThis: 'The public view of the operational lines.' },
  { phone: '0700 000 0118', name: 'Tochi Nwachukwu', role: 'it_administrator', organisation: { name: 'Schull Technologies', type: 'service_provider' }, group: 'Administration', tryThis: 'Administration: add a person, reset a PIN, organisations, reminder and message settings.' },
  // Every area at once, as the sample data showed before roles: the automated walkthroughs, which cross several roles.
  { phone: '0700 000 0199', name: 'Engr. H. Danjuma', role: 'director_rail', organisation: fmot('rail directorate'), group: 'Administration', tryThis: 'Every area (automated walkthroughs).', hidden: true },
];

/** Every permission a sample screen checks, for the hidden walkthrough account. */
const EVERY_AREA = ['projects:create', 'projects:read', 'reports:read', 'reports:generate', 'finance:read_amounts', 'tasks:read', 'admin:users', 'admin:organisations', 'admin:reminders', 'audit:read', 'reports:export_eyemark', 'progress:plan', 'completion:record', 'obligations:manage', 'valuations:submit', 'lots:manage', 'members:manage', 'design:submit', 'security:read_detail'];

/** The account for what was typed: 0700 000 0103, 07000000103, +234 700 000 0103 or 234... all match. */
export function findDemoAccount(login: string): DemoAccount | undefined {
  const digits = login.replace(/\D/g, '');
  const local = digits.startsWith('234') ? `0${digits.slice(3)}` : digits;
  return DEMO_ACCOUNTS.find((a) => a.phone.replace(/\D/g, '') === local);
}

export const permissionsOf = (a: DemoAccount): string[] => (a.hidden ? EVERY_AREA : [...ROLE_PERMISSIONS[a.role]]);
export const roleLabelOf = (a: DemoAccount) => ROLE_LABELS[a.role];
export const e164 = (a: DemoAccount) => `+234${a.phone.replace(/\D/g, '').slice(1)}`;
