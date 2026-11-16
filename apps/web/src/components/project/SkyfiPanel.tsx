'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { QueryState, Section } from '@/components/ui/Section';
import { ApiError } from '@/lib/api';
import { getLots, getSkyfiPreviews } from '@/lib/endpoints';
import { formatChainage, formatDate } from '@/lib/format';
import { SKYFI_PREVIEW_LABEL } from './SkyfiMap';

const SkyfiMap = dynamic(() => import('./SkyfiMap').then((m) => m.SkyfiMap), { ssr: false });

const usd = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD', maximumFractionDigits: n < 100 ? 2 : 0 }).format(n);
const km2 = (n: number) => `${n < 1 ? n.toFixed(2) : n < 10 ? n.toFixed(1) : Math.round(n)} km²`;

/**
 * W5.14 SkyFi previews (test): SkyFi's archive of commercial pictures over one lot's corridor, with the free previews.
 * Search and look only: nothing is ordered or paid for. The project manager and the Director, when the API has a key.
 */
export function SkyfiPanel({ projectId, corridor, initialLotId }: { projectId: string; corridor?: GeoJSON.FeatureCollection; initialLotId?: string | null }) {
  const lots = useQuery({ queryKey: ['lots', projectId], queryFn: () => getLots(projectId) });
  const [lotId, setLotId] = useState('');
  const [chosenId, setChosenId] = useState<string | null>(null);
  // A lot named in the link ("SkyFi previews for Lot 3" in Where to look) is searched straight away.
  useEffect(() => {
    if (initialLotId) {
      setLotId(initialLotId);
      setChosenId(null);
    }
  }, [initialLotId]);
  const search = useQuery({ queryKey: ['skyfi', projectId, lotId], queryFn: () => getSkyfiPreviews(projectId, lotId), enabled: !!lotId, retry: false, staleTime: 3_600_000 });
  const data = search.data;
  const chosen = data?.results.find((r) => r.archiveId === chosenId) ?? null;
  const refused = search.error instanceof ApiError ? search.error.message : null;

  return (
    <Section title="SkyFi previews (test)" aside={<p className="max-w-xl text-sm text-ink-muted">Sharper pictures from SkyFi&rsquo;s archive. Search and free previews only: nothing here orders or pays.</p>}>
      <div className="flex flex-col gap-4">
        <label className="flex max-w-sm flex-col gap-1 text-sm font-medium">
          Lot
          <select
            value={lotId}
            onChange={(e) => {
              setLotId(e.target.value);
              setChosenId(null);
            }}
            className="min-h-11 rounded-md border-2 border-line-strong bg-surface px-3 text-base font-normal"
          >
            <option value="">Choose a lot</option>
            {(lots.data ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}, {formatChainage(l.chainageFromM)} to {formatChainage(l.chainageToM)}
              </option>
            ))}
          </select>
        </label>

        {lotId && search.isPending && <p className="text-ink-muted">Searching SkyFi… this takes a few seconds the first time each day.</p>}
        {search.isError && <p role="alert" className="rounded-md bg-[#fdecea] p-3 text-danger">SkyFi search failed: {refused ?? 'it could not be reached.'}</p>}
        {data && (
          <>
            <p className="text-sm">
              <strong>{data.results.length} picture{data.results.length === 1 ? '' : 's'}</strong> at {data.filters.maxDetailCm} cm or sharper, {data.filters.maxCloudPercent}% cloud or less, taken in the last {data.filters.months} months, over {km2(data.areaKm2)} ({data.filters.corridorM} m either side of the line from {formatChainage(data.lot.chainageFromM)} to {formatChainage(data.lot.chainageToM)}). Searched {formatDate(data.searchedAt)}; kept for a day.
            </p>
            <QueryState loading={false} error={false} empty={data.results.length === 0} emptyText="SkyFi has no pictures of this lot that match." />
            {data.results.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                <ul className="flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1" aria-label="SkyFi pictures, newest first">
                  {data.results.map((r) => {
                    const active = r.archiveId === chosen?.archiveId;
                    return (
                      <li key={r.archiveId}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => setChosenId(r.archiveId)}
                          className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left ring-1 ${active ? 'bg-brand-900 text-white ring-brand-900' : 'bg-surface ring-line hover:bg-brand-50'}`}
                        >
                          <span className="flex w-full justify-between gap-2 font-semibold">
                            <span>{formatDate(r.takenAt)}</span>
                            <span>{usd(r.estimatedPriceUsd)}</span>
                          </span>
                          <span className={`text-sm ${active ? 'text-white/85' : 'text-ink-muted'}`}>
                            {r.detailCm} cm, {r.cloudCoverPercent}% cloud, covers {km2(r.overlapKm2)} of the lot ({r.overlapPercent}%)
                          </span>
                          <span className={`text-sm ${active ? 'text-white/85' : 'text-ink-muted'}`}>
                            {r.provider === 'VANTOR' ? 'Vantor' : r.provider} {r.constellation.toUpperCase()}, {usd(r.pricePerKm2Usd)} a km², at least {km2(r.minOrderKm2)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-col gap-3">
                  <SkyfiMap area={data.area} result={chosen} corridor={corridor} />
                  {chosen ? (
                    <div className="flex flex-wrap items-start gap-4">
                      {chosen.preview && (
                        <figure className="flex flex-col gap-1">
                          {/* eslint-disable-next-line @next/next/no-img-element -- a signed API link, not a static asset */}
                          <img src={chosen.preview} alt={`${SKYFI_PREVIEW_LABEL}: the whole picture of ${formatDate(chosen.takenAt)}`} className="h-48 w-48 rounded bg-[#f3f4f6] object-contain ring-1 ring-line" />
                          <figcaption className="max-w-48 text-[13px] font-semibold text-[#7a4a00]">{SKYFI_PREVIEW_LABEL}</figcaption>
                        </figure>
                      )}
                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        <dt className="text-ink-muted">Taken</dt>
                        <dd>{formatDate(chosen.takenAt)}</dd>
                        <dt className="text-ink-muted">Detail</dt>
                        <dd>{chosen.detailCm} cm a dot{chosen.offNadirDegrees !== null ? `, ${Math.abs(chosen.offNadirDegrees)}° off straight down` : ''}</dd>
                        <dt className="text-ink-muted">Cloud</dt>
                        <dd>{chosen.cloudCoverPercent}%</dd>
                        <dt className="text-ink-muted">Area</dt>
                        <dd>{km2(chosen.overlapKm2)} of the lot&rsquo;s {km2(data.areaKm2)}; the whole picture is {km2(chosen.sceneKm2)}</dd>
                        <dt className="text-ink-muted">Price</dt>
                        <dd>
                          About {usd(chosen.estimatedPriceUsd)} for the lot&rsquo;s part ({usd(chosen.pricePerKm2Usd)} a km², at least {km2(chosen.minOrderKm2)}). SkyFi&rsquo;s list price; it confirms the price only when ordering.
                        </dd>
                      </dl>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-muted">Pick a picture to see its preview. The dashed line is the area searched; the yellow outline is the picture.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}
