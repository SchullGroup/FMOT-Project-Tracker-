import type { FundingRoute } from '@/lib/types';

/* Gate names and kinds for the preview strip. The real template comes from the API at step 2's save. */
export const GATES = [
  'Initiation', 'Feasibility accepted', 'Funding route chosen', 'Funding approved', 'Tender and evaluation',
  'BPP no objection', 'FEC award', 'Contract signed', 'Environmental approval', 'Right-of-way',
  'Financial close', 'Detailed design', 'Certify and pay', 'Commissioning', 'Handover',
];

export const ROUTES: Array<{ key: FundingRoute; title: string; text: string; gate4: string }> = [
  { key: 'loan', title: 'External loan', text: 'A lender such as China Exim Bank or the AfDB, with a Nigerian counterpart share.', gate4: 'Borrowing plan approved by FEC and the National Assembly, then the loan signed' },
  { key: 'budget', title: 'Federal budget', text: 'Paid from a line in the Appropriation Act.', gate4: 'Appropriation Act passed with the project\u2019s budget line' },
  { key: 'ppp', title: 'Public-private partnership', text: 'A concession through the ICRC process.', gate4: 'ICRC certificates for the outline and full business cases, then FEC approval' },
  { key: 'state_private', title: 'State or private line', text: 'Built and funded by a state or a private developer.', gate4: 'State approval and an interface agreement with the ministry and the NRC' },
];
