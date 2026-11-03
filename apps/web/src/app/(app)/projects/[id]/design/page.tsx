'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { DesignRequirements } from '@/components/forms/DesignRequirements';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StatusPill } from '@/components/ui/Pill';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getDesignPackages, getLots } from '@/lib/endpoints';
import { formatDate } from '@/lib/format';

/** W5.7 Design packages and where each is in review. */
export default function DesignPage() {
  const id = useProjectId();
  const lots = useQuery({ queryKey: ['lots', id], queryFn: () => getLots(id) });
  const packs = useQueries({ queries: (lots.data ?? []).map((l) => ({ queryKey: ['design', l.id], queryFn: () => getDesignPackages(l.id) })) });
  const all = packs.flatMap((q) => q.data ?? []);

  return (
    <div className="flex flex-col gap-5">
      {(lots.data ?? []).length > 0 && (
        <Section title="What each lot needs approved">
          <p className="mb-4 text-ink-muted">Gate 12 passes by itself once every required design, in every lot, is approved for construction.</p>
          <div className="flex flex-col gap-8">
            {lots.data!.map((l) => <DesignRequirements key={l.id} lotId={l.id} lotName={l.name} />)}
          </div>
        </Section>
      )}
    <Section title="Design packages">
      <QueryState loading={lots.isPending} error={lots.isError} empty={lots.isSuccess && all.length === 0} emptyText="No design packages submitted yet." />
      {all.length > 0 && (
        <Table head={['Package', 'Discipline', 'Lot', 'Version', 'Status', 'Last change']}>
          {all.map((d) => (
            <tr key={d.id}>
              <td className="font-medium">{d.title}</td>
              <td>{d.discipline}</td>
              <td>{d.lotName}</td>
              <td className="tabular">{d.version}</td>
              <td><StatusPill status={d.status} /></td>
              <td className="tabular whitespace-nowrap">{formatDate(d.updatedAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Section>
    </div>
  );
}
