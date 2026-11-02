'use client';

import { useQuery } from '@tanstack/react-query';
import { getMapCounters } from '@/lib/endpoints';

/** The three numbers the Minister reads first. */
export function Counters() {
  const counters = useQuery({ queryKey: ['map-counters'], queryFn: getMapCounters });
  const c = counters.data;
  const items = [
    { label: 'On track', value: c?.onTrack, colour: 'bg-status-operational' },
    { label: 'Behind', value: c?.behind, colour: 'bg-status-construction' },
    { label: 'Stalled', value: c?.stalled, colour: 'bg-status-stalled' },
  ];
  return (
    <dl className="flex gap-2" aria-live="polite">
      {items.map((i) => (
        <div key={i.label} className="flex min-h-14 items-center gap-3 rounded-md bg-surface/95 px-4 shadow-sm ring-1 ring-line">
          <span aria-hidden className={`size-3 rounded-full ${i.colour}`} />
          <dd className="tabular text-2xl font-semibold">{i.value ?? '–'}</dd>
          <dt className="text-base text-ink-muted">{i.label}</dt>
        </div>
      ))}
    </dl>
  );
}
