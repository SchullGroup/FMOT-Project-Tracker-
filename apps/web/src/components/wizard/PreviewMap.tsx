'use client';

import { ATTRIBUTION, STYLE_URL } from '@/lib/map';
import { LngLatBounds, Map as MlMap, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

/*
 * The map beside the wizard. Shows the dashed placeholder between the two
 * towns until the real alignment is uploaded, then the real line (still
 * dashed: it is a draft) with its stations.
 */
export function PreviewMap({ line, stations }: { line: [number, number][] | null; stations: Array<{ name: string; at: [number, number] }> }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const ready = useRef(false);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!box.current) return;
    const m = new MlMap({ container: box.current, style: STYLE_URL, bounds: [[2.6, 4.2], [14.7, 13.9]], fitBoundsOptions: { padding: 20 }, attributionControl: ATTRIBUTION });
    // Redraw when the box changes size (a map created in a box still being laid out comes out squashed).
    const ro = new ResizeObserver(() => m.resize());
    if (m.getContainer().parentElement) ro.observe(m.getContainer().parentElement!);
    map.current = m;
    m.on('load', () => {
      m.addSource('line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addSource('stations', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({ id: 'line-casing', type: 'line', source: 'line', paint: { 'line-color': '#ffffff', 'line-width': 9 } });
      m.addLayer({ id: 'line', type: 'line', source: 'line', paint: { 'line-color': '#5b6573', 'line-width': 5, 'line-dasharray': [2, 1.5] } });
      m.addLayer({ id: 'stations', type: 'circle', source: 'stations', paint: { 'circle-radius': 6, 'circle-color': '#ffffff', 'circle-stroke-color': '#0b2545', 'circle-stroke-width': 2.5 } });
      ready.current = true;
      pending.current?.();
      pending.current = null;
    });
    return () => {
      ro.disconnect();
      ready.current = false;
      m.remove();
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const apply = () => {
      (m.getSource('line') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: line ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: line } }] : [],
      });
      (m.getSource('stations') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: stations.map((s) => ({ type: 'Feature', properties: { name: s.name }, geometry: { type: 'Point', coordinates: s.at } })),
      });
      if (line && line.length > 1) {
        const b = line.reduce((acc, c) => acc.extend(c), new LngLatBounds(line[0], line[0]));
        m.fitBounds(b, { padding: 60, maxZoom: 8, animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches });
      }
    };
    if (ready.current) apply();
    else pending.current = apply;
  }, [line, stations]);

  return (
    <div className="relative h-full min-h-80 overflow-hidden rounded-md ring-1 ring-line">
      <div className="absolute inset-0">
        <div ref={box} className="h-full w-full" role="img" aria-label="Preview of the project line on the map of Nigeria" />
      </div>
      <p className="absolute left-3 top-3 rounded bg-surface/95 px-3 py-1 text-sm font-medium shadow-sm">
        {line ? 'Draft: only you and the Director see this' : 'The line appears once both towns are chosen'}
      </p>
    </div>
  );
}
