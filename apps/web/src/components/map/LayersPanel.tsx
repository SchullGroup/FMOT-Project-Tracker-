'use client';

import { useBasemap, type Basemap } from '@/lib/basemap';
import { SATELLITE_AVAILABLE } from '@/lib/map';
import type { MapLayerName } from '@/lib/types';

export const LAYERS: Array<{ name: MapLayerName; label: string; security?: boolean }> = [
  { name: 'legacy-lines', label: 'Legacy lines' },
  { name: 'state-boundaries', label: 'State boundaries' },
  { name: 'stations', label: 'Stations and structures' },
  { name: 'lots', label: 'Lots' },
  { name: 'no-go', label: 'No-go segments', security: true },
  { name: 'latest-picture', label: 'Latest clear picture' },
];

const BASEMAPS: Array<{ value: Basemap; label: string }> = [
  { value: 'map', label: 'Map' },
  { value: 'satellite', label: 'Satellite' },
];

/**
 * Map or satellite under every map (hidden when no satellite imagery is set up), then the extra layers, each an
 * on/off switch. Both choices are remembered on this device. The layers come from the projects the person may see, so
 * a role without projects (`projectLayers` false) gets the background switch only, or no panel at all.
 */
export function LayersPanel({
  on,
  onToggle,
  canSecurity,
  projectLayers = true,
  failed,
}: {
  on: Set<MapLayerName>;
  onToggle: (n: MapLayerName) => void;
  canSecurity: boolean;
  projectLayers?: boolean;
  failed: Set<MapLayerName>;
}) {
  const [basemap, setBasemap] = useBasemap();
  if (!projectLayers && !SATELLITE_AVAILABLE) return null;
  return (
    <section aria-labelledby="layers-heading" className="rounded-md lg:w-60 bg-surface/95 p-3 shadow-sm ring-1 ring-line">
      <h2 id="layers-heading" className="px-1 pb-1 font-semibold">Layers</h2>
      {SATELLITE_AVAILABLE && (
        <div role="radiogroup" aria-label="Background" className="mb-2 grid grid-cols-2 gap-1 rounded-md bg-canvas p-1 ring-1 ring-line">
          {BASEMAPS.map((b) => (
            <button
              key={b.value}
              type="button"
              role="radio"
              aria-checked={basemap === b.value}
              onClick={() => setBasemap(b.value)}
              className={`min-h-11 rounded font-medium ${basemap === b.value ? 'bg-brand-900 text-white shadow-sm' : 'hover:bg-brand-50'}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
      <ul className="flex flex-col">
        {LAYERS.filter((l) => projectLayers && (!l.security || canSecurity)).map((l) => (
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
                {l.name === 'latest-picture' && on.has(l.name) && !failed.has(l.name) && <span className="block text-sm text-ink-muted">Zoom in on a line to see it</span>}
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
