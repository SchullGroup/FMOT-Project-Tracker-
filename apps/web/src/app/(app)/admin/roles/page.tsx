import { Section, Table } from '@/components/ui/Section';
import type { RoleCode } from '@fmot/shared';
import { ORG_TYPE_LABEL, ROLE_DUTY, ROLES_BY_ORG } from '@/lib/org-roles';
import { roleLabel } from '@/lib/roles';
import type { OrganisationType } from '@/lib/types';

/*
 * S3 Roles, read-only: what each role does and who can hold it. The rules
 * themselves are enforced by the API; this page explains them.
 */
export default function RolesPage() {
  const orgFor = (role: RoleCode) =>
    (Object.keys(ROLES_BY_ORG) as OrganisationType[]).filter((t) => ROLES_BY_ORG[t].includes(role)).map((t) => ORG_TYPE_LABEL[t]).join(', ');
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-semibold text-brand-900">Roles</h1>
      <p className="max-w-prose text-lg">Each person has one role. What they can see and decide comes from the role, the projects or lots they are on, and the rules below, which the system enforces.</p>
      <Section title="What each role does">
        <Table head={['Role', 'Does', 'Held by people from']}>
          {(Object.keys(ROLE_DUTY) as RoleCode[]).map((r) => (
            <tr key={r}>
              <td className="whitespace-nowrap font-semibold">{roleLabel(r)}</td>
              <td>{ROLE_DUTY[r]}</td>
              <td className="text-sm">{orgFor(r)}</td>
            </tr>
          ))}
        </Table>
      </Section>
      <Section title="Rules that always apply">
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li>Nobody approves something they created or sent.</li>
          <li>A payment certificate needs four different people from at least three organisations.</li>
          <li>A contractor can never check its own work; only the lot&rsquo;s supervising consultant can.</li>
          <li>Approving, certifying, confirming and publishing need the person&rsquo;s PIN, every time.</li>
          <li>The IT administrator sets up accounts and settings but can never approve anything.</li>
          <li>Money, live positions on site and security details are each shown only to roles allowed to see them.</li>
        </ul>
      </Section>
    </div>
  );
}
