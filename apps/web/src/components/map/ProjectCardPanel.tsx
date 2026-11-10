'use client';

import { dayCount, lowerFirst } from '@/lib/format';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getMediaUrl, getProjectCard } from '@/lib/endpoints';
import { CATEGORY_COLOUR, CATEGORY_LABEL, categoryOf, formatKm, formatPhone } from '@/lib/status';

export const CURRENT_PROJECT_KEY = 'fmot.currentProject';

/** W4: the panel that opens when a project is clicked on the map. */
export function ProjectCardPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const card = useQuery({ queryKey: ['card', id], queryFn: () => getProjectCard(id) });
  const photo = useQuery({
    queryKey: ['media', card.data?.latestPhoto?.mediaId],
    queryFn: () => getMediaUrl(card.data!.latestPhoto!.mediaId, 'web'),
    enabled: Boolean(card.data?.latestPhoto),
    staleTime: 4 * 60_000, // signed links last 5 minutes
  });

  return (
    <aside
      aria-labelledby="card-title"
      className="pointer-events-auto flex max-h-full w-full flex-col overflow-y-auto rounded-md bg-surface shadow-lg ring-1 ring-line sm:w-[400px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <h2 id="card-title" className="text-xl font-semibold leading-snug">
          {card.data?.name ?? 'Loading project…'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project card"
          className="-m-2 grid size-12 shrink-0 place-items-center rounded-md text-2xl hover:bg-brand-50"
        >
          ×
        </button>
      </div>

      {card.isError && <p className="p-5 text-danger">This project could not be loaded.</p>}

      {card.data && (
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusChip status={card.data.status} health={card.data.health} />
            {card.data.currentGate && (
              <span className="text-base">
                Gate {card.data.currentGate.no}, {lowerFirst(card.data.currentGate.name)}
                {card.data.daysAtGate !== null && (
                  <span className="text-ink-muted">: {dayCount(card.data.daysAtGate)}</span>
                )}
              </span>
            )}
          </div>

          <p className="text-base text-ink-muted">
            {formatKm(card.data.lengthM)} through {card.data.states.join(' and ') || 'states not yet set'}
          </p>

          {(card.data.physicalPercent !== null || card.data.disciplines.length > 0) && (
            <div className="flex flex-col gap-3">
              <p className="text-base">
                <strong className="tabular">{card.data.physicalPercent ?? 0}%</strong> built
                {card.data.financialPercent !== null && (
                  <>
                    , <strong className="tabular">{card.data.financialPercent}%</strong> paid
                  </>
                )}
              </p>
              {card.data.disciplines.map((d) => (
                <div key={d.name} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
                  <span>{d.name}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-brand-100" aria-hidden>
                    <span className="block h-full rounded-full bg-status-operational" style={{ width: `${d.percent}%` }} />
                  </span>
                  <span className="tabular text-right">{d.percent}%</span>
                </div>
              ))}
            </div>
          )}

          <figure className="flex flex-col gap-2">
            {photo.data ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived URL
              <img src={photo.data.url} alt="Latest verified site photo" className="aspect-video w-full rounded-md object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center rounded-md bg-canvas text-sm text-ink-muted">
                {card.data.latestPhoto ? 'Loading photo…' : 'No verified photo yet'}
              </div>
            )}
            {card.data.latestPhoto && (
              <figcaption className="text-sm text-ink-muted">
                {[
                  card.data.latestPhoto.chainageM !== null ? `km ${(card.data.latestPhoto.chainageM / 1000).toFixed(1)}` : null,
                  card.data.latestPhoto.capturedAt ? new Date(card.data.latestPhoto.capturedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
                  card.data.latestPhoto.verifiedBy ? `verified by ${card.data.latestPhoto.verifiedBy}` : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </figcaption>
            )}
          </figure>

          {card.data.personInCharge && (
            <div className="rounded-md bg-canvas p-4">
              <p className="font-semibold">{card.data.personInCharge.name}</p>
              <p className="text-sm text-ink-muted">{card.data.personInCharge.role}</p>
              <a href={`tel:${card.data.personInCharge.phone}`} className="mt-1 inline-block min-h-11 py-2 font-medium text-brand-900 underline underline-offset-4 tabular">
                {formatPhone(card.data.personInCharge.phone)}
              </a>
            </div>
          )}

          {card.data.blockers.length > 0 && (
            <ul className="flex flex-col gap-2">
              {card.data.blockers.map((b) => (
                <li key={b.text} className="rounded-md border-l-4 border-status-stalled bg-[#fbeaec] p-3 text-base">
                  <span className="font-semibold text-status-stalled">Blocked: </span>
                  {b.text}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/projects/${card.data.id}`}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md bg-brand-900 px-5 font-semibold text-white hover:bg-brand-800"
            >
              Open project
            </Link>
            <button
              type="button"
              onClick={() => localStorage.setItem(CURRENT_PROJECT_KEY, card.data!.id)}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border-2 border-brand-900 px-5 font-semibold text-brand-900 hover:bg-brand-50"
            >
              Set as current
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function StatusChip({ status, health }: { status: Parameters<typeof categoryOf>[0]; health: Parameters<typeof categoryOf>[1] }) {
  const category = categoryOf(status, health);
  return (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-line px-3 text-sm font-semibold">
      <span aria-hidden className="size-2.5 rounded-full" style={{ background: CATEGORY_COLOUR[category] }} />
      {/* One span, so the chip's gap does not open a space before the comma. */}
      <span>
        {CATEGORY_LABEL[category]}
        {health === 'behind' && status !== 'draft' && <span className="text-status-construction">, behind</span>}
      </span>
    </span>
  );
}
