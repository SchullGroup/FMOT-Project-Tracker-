'use client';

import { ATTRIBUTION, STYLE_URL } from '@/lib/map';
import { Map as MlMap, NavigationControl, LngLatBounds, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

/** W5.3: one project's corridor with lots, stations, verified photos and incidents. */
export function CorridorMap({ data }: { data: GeoJSON.FeatureCollection }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!box.current) return;
    const m = new MlMap({ container: box.current, style: STYLE_URL, attributionControl: ATTRIBUTION });
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    const bounds = new LngLatBounds();
    for (const f of data.features) {
      const g = f.geometry;
      if (g.type === 'Point') bounds.extend(g.coordinates as [number, number]);
      if (g.type === 'LineString') g.coordinates.forEach((c) => bounds.extend(c as [number, number]));
    }
    if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 60, animate: false });

    m.on('load', () => {
      m.addSource('corridor', { type: 'geojson', data });
      (m.getSource('corridor') as GeoJSONSource).setData(data);
      m.addLayer({ id: 'lot-casing', type: 'line', source: 'corridor', filter: ['==', ['get', 'kind'], 'lot'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 11 } });
      m.addLayer({
        id: 'lot',
        type: 'line',
        source: 'corridor',
        filter: ['==', ['get', 'kind'], 'lot'],
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': ['match', ['get', 'state'], 'complete', '#2f7a3e', '#c76f0a'], 'line-width': 7 },
      });
      m.addLayer({ id: 'station', type: 'circle', source: 'corridor', filter: ['==', ['get', 'kind'], 'station'], paint: { 'circle-radius': 7, 'circle-color': '#ffffff', 'circle-stroke-color': '#0b2545', 'circle-stroke-width': 2.5 } });
      m.addLayer({ id: 'photo', type: 'circle', source: 'corridor', filter: ['==', ['get', 'kind'], 'photo'], paint: { 'circle-radius': 6, 'circle-color': '#2f6fde', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
      m.addLayer({ id: 'incident', type: 'circle', source: 'corridor', filter: ['==', ['get', 'kind'], 'incident'], paint: { 'circle-radius': 7, 'circle-color': '#b00020', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
    });
    return () => m.remove();
  }, [data]);

  return (
    <div className="relative h-[480px] overflow-hidden rounded-md ring-1 ring-line">
      <div className="absolute inset-0">
        <div ref={box} className="h-full w-full" role="region" aria-label="Map of the project corridor" />
      </div>
    </div>
  );
}
