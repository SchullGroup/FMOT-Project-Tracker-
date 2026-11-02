'use client';

import { useQuery } from '@tanstack/react-query';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StripMapChart } from '@/components/project/StripMapChart';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getProgress, getStripMap } from '@/lib/endpoints';
import { formatMonth } from '@/lib/format';

/** W5.5 Progress: planned against actual, by lot and discipline, and track laid per month. */
export default function ProgressPage() {
  const id = useProjectId();
  const progress = useQuery({ queryKey: ['progress', id], queryFn: () => getProgress(id) });
  const strip = useQuery({ queryKey: ['strip', id], queryFn: () => getStripMap(id) });
  const p = progress.data;

  return (
    <div className="flex flex-col gap-5">
      <QueryState loading={progress.isPending} error={progress.isError} />
      {p && (
        <p className="text-lg">
          <strong className="tabular">{p.physicalPercent}%</strong> built against <strong className="tabular">{p.plannedPercent}%</strong> planned by now
          {p.weeksBehind > 0 ? (
            <>, <strong className="text-status-construction">{p.weeksBehind} weeks behind</strong> the programme.</>
          ) : (
            ', on programme.'
          )}
        </p>
      )}

      {strip.data && (
        <Section title="Along the line">
          <StripMapChart data={strip.data} />
        </Section>
      )}

      {p?.lots.map((lot) => (
        <Section key={lot.id} title={lot.name}>
          <Table head={['Discipline', 'Planned', 'Done', 'Planned against done']}>
            {lot.disciplines.map((d) => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td className="tabular">{d.planned}%</td>
                <td className={`tabular font-semibold ${d.actual < d.planned ? 'text-status-construction' : ''}`}>{d.actual}%</td>
                <td className="w-1/2">
                  <div className="relative h-4 rounded-full bg-brand-100" aria-hidden>
                    <div className="absolute inset-y-0 left-0 rounded-full bg-status-operational" style={{ width: `${d.actual}%` }} />
                    <div className="absolute inset-y-[-3px] w-0.5 bg-brand-900" style={{ left: `${d.planned}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          <p className="mt-2 text-sm text-ink-muted">The dark mark is where the programme says this discipline should be now.</p>
        </Section>
      ))}

      {p && p.trackKmByMonth.length > 0 && (
        <Section title="Track laid each month">
          <TrackChart data={p.trackKmByMonth} />
        </Section>
      )}
    </div>
  );
}

function TrackChart({ data }: { data: Array<{ month: string; planned: number; actual: number }> }) {
  const max = Math.max(...data.flatMap((d) => [d.planned, d.actual]), 1);
  const H = 200;
  return (
    <figure>
      <div className="flex items-end gap-4 overflow-x-auto pb-2" style={{ height: H + 50 }}>
        {data.map((d) => (
          <div key={d.month} className="flex min-w-16 flex-col items-center gap-1">
            <div className="flex items-end gap-1" style={{ height: H }}>
              <div className="w-5 rounded-t bg-brand-100 ring-1 ring-line-strong" style={{ height: (d.planned / max) * H }} title={`Planned ${d.planned} km`} />
              <div className={`w-5 rounded-t ${d.actual < d.planned ? 'bg-status-construction' : 'bg-status-operational'}`} style={{ height: (d.actual / max) * H }} title={`Laid ${d.actual} km`} />
            </div>
            <span className="tabular text-sm">{d.actual}/{d.planned}</span>
            <span className="text-sm text-ink-muted">{formatMonth(d.month)}</span>
          </div>
        ))}
      </div>
      <figcaption className="text-sm text-ink-muted">Kilometres laid against planned. Light bar: planned. Coloured bar: laid (orange when short of plan).</figcaption>
    </figure>
  );
}
