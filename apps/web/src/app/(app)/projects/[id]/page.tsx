'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { GateStrip } from '@/components/project/GateStrip';
import { PhotoThumb } from '@/components/project/PhotoThumb';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StripMapChart } from '@/components/project/StripMapChart';
import { QueryState, Section } from '@/components/ui/Section';
import { getGates, getProgress, getProjectCard, getStripMap, getSubmissions } from '@/lib/endpoints';
import { formatChainage, formatDate } from '@/lib/format';

/** W5.1 Overview */
export default function OverviewPage() {
  const id = useProjectId();
  const card = useQuery({ queryKey: ['card', id], queryFn: () => getProjectCard(id) });
  const gates = useQuery({ queryKey: ['gates', id], queryFn: () => getGates(id) });
  const strip = useQuery({ queryKey: ['strip', id], queryFn: () => getStripMap(id) });
  const progress = useQuery({ queryKey: ['progress', id], queryFn: () => getProgress(id), retry: false });
  const photos = useQuery({ queryKey: ['submissions', id, 'verified-photos'], queryFn: () => getSubmissions(id, '?kind=photo&status=verified') });

  const latest = (photos.data ?? [])
    .filter((s) => s.kind === 'photo' && s.status === 'verified')
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
    .slice(0, 6);
  const p = progress.data;

  return (
    <div className="flex flex-col gap-5">
      <Section title="Gates">
        <QueryState loading={gates.isPending} error={gates.isError} />
        {gates.data && <GateStrip gates={gates.data} />}
      </Section>

      {p && (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Figure label="Built" value={`${p.physicalPercent}%`} note={`Planned ${p.plannedPercent}% by now`} />
          {p.financialPercent !== null && <Figure label="Paid" value={`${p.financialPercent}%`} note="Of the contract sum" />}
          <Figure
            label="Against the programme"
            value={p.weeksBehind > 0 ? `${p.weeksBehind} weeks behind` : 'On programme'}
            note="Measured by the resident engineers"
            warn={p.weeksBehind > 0}
          />
          <Figure label="Open blockers" value={String(card.data?.blockers.length ?? 0)} note={card.data?.blockers[0]?.text ?? 'None'} warn={(card.data?.blockers.length ?? 0) > 0} />
        </dl>
      )}

      <Section title="Progress along the line" aside={<Link className="font-semibold text-brand-900 underline underline-offset-4" href={`/projects/${id}/progress`}>Progress by lot</Link>}>
        <QueryState loading={strip.isPending} error={strip.isError} />
        {strip.data && <StripMapChart data={strip.data} />}
      </Section>

      <Section title="Latest verified photos" aside={<Link className="font-semibold text-brand-900 underline underline-offset-4" href={`/projects/${id}/photos`}>All photos and reports</Link>}>
        <QueryState loading={photos.isPending} error={photos.isError} empty={latest.length === 0} emptyText="No verified photos yet." />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {latest.map((s) => (
            <li key={s.id}>
              <PhotoThumb mediaId={s.mediaId} alt={`${s.discipline ?? 'Site'} photo at ${formatChainage(s.chainageM)}`} />
              <p className="mt-2 text-sm font-semibold tabular">{formatChainage(s.chainageM)}</p>
              <p className="text-sm text-ink-muted">{formatDate(s.capturedAt)}</p>
            </li>
          ))}
        </ul>
      </Section>

      {card.data && card.data.blockers.length > 0 && (
        <Section title="Blockers">
          <ul className="flex flex-col gap-2">
            {card.data.blockers.map((b) => (
              <li key={b.text} className="rounded-md border-l-4 border-status-stalled bg-[#fbeaec] p-3">
                {b.text}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Figure({ label, value, note, warn }: { label: string; value: string; note: string; warn?: boolean }) {
  return (
    <div className="rounded-md bg-surface p-4 ring-1 ring-line">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={`tabular text-2xl font-semibold ${warn ? 'text-status-construction' : ''}`}>{value}</dd>
      <dd className="mt-1 text-sm text-ink-muted">{note}</dd>
    </div>
  );
}
