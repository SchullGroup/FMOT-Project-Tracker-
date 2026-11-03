'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AddLotForm } from '@/components/forms/AddLotForm';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StripMapChart } from '@/components/project/StripMapChart';
import { useCan } from '@/components/Session';
import { Button } from '@/components/ui/Button';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getCorridor, getLots, getStripMap } from '@/lib/endpoints';
import { formatChainage, formatNaira } from '@/lib/format';

const CorridorMap = dynamic(() => import('@/components/project/CorridorMap').then((m) => m.CorridorMap), { ssr: false });

/** W5.3 Corridor */
export default function CorridorPage() {
  const id = useProjectId();
  const corridor = useQuery({ queryKey: ['corridor', id], queryFn: () => getCorridor(id) });
  const strip = useQuery({ queryKey: ['strip', id], queryFn: () => getStripMap(id) });
  const lots = useQuery({ queryKey: ['lots', id], queryFn: () => getLots(id) });
  const canAddLot = useCan('lots:manage');
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <Section
        title="The corridor"
        aside={
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
            <li><span aria-hidden className="mr-2 inline-block h-1.5 w-5 rounded bg-status-operational align-middle" />Lot complete</li>
            <li><span aria-hidden className="mr-2 inline-block h-1.5 w-5 rounded bg-status-construction align-middle" />Lot under way</li>
            <li><span aria-hidden className="mr-2 inline-block size-3 rounded-full border-2 border-brand-900 bg-white align-middle" />Station</li>
            <li><span aria-hidden className="mr-2 inline-block size-3 rounded-full bg-[#2f6fde] align-middle" />Verified photo</li>
            <li><span aria-hidden className="mr-2 inline-block size-3 rounded-full bg-status-stalled align-middle" />Incident</li>
          </ul>
        }
      >
        <QueryState loading={corridor.isPending} error={corridor.isError} />
        {corridor.data && <CorridorMap data={corridor.data} />}
      </Section>
      <Section title="Along the line">
        {strip.data && <StripMapChart data={strip.data} />}
      </Section>
      <Section title="Lots" aside={canAddLot && strip.data ? <Button variant="secondary" onClick={() => setAdding(true)}>Add a lot</Button> : undefined}>
        {notice && <p role="status" className="mb-4 rounded-md bg-[#e3f1e6] p-4 text-[#1f5a2b]">{notice}</p>}
        {strip.data && lots.data && <AddLotForm projectId={id} lengthM={strip.data.lengthM} existing={lots.data} open={adding} onClose={() => setAdding(false)} onDone={(m) => { setAdding(false); setNotice(m); }} />}
        <QueryState loading={lots.isPending} error={lots.isError} empty={lots.data?.length === 0} emptyText="Lots are added when the contract is signed (gate 8)." />
        {lots.data && lots.data.length > 0 && (
          <Table head={['Lot', 'Contract', 'From', 'To', 'Contractor', 'Supervising consultant', 'Contract sum']}>
            {lots.data.map((l) => (
              <tr key={l.id}>
                <td className="font-semibold">{l.name}</td>
                <td className="tabular">{l.contractRef}</td>
                <td className="tabular whitespace-nowrap">{formatChainage(l.chainageFromM)}</td>
                <td className="tabular whitespace-nowrap">{formatChainage(l.chainageToM)}</td>
                <td>{l.contractor}</td>
                <td>{l.consultant}</td>
                <td className="tabular">{formatNaira(l.contractSumKobo, { compact: true })}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
    </div>
  );
}
