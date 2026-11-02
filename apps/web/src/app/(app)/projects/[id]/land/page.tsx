'use client';

import { useQuery } from '@tanstack/react-query';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StatusPill } from '@/components/ui/Pill';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getGrievances, getParcels, getSections, getStripMap } from '@/lib/endpoints';
import { formatChainage, formatDate, formatNaira } from '@/lib/format';

/** W5.9 Land and community: where the contractor can work, who is unpaid, and complaints. */
export default function LandPage() {
  const id = useProjectId();
  const sections = useQuery({ queryKey: ['sections', id], queryFn: () => getSections(id) });
  const parcels = useQuery({ queryKey: ['parcels', id], queryFn: () => getParcels(id) });
  const grievances = useQuery({ queryKey: ['grievances', id], queryFn: () => getGrievances(id) });
  const strip = useQuery({ queryKey: ['strip', id], queryFn: () => getStripMap(id) });

  const length = strip.data?.lengthM ?? Math.max(1, ...(sections.data ?? []).map((s) => s.toM));
  const blocked = (sections.data ?? []).filter((s) => s.status === 'blocked');
  const unpaid = (parcels.data ?? []).filter((p) => p.status !== 'paid');

  return (
    <div className="flex flex-col gap-5">
      <Section title="Where the contractor can work">
        <QueryState loading={sections.isPending} error={sections.isError} empty={sections.data?.length === 0} emptyText="No sections recorded yet." />
        {sections.data && sections.data.length > 0 && (
          <>
            <div className="flex h-8 overflow-hidden rounded-md ring-1 ring-line" aria-hidden>
              {sections.data.map((s) => (
                <div key={s.id} className={s.status === 'available' ? 'bg-status-operational' : 'bg-status-stalled'} style={{ width: `${((s.toM - s.fromM) / length) * 100}%` }} />
              ))}
            </div>
            <p className="mt-3 text-base">
              {blocked.length === 0
                ? 'The whole line is available to the contractor.'
                : `Blocked: ${blocked.map((b) => `${formatChainage(b.fromM)} to ${formatChainage(b.toM)}`).join('; ')}. Available sections are signed off by the Director.`}
            </p>
          </>
        )}
      </Section>

      <Section title={`Compensation${unpaid.length ? `: ${unpaid.length} parcels not settled` : ''}`}>
        <QueryState loading={parcels.isPending} error={parcels.isError} empty={parcels.data?.length === 0} emptyText="No parcels recorded." />
        {parcels.data && parcels.data.length > 0 && (
          <Table head={['Parcel', 'Chainage', 'Owner or community', 'Valuation', 'Paid', 'Status']}>
            {parcels.data.map((p) => (
              <tr key={p.id}>
                <td className="tabular font-semibold">{p.ref}</td>
                <td className="tabular whitespace-nowrap">{formatChainage(p.fromM)}</td>
                <td>{p.owner}</td>
                <td className="tabular">{formatNaira(p.valuationKobo, { compact: true })}</td>
                <td className="tabular">{formatNaira(p.paidKobo, { compact: true })}</td>
                <td><StatusPill status={p.status} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Section title="Grievances">
        <QueryState loading={grievances.isPending} error={grievances.isError} empty={grievances.data?.length === 0} emptyText="No grievances logged." />
        <ul className="flex flex-col gap-3">
          {grievances.data?.map((g) => (
            <li key={g.id} className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-line p-4">
              <div>
                <p className="font-semibold"><span className="tabular">{g.ref}</span>: {g.summary}</p>
                <p className="text-sm text-ink-muted">{formatChainage(g.chainageM)}, opened {formatDate(g.openedAt)}</p>
              </div>
              <StatusPill status={g.status} />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
