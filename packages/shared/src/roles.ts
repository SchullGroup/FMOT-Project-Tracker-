// The 18 built-in roles. Must match the role_code enum in apps/api (a unit test checks it).
export const ROLE_CODES = [
  'executive_viewer',
  'accounting_officer',
  'director_rail',
  'ministry_project_manager',
  'procurement_officer',
  'legal_officer',
  'finance_officer',
  'me_analyst',
  'nrc_project_engineer',
  'nrc_asset_manager',
  'consultant_resident_engineer',
  'contractor_site_manager',
  'contractor_commercial_manager',
  'security_desk_officer',
  'lender_viewer',
  'oversight_viewer',
  'public_viewer',
  'it_administrator',
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

// Roles that see every project (the Minister and Minister of State, the Permanent Secretary, the Director,
// M&E and oversight, which includes the Auditor-General). Everyone else is limited to their memberships.
export const ALL_PROJECT_ROLES: readonly RoleCode[] = [
  'executive_viewer',
  'accounting_officer',
  'director_rail',
  'me_analyst',
  'oversight_viewer',
];

// Contractor people only ever see their own lots, never a whole project.
export const LOT_LIMITED_ROLES: readonly RoleCode[] = ['contractor_site_manager', 'contractor_commercial_manager'];

// Lenders see the projects they finance.
export const FINANCED_PROJECT_ROLES: readonly RoleCode[] = ['lender_viewer'];
