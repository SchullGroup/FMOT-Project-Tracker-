'use client';

import { createMap } from '@/lib/basemap';
import { SATELLITE_AVAILABLE } from '@/lib/map';
import { LngLatBounds, NavigationControl, setWorkerUrl, type Map as MlMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import type { ChangeFlagSegment } from '@/lib/types';
import { showFlags, showFocus } from './flag-layers';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

/**
 * The experimental flags on their own map, for the IT administrator: the line in orange on the satellite background,
 * the flags as a band beside it (kilometres and dates on hover) and the stretch picked from a list marked and fitted.
 */
export function FlagsMap({ segments, focus }: { segments: ChangeFlagSegment[]; focus: { key: string; line: GeoJSON.LineString } | null }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const ready = useRef(false);
  const latest = useRef(focus);
  latest.current = focus;

  useEffect(() => {
    if (!box.current || !segments.length) return;
    const bounds = new LngLatBounds();
    for (const s of segments) for (const p of s.line.coordinates) bounds.extend(p as [number, number]);
    const m = createMap({ container: box.current, bounds, fitBoundsOptions: { padding: 30 } }, SATELLITE_AVAILABLE ? 'satellite' : 'map');
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    const ro = new ResizeObserver(() => m.resize());
    if (box.current.parentElement) ro.observe(box.current.parentElement);
    m.on('load', () => {
      const line: GeoJSON.Feature = { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: segments.map((s) => s.line.coordinates) } };
      m.addSource('line', { type: 'geojson', data: line });
      m.addLayer({ id: 'line-casing', type: 'line', source: 'line', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 7 } });
      m.addLayer({ id: 'line', type: 'line', source: 'line', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#c76f0a', 'line-width': 3.5 } });
      showFlags(m, segments);
      ready.current = true;
      showFocus(m, latest.current, 'line-casing');
    });
    map.current = m;
    return () => {
      ready.current = false;
      ro.disconnect();
      m.remove();
      map.current = null;
    };
  }, [segments]);

  useEffect(() => {
    if (map.current && ready.current) showFocus(map.current, focus, 'line-casing');
  }, [focus?.key]);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-md ring-1 ring-line">
      <div className="absolute inset-0">
        <div ref={box} className="h-full w-full" role="region" aria-label="Map of the experimental change flags beside the line" />
      </div>
    </div>
  );
}
