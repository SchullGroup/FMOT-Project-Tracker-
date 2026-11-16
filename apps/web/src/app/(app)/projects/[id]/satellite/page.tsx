'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useProjectId } from '@/components/project/ProjectFrame';
import { SkyfiPanel } from '@/components/project/SkyfiPanel';
import { QueryState, Section } from '@/components/ui/Section';
import { getCorridor, getSatellite } from '@/lib/endpoints';
import { formatDate } from '@/lib/format';
import type { SatelliteScene } from '@/lib/types';

const SatelliteMap = dynamic(() => import('@/components/project/SatelliteMap').then((m) => m.SatelliteMap), { ssr: false });

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex min-h-11 items-center gap-3 rounded px-1 text-left hover:bg-brand-50">
      <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-900' : 'bg-line-strong'}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
      </span>
      {label}
    </button>
  );
}

/** W5.14 Satellite: free Sentinel-2 pictures of the corridor over time, one date at a time or two side by side. */
export default function SatellitePage() {
  const id = useProjectId();
  const timeline = useQuery({ queryKey: ['satellite', id], queryFn: () => getSatellite(id) });
  const corridor = useQuery({ queryKey: ['corridor', id], queryFn: () => getCorridor(id) });
  const [showCloudy, setShowCloudy] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [split, setSplit] = useState(50);

  const all = timeline.data?.scenes ?? [];
  const cloudy = all.filter((s) => s.hiddenByDefault).length;
  const listed = showCloudy ? all : all.filter((s) => !s.hiddenByDefault);
  const chosen = listed.find((s) => s.id === chosenId) ?? listed[0];
  // Before: the chosen earlier date, else the oldest listed one before the picture shown.
  const earlier = listed.filter((s) => chosen && s.takenAt < chosen.takenAt);
  const before = comparing ? (earlier.find((s) => s.id === beforeId) ?? earlier[earlier.length - 1] ?? null) : null;
  const label = (s: SatelliteScene) => `${formatDate(s.takenAt)}, ${s.cloudCoverPercent}% cloud`;

  return (
    <div className="flex flex-col gap-5">
      <Section title="Satellite pictures" aside={<p className="max-w-xl text-sm text-ink-muted">Free pictures every few days. Each dot is 10 m, so large changes show, small details do not.</p>}>
        <QueryState loading={timeline.isPending} error={timeline.isError} empty={timeline.data?.scenes.length === 0} emptyText="No pictures yet. New ones are looked for every night once the project is published." />
        {timeline.data?.paused && (
          <p role="status" className="mb-4 rounded-md bg-[#fff4e0] p-3 text-[#7a4a00]">New picture tiles are paused until next month. Parts already viewed still show.</p>
        )}
        {all.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">{listed.length} picture{listed.length === 1 ? '' : 's'}, newest first</h3>
              {cloudy > 0 && <Switch on={showCloudy} onChange={setShowCloudy} label={`Show cloudy pictures (${cloudy})`} />}
            </div>
            <ul className="flex gap-2 overflow-x-auto pb-2" aria-label="Picture dates">
              {listed.map((s) => {
                const active = s.id === chosen?.id;
                return (
                  <li key={s.id} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setChosenId(s.id)}
                      className={`flex min-h-14 flex-col items-start rounded-md px-3 py-2 text-left ring-1 ${active ? 'bg-brand-900 text-white ring-brand-900' : 'bg-surface ring-line hover:bg-brand-50'} ${s.hiddenByDefault && !active ? 'border-2 border-dashed border-line-strong' : ''}`}
                    >
                      <span className="whitespace-nowrap font-semibold">{formatDate(s.takenAt)}</span>
                      <span className={`whitespace-nowrap text-sm ${active ? 'text-white/85' : 'text-ink-muted'}`}>{s.cloudCoverPercent}% cloud{s.coveragePercent < 90 ? `, covers ${s.coveragePercent}%` : ''}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {listed.length === 0 && <p>Every picture is cloudy. Switch on &ldquo;Show cloudy pictures&rdquo; to see them.</p>}

            {chosen && (
              <>
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                  <Switch on={comparing} onChange={setComparing} label="Compare two dates" />
                  {comparing && earlier.length > 0 && (
                    <>
                      <label className="flex flex-col gap-1 text-sm font-medium">
                        Before (left)
                        <select value={before?.id ?? ''} onChange={(e) => setBeforeId(e.target.value)} className="min-h-11 rounded-md border-2 border-line-strong bg-surface px-3 text-base font-normal">
                          {earlier.map((s) => <option key={s.id} value={s.id}>{label(s)}</option>)}
                        </select>
                      </label>
                      <p className="pb-2 text-sm">After (right): <strong>{label(chosen)}</strong>. Pick another date above to change it.</p>
                    </>
                  )}
                  {comparing && earlier.length === 0 && <p className="pb-2 text-sm">Pick a later date above: there is nothing earlier than this one to compare with.</p>}
                </div>
                {timeline.data && (corridor.data || corridor.isError) && (
                  <SatelliteMap scene={chosen} before={before} split={split} corridor={corridor.data} bounds={timeline.data.bounds} minZoom={timeline.data.minZoom} maxZoom={timeline.data.maxZoom} skyfiBelow={!!timeline.data.skyfiPreviews} />
                )}
                {before && (
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Slide to compare {formatDate(before.takenAt)} (left) with {formatDate(chosen.takenAt)} (right)
                    <input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(Number(e.target.value))} className="min-h-11 w-full accent-brand-900" />
                  </label>
                )}
                <p className="text-sm text-ink-muted">Each picture covers the corridor only, the strip either side of the line, and shows once zoomed in on it. Lots, stations and verified photos are drawn on top.</p>
              </>
            )}
          </div>
        )}
      </Section>
      {timeline.data?.skyfiPreviews && <SkyfiPanel projectId={id} corridor={corridor.data} />}
    </div>
  );
}
