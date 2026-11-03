'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { GateStrip } from '@/components/project/GateStrip';
import { PhotoThumb } from '@/components/project/PhotoThumb';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StripMapChart } from '@/components/project/StripMapChart';
import { QueryState, Section } from '@/components/ui/Section';
import { getCorridor, getGates, getLots, getProgress, getProjectCard, getReview, getStripMap, getSubmissions } from '@/lib/endpoints';
import { formatChainage, formatDate, formatNaira } from '@/lib/format';
import type { DraftReview, GateRow } from '@/lib/types';

const CorridorMap = dynamic(() => import('@/components/project/CorridorMap').then((m) => m.CorridorMap), { ssr: false });
const PreviewMap = dynamic(() => import('@/components/wizard/PreviewMap').then((m) => m.PreviewMap), { ssr: false });

/** W5.1 Overview, as in the design: gates with the key figures, the line, photos beside the corridor, and alerts. */
export default function OverviewPage() {
  const id = useProjectId();
  const card = useQuery({ queryKey: ['card', id], queryFn: () => getProjectCard(id) });
  const draft = card.data?.status === 'draft';
  const gates = useQuery({ queryKey: ['gates', id], queryFn: () => getGates(id) });
  const strip = useQuery({ queryKey: ['strip', id], queryFn: () => getStripMap(id), enabled: card.isSuccess && !draft });
  const progress = useQuery({ queryKey: ['progress', id], queryFn: () => getProgress(id), retry: false, enabled: card.isSuccess && !draft });
  const lots = useQuery({ queryKey: ['lots', id], queryFn: () => getLots(id), enabled: card.isSuccess && !draft });
  const corridor = useQuery({ queryKey: ['corridor', id], queryFn: () => getCorridor(id), enabled: card.isSuccess && !draft });
  const photos = useQuery({ queryKey: ['submissions', id, 'verified-photos'], queryFn: () => getSubmissions(id, '?kind=photo&status=verified'), enabled: card.isSuccess && !draft });
  const review = useQuery({ queryKey: ['draft', id], queryFn: () => getReview(id), enabled: draft });

  if (draft) return <DraftOverview gates={gates.data} review={review.data} />;

  const latest = (photos.data ?? []).filter((s) => s.kind === 'photo' && s.status === 'verified').sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)).slice(0, 6);
  const p = progress.data;
  const contractSum = (lots.data ?? []).reduce((n, l) => n + Number(l.contractSumKobo ?? 0), 0);
  const blockers = card.data?.blockers ?? [];

  return (
    <div className="flex flex-col gap-5">
      {blockers.length > 0 && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border-l-4 border-status-stalled bg-[#fbeaec] px-4 py-3">
          <strong className="text-status-stalled">{blockers.length} open {blockers.length === 1 ? 'alert' : 'alerts'}</strong>
          <span className="flex-1">{blockers.map((b) => b.text).join(' · ')}</span>
          <Link href={`/projects/${id}/land`} className="font-semibold text-brand-900 underline underline-offset-4">See land and community</Link>
        </div>
      )}

      <Section title="Gates">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <QueryState loading={gates.isPending} error={gates.isError} />
            {gates.data && <GateStrip gates={gates.data} />}
          </div>
          {p && (
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-line lg:border-l lg:pl-6">
              <dt className="text-ink-muted">Built</dt><dd className="tabular text-right font-semibold">{p.physicalPercent}%</dd>
              {p.financialPercent !== null && (<><dt className="text-ink-muted">Paid</dt><dd className="tabular text-right font-semibold">{p.financialPercent}%</dd></>)}
              <dt className="text-ink-muted">Planned by now</dt><dd className="tabular text-right font-semibold">{p.plannedPercent}%</dd>
              {contractSum > 0 && (<><dt className="text-ink-muted">Contract sum</dt><dd className="tabular text-right font-semibold">{formatNaira(contractSum, { compact: true })}</dd></>)}
              {p.weeksBehind > 0 && <dd className="col-span-2 mt-1 font-semibold text-status-construction">{p.weeksBehind} weeks behind the programme</dd>}
            </dl>
          )}
        </div>
      </Section>

      <Section title="Progress along the line" aside={<Link className="font-semibold text-brand-900 underline underline-offset-4" href={`/projects/${id}/progress`}>Progress by lot</Link>}>
        <QueryState loading={strip.isPending} error={strip.isError} />
        {strip.data && <StripMapChart data={strip.data} />}
      </Section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Section title="Latest verified photos" aside={<Link className="font-semibold text-brand-900 underline underline-offset-4" href={`/projects/${id}/photos`}>All photos and reports</Link>}>
          <QueryState loading={photos.isPending} error={photos.isError} empty={latest.length === 0} emptyText="No verified photos yet." />
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {latest.map((s) => (
              <li key={s.id}>
                <PhotoThumb mediaId={s.mediaId} alt={`${s.discipline ?? 'Site'} photo at ${formatChainage(s.chainageM)}`} />
                <p className="mt-2 text-sm font-semibold tabular">{formatChainage(s.chainageM)}</p>
                <p className="text-sm text-ink-muted">{formatDate(s.capturedAt)}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Corridor" aside={<Link className="font-semibold text-brand-900 underline underline-offset-4" href={`/projects/${id}/corridor`}>Open</Link>}>
          {corridor.data && <CorridorMap data={corridor.data} height={300} />}
        </Section>
      </div>
    </div>
  );
}

/** The draft overview from the design: no progress yet, the draft line, and what publishing does. */
function DraftOverview({ gates, review }: { gates: GateRow[] | undefined; review: DraftReview | undefined }) {
  const line = review?.alignment?.geometry.coordinates ?? null;
  return (
    <div className="flex flex-col gap-5">
      <Section title="Gates">{gates && <GateStrip gates={gates} />}</Section>
      <div className="grid gap-5 xl:grid-cols-2">
        <Section title="Corridor (draft)">
          <div className="h-72"><PreviewMap line={line} stations={[]} /></div>
          {review?.stations && review.stations.length > 0 && (
            <p className="mt-2 text-sm text-ink-muted">Stations: {review.stations.map((s) => `${s.name} (${formatChainage(s.chainageM)})`).join(', ')}</p>
          )}
        </Section>
        <div className="flex flex-col gap-5">
          <Section title="Progress">
            <p className="text-lg"><strong>Built 0%, paid 0%.</strong></p>
            <p className="mt-1 text-ink-muted">Progress starts after mobilisation (gate 11).</p>
          </Section>
          <Section title="Latest verified photos">
            <p className="rounded-md border-2 border-dashed border-line p-4 text-ink-muted">No photos yet. They start when lots are created at gate 8.</p>
          </Section>
        </div>
      </div>
      <Section title="What publishing does">
        <p>The Director confirms gate 1 with the PIN, the corridor is drawn on the map for every member, and gates 2 to 15 open. The Permanent Secretary and the Minister can see the project from then on.</p>
      </Section>
    </div>
  );
}
