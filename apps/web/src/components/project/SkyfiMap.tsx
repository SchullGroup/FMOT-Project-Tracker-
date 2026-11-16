'use client';

import { createMap } from '@/lib/basemap';
import { SATELLITE_AVAILABLE } from '@/lib/map';
import { LngLatBounds, NavigationControl, setWorkerUrl, type Map as MlMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { addOverlays } from './SatelliteMap';
import type { SkyfiResult } from '@/lib/types';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

export const SKYFI_PREVIEW_LABEL = 'SkyFi preview, not bought, lower quality';

interface Props {
  /** The lot's search area: 500 m either side of its stretch of line. */
  area: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  result: SkyfiResult | null;
  corridor?: GeoJSON.FeatureCollection;
}

const boundsOf = (g: GeoJSON.Polygon | GeoJSON.MultiPolygon) => {
  const b = new LngLatBounds();
  const rings = g.type === 'Polygon' ? g.coordinates : g.coordinates.flat();
  for (const ring of rings) for (const p of ring) b.extend(p as [number, number]);
  return b;
};

// The chosen preview: its tiles in place, inside its footprint, under our line and lots.
function showPreview(m: MlMap, r: SkyfiResult | null) {
  for (const id of ['preview', 'footprint']) {
    if (m.getLayer(id)) m.removeLayer(id);
    if (m.getSource(id)) m.removeSource(id);
  }
  if (!r?.footprint) return;
  const below = ['line-casing', 'line', 'lot-casing', 'lot', 'station'].find((id) => m.getLayer(id));
  const box = boundsOf(r.footprint);
  if (r.tiles) {
    m.addSource('preview', {
      type: 'raster',
      tiles: [`${window.location.origin}${r.tiles}`],
      tileSize: 256,
      minzoom: r.minZoom,
      maxzoom: r.maxZoom,
      bounds: [box.getWest(), box.getSouth(), box.getEast(), box.getNorth()],
    });
    m.addLayer({ id: 'preview', type: 'raster', source: 'preview', paint: { 'raster-fade-duration': 0 } }, below);
  }
  m.addSource('footprint', { type: 'geojson', data: r.footprint });
  m.addLayer({ id: 'footprint', type: 'line', source: 'footprint', paint: { 'line-color': '#ffd23f', 'line-width': 2 } }, below);
  m.fitBounds(box, { padding: 40, maxZoom: 14, duration: 0 });
}

/** The SkyFi test's map: the Esri background, the lot's search area, the chosen preview in its place, our line on top. */
export function SkyfiMap({ area, result, corridor }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const ready = useRef(false);
  const shown = useRef<SkyfiResult | null>(null);
  shown.current = result;

  useEffect(() => {
    if (!box.current) return;
    const m = createMap({ container: box.current, bounds: boundsOf(area), fitBoundsOptions: { padding: 30 } }, SATELLITE_AVAILABLE ? 'satellite' : 'map');
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    const ro = new ResizeObserver(() => m.resize());
    if (box.current.parentElement) ro.observe(box.current.parentElement);
    m.on('load', () => {
      m.addSource('area', { type: 'geojson', data: area });
      m.addLayer({ id: 'area', type: 'line', source: 'area', paint: { 'line-color': '#ffffff', 'line-width': 1.5, 'line-dasharray': [3, 2] } });
      if (corridor) addOverlays(m, corridor);
      ready.current = true;
      showPreview(m, shown.current);
    });
    map.current = m;
    return () => {
      ready.current = false;
      ro.disconnect();
      m.remove();
      map.current = null;
    };
  }, [area, corridor]);

  useEffect(() => {
    if (map.current && ready.current) showPreview(map.current, result);
  }, [result?.archiveId]);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-md ring-1 ring-line">
      <div className="absolute inset-0">
        <div ref={box} className="h-full w-full" role="region" aria-label={result ? `${SKYFI_PREVIEW_LABEL}, on the map` : 'Map of the lot’s search area'} />
      </div>
      {result && (
        <p className="pointer-events-none absolute left-2 top-2 rounded bg-[#fff4e0] px-2 py-1 text-[13px] font-semibold text-[#7a4a00] shadow-sm">
          {SKYFI_PREVIEW_LABEL}
        </p>
      )}
    </div>
  );
}
