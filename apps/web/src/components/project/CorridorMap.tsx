'use client';

import { createMap, setBasemap, useBasemap } from '@/lib/basemap';
import { NavigationControl, LngLatBounds, setWorkerUrl, type GeoJSONSource, type Map as MlMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

/** W5.3: one project's corridor with lots, stations, verified photos and incidents. */
export function CorridorMap({ data, height = 480 }: { data: GeoJSON.FeatureCollection; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const ready = useRef(false);
  const [basemap] = useBasemap();
  const wantedBasemap = useRef(basemap);
  const shownBasemap = useRef(basemap);

  // Map or satellite under the line, once the map has loaded and any swap under way is done; only the latest choice
  // counts.
  const followBasemap = () => {
    const m = map.current;
    if (!m || !ready.current || wantedBasemap.current === shownBasemap.current) return;
    shownBasemap.current = wantedBasemap.current;
    ready.current = false;
    setBasemap(m, shownBasemap.current, () => {
      ready.current = true;
      followBasemap();
    });
  };

  useEffect(() => {
    if (!box.current) return;
    shownBasemap.current = wantedBasemap.current;
    const m = createMap({ container: box.current }, shownBasemap.current);
    map.current = m;
    // The overview's inset is small: smaller station dots so they do not crowd the line.
    const small = height < 400;
    // Redraw when the box changes size (a map created in a box still being laid out comes out squashed).
    const ro = new ResizeObserver(() => {
      m.resize();
      if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 40, animate: false });
    });
    if (m.getContainer().parentElement) ro.observe(m.getContainer().parentElement!);
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    // Opens on the line, its lots and stations. Photos and incidents are left out: one sent from far off (a phone
    // somewhere else) would zoom the map out to the whole country. Only with no line do they set the view.
    const bounds = new LngLatBounds();
    const extend = (f: GeoJSON.Feature) => {
      const g = f.geometry;
      if (g.type === 'Point') bounds.extend(g.coordinates as [number, number]);
      if (g.type === 'LineString') g.coordinates.forEach((c) => bounds.extend(c as [number, number]));
    };
    const onLine = data.features.filter((f) => ['line', 'lot', 'station'].includes(f.properties?.kind));
    (onLine.length ? onLine : data.features).forEach(extend);
    if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 40, animate: false });

    ready.current = false;
    m.on('load', () => {
      m.addSource('corridor', { type: 'geojson', data });
      (m.getSource('corridor') as GeoJSONSource).setData(data);
      // The whole line in grey under the lots: the route even where no lot has started (or none exists yet). Lines
      // have a white outline so they stay readable on the dark imagery.
      m.addLayer({ id: 'line-casing', type: 'line', source: 'corridor', filter: ['==', ['get', 'kind'], 'line'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 9 } });
      m.addLayer({ id: 'line', type: 'line', source: 'corridor', filter: ['==', ['get', 'kind'], 'line'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#8a94a6', 'line-width': 5 } });
      m.addLayer({ id: 'lot-casing', type: 'line', source: 'corridor', filter: ['==', ['get', 'kind'], 'lot'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 11 } });
      m.addLayer({
        id: 'lot',
        type: 'line',
        source: 'corridor',
        filter: ['==', ['get', 'kind'], 'lot'],
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': ['match', ['get', 'state'], 'complete', '#2f7a3e', '#c76f0a'], 'line-width': 7 },
      });
      m.addLayer({ id: 'station', type: 'circle', source: 'corridor', filter: ['==', ['get', 'kind'], 'station'], paint: { 'circle-radius': small ? 4 : 7, 'circle-color': '#ffffff', 'circle-stroke-color': '#0b2545', 'circle-stroke-width': small ? 1.5 : 2.5 } });
      m.addLayer({ id: 'photo', type: 'circle', source: 'corridor', filter: ['==', ['get', 'kind'], 'photo'], paint: { 'circle-radius': 6, 'circle-color': '#2f6fde', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
      m.addLayer({ id: 'incident', type: 'circle', source: 'corridor', filter: ['==', ['get', 'kind'], 'incident'], paint: { 'circle-radius': 7, 'circle-color': '#b00020', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
      ready.current = true;
      followBasemap();
    });
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
    };
  }, [data]);

  useEffect(() => {
    wantedBasemap.current = basemap;
    followBasemap();
  }, [basemap]);

  return (
    <div className="relative overflow-hidden rounded-md ring-1 ring-line" style={{ height }}>
      <div className="absolute inset-0">
        <div ref={box} className="h-full w-full" role="region" aria-label="Map of the project corridor" />
      </div>
    </div>
  );
}
