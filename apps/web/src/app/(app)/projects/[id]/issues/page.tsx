'use client';

import { useQuery } from '@tanstack/react-query';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StatusPill } from '@/components/ui/Pill';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getIncidents, getVariations } from '@/lib/endpoints';
import { formatChainage, formatDate, formatNaira } from '@/lib/format';

/** W5.10 Incidents from site, and claims for more money or more time. */
export default function IssuesPage() {
  const id = useProjectId();
  const incidents = useQuery({ queryKey: ['incidents', id], queryFn: () => getIncidents(id), retry: false });
  const variations = useQuery({ queryKey: ['variations', id], queryFn: () => getVariations(id) });

  return (
    <div className="flex flex-col gap-5">
      <Section title="Incidents">
        <QueryState loading={incidents.isPending} error={false} empty={!incidents.data?.length} emptyText="No incidents you can see." />
        {incidents.data && incidents.data.length > 0 && (
          <Table head={['Reported', 'Type', 'Where', 'What happened', 'Status']}>
            {incidents.data.map((i) => (
              <tr key={i.id}>
                <td className="tabular whitespace-nowrap">{formatDate(i.reportedAt)}</td>
                <td>{i.type}</td>
                <td className="tabular whitespace-nowrap">{formatChainage(i.chainageM)}</td>
                <td>{i.summary}</td>
                <td><StatusPill status={i.status} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
      <Section title="Variations and extensions of time">
        <QueryState loading={variations.isPending} error={variations.isError} empty={variations.data?.length === 0} emptyText="No claims raised." />
        {variations.data && variations.data.length > 0 && (
          <Table head={['Raised', 'Claim', 'Asks for', 'By', 'Where it is']}>
            {variations.data.map((v) => (
              <tr key={v.id}>
                <td className="tabular whitespace-nowrap">{formatDate(v.raisedAt)}</td>
                <td className="font-medium">{v.title}</td>
                <td className="tabular whitespace-nowrap">{v.type === 'variation' ? formatNaira(v.amountKobo, { compact: true }) : `${v.days} more days`}</td>
                <td>{v.raisedBy}</td>
                <td>{v.status}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
    </div>
  );
}
