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

// Lenders see the projects their organisation finances (project_lenders).
export const FINANCED_PROJECT_ROLES: readonly RoleCode[] = ['lender_viewer'];

// The security desk covers every corridor, but its permissions stop at incidents, no-go segments and
// live field positions: no financial, document or gate content.
export const ALL_CORRIDOR_SECURITY_ROLES: readonly RoleCode[] = ['security_desk_officer'];

export const ORGANISATION_TYPES = ['ministry_unit', 'nrc', 'contractor', 'consultant', 'lender', 'state', 'oversight', 'public', 'service_provider'] as const;
export type OrganisationType = (typeof ORGANISATION_TYPES)[number];

// Outside organisations: their new accounts wait for the Director's confirmation before the invite goes.
export const EXTERNAL_ORGANISATION_TYPES: readonly OrganisationType[] = ['contractor', 'consultant', 'lender'];

// Short plain names for screens and messages; the roles table holds the full names.
export const ROLE_LABELS: Record<RoleCode, string> = {
  executive_viewer: 'Minister',
  accounting_officer: 'Permanent Secretary',
  director_rail: 'Director, rail',
  ministry_project_manager: 'Project manager',
  procurement_officer: 'Procurement officer',
  legal_officer: 'Legal officer',
  finance_officer: 'Finance officer',
  me_analyst: 'M&E analyst',
  nrc_project_engineer: 'NRC project engineer',
  nrc_asset_manager: 'NRC asset manager',
  consultant_resident_engineer: 'Resident engineer',
  contractor_site_manager: 'Site manager',
  contractor_commercial_manager: 'Commercial manager',
  security_desk_officer: 'Security desk',
  lender_viewer: 'Lender',
  oversight_viewer: 'Oversight',
  public_viewer: 'Public',
  it_administrator: 'IT administrator',
};

// Which kinds of organisation may hold each role (the API refuses any other pairing).
export const ROLE_ORGANISATION_TYPES: Record<RoleCode, readonly OrganisationType[]> = {
  executive_viewer: ['ministry_unit'],
  accounting_officer: ['ministry_unit'],
  director_rail: ['ministry_unit'],
  ministry_project_manager: ['ministry_unit'],
  procurement_officer: ['ministry_unit'],
  legal_officer: ['ministry_unit'],
  finance_officer: ['ministry_unit'],
  me_analyst: ['ministry_unit'],
  nrc_project_engineer: ['nrc'],
  nrc_asset_manager: ['nrc'],
  consultant_resident_engineer: ['consultant'],
  contractor_site_manager: ['contractor'],
  contractor_commercial_manager: ['contractor'],
  security_desk_officer: ['ministry_unit'],
  lender_viewer: ['lender'],
  oversight_viewer: ['oversight'],
  public_viewer: ['public'],
  it_administrator: ['ministry_unit', 'service_provider'],
};

export const roleLabel = (code: string) => ROLE_LABELS[code as RoleCode] ?? code.replaceAll('_', ' ');
