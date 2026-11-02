import { EXTERNAL_ORGANISATION_TYPES, ORGANISATION_TYPES, ROLE_CODES, ROLE_ORGANISATION_TYPES, type RoleCode } from '@fmot/shared';
import type { OrganisationType } from './types';

// Which roles a person from each kind of organisation can hold: the API's rule, from packages/shared.
export const ROLES_BY_ORG = Object.fromEntries(
  ORGANISATION_TYPES.map((t) => [t, ROLE_CODES.filter((r) => ROLE_ORGANISATION_TYPES[r].includes(t))]),
) as Record<OrganisationType, RoleCode[]>;

export const ORG_TYPE_LABEL: Record<OrganisationType, string> = {
  ministry_unit: 'Ministry unit',
  nrc: 'Nigerian Railway Corporation',
  contractor: 'Contractor',
  consultant: 'Supervising consultant',
  lender: 'Lender',
  state: 'State government',
  oversight: 'Oversight body',
  public: 'Public',
  service_provider: 'Service provider',
};

/** Organisations whose new accounts the Director must confirm before the invite goes. */
export const NEEDS_DIRECTOR: readonly OrganisationType[] = EXTERNAL_ORGANISATION_TYPES;

/** What each role does, in a sentence, for the Roles page. */
export const ROLE_DUTY: Record<RoleCode, string> = {
  executive_viewer: 'Sees every project and the national counters.',
  accounting_officer: 'Gives the final approval on payment certificates.',
  director_rail: 'Confirms gates, publishes projects, approves payments and new outside accounts.',
  ministry_project_manager: 'Creates projects, uploads evidence, keeps the land register, raises variations.',
  procurement_officer: 'Uploads tender, BPP and FEC documents.',
  legal_officer: 'Uploads contracts, vetting letters and addenda.',
  finance_officer: 'Records payments with the payment advice.',
  me_analyst: 'Runs reports and the Eyemark export.',
  security_desk_officer: 'Handles incidents and no-go segments across all corridors.',
  it_administrator: 'Creates accounts and organisations and keeps the settings. Never approves anything.',
  nrc_project_engineer: 'Certifies payments, approves designs, accepts commissioning and takes over the line.',
  nrc_asset_manager: 'Keeps the asset register after handover.',
  contractor_site_manager: 'Sends photos, daily reports, milestone claims and incidents from the phone.',
  contractor_commercial_manager: 'Submits valuations, design packages and claims for the contractor.',
  consultant_resident_engineer: 'Checks site photos and reports, measures work, recommends payment.',
  lender_viewer: 'Reads progress and reports for the projects the lender finances.',
  oversight_viewer: 'Reads dashboards and documents; the auditor also reads the activity record.',
  public_viewer: 'Sees the public map.',
};
