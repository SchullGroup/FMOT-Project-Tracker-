'use client';

import type { MapLayerName } from '@/lib/types';

export const LAYERS: Array<{ name: MapLayerName; label: string; security?: boolean }> = [
  { name: 'legacy-lines', label: 'Legacy lines' },
  { name: 'state-boundaries', label: 'State boundaries' },
  { name: 'stations', label: 'Stations and structures' },
  { name: 'lots', label: 'Lots' },
  { name: 'no-go', label: 'No-go segments', security: true },
];

/** Extra layers on the map, each an on/off switch; the choice is remembered on this device. */
export function LayersPanel({ on, onToggle, canSecurity, failed }: { on: Set<MapLayerName>; onToggle: (n: MapLayerName) => void; canSecurity: boolean; failed: Set<MapLayerName> }) {
  return (
    <section aria-labelledby="layers-heading" className="m-5 mt-0 rounded-md bg-surface p-4 ring-1 ring-line">
      <h2 id="layers-heading" className="mb-2 text-lg font-semibold">Layers</h2>
      <ul className="flex flex-col">
        {LAYERS.filter((l) => !l.security || canSecurity).map((l) => (
          <li key={l.name}>
            <button
              type="button"
              role="switch"
              aria-checked={on.has(l.name)}
              onClick={() => onToggle(l.name)}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded px-1 text-left hover:bg-brand-50"
            >
              <span>
                {l.label}
                {failed.has(l.name) && <span className="block text-sm text-danger">Could not be loaded</span>}
              </span>
              <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on.has(l.name) ? 'bg-brand-900' : 'bg-line-strong'}`}>
                <span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${on.has(l.name) ? 'left-6' : 'left-1'}`} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
