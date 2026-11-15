'use client';

import { AttributionControl, Map as MlMap, NavigationControl, setWorkerUrl, type StyleSpecification } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { esriStyle, LABEL_FONT } from '@/lib/basemap';
import { ESRI_IMAGERY_KEY, MAP_CREDITS, SATELLITE_STYLE_URL } from '@/lib/map';
import { ROUTES, snapToLines } from '@/lib/sample-routes';
import { CATEGORY_COLOUR } from '@/lib/status';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

// Kaduna–Kano as on the sample map: the real line from OpenStreetMap (src/lib/sample-routes.ts), with its towns on it.
const LINE = ROUTES['p-kk']!;
const TOWNS: Array<{ name: string; at: [number, number] }> = [
  { name: 'Kaduna', at: LINE[0]! },
  { name: 'Zaria', at: snapToLines([LINE], [7.71, 11.08])! },
  { name: 'Kano', at: LINE[LINE.length - 1]! },
];
const WHOLE_LINE: [[number, number], [number, number]] = [
  [Math.min(...LINE.map((p) => p[0])), Math.min(...LINE.map((p) => p[1]))],
  [Math.max(...LINE.map((p) => p[0])), Math.max(...LINE.map((p) => p[1]))],
];

function drawLine(m: MlMap) {
  m.addSource('kk', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: LINE } } });
  m.addSource('kk-towns', { type: 'geojson', data: { type: 'FeatureCollection', features: TOWNS.map((t) => ({ type: 'Feature', properties: { name: t.name }, geometry: { type: 'Point', coordinates: t.at } })) } });
  m.addLayer({ id: 'kk-casing', type: 'line', source: 'kk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 10, 'line-opacity': 0.9 } });
  m.addLayer({ id: 'kk-line', type: 'line', source: 'kk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': CATEGORY_COLOUR.construction, 'line-width': 6 } });
  m.addLayer({ id: 'kk-towns', type: 'circle', source: 'kk-towns', paint: { 'circle-radius': 6, 'circle-color': '#ffffff', 'circle-stroke-color': '#0b2545', 'circle-stroke-width': 2.5 } });
  if (m.getStyle().glyphs) {
    m.addLayer({ id: 'kk-towns-label', type: 'symbol', source: 'kk-towns', layout: { 'text-field': ['get', 'name'], 'text-font': LABEL_FONT, 'text-size': 13, 'text-offset': [0.9, 0], 'text-anchor': 'left' }, paint: { 'text-color': '#1b2430', 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 } });
  }
}

/*
 * Development only (/dev/basemaps): the satellite style from NEXT_PUBLIC_SATELLITE_STYLE_URL (MapTiler) beside Esri
 * World Imagery (with NEXT_PUBLIC_ESRI_IMAGERY_KEY, else Esri's public server), moving together, on Kaduna–Kano.
 */
export function BasemapCompare() {
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const maps = useRef<MlMap[]>([]);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    const panes: Array<[HTMLDivElement | null, string | StyleSpecification | null]> = [
      [left.current, SATELLITE_STYLE_URL],
      [right.current, esriStyle(ESRI_IMAGERY_KEY)],
    ];
    const made = panes.flatMap(([box, style]) => {
      if (!box || !style) return [];
      const m = new MlMap({ container: box, style, bounds: WHOLE_LINE, fitBoundsOptions: { padding: 60 }, attributionControl: false });
      m.addControl(new AttributionControl({ compact: false, customAttribution: MAP_CREDITS }));
      m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      m.on('load', () => drawLine(m));
      return [m];
    });
    // Whichever map is moved, the other follows.
    let syncing = false;
    for (const m of made) {
      m.on('move', () => {
        setZoom(m.getZoom());
        if (syncing) return;
        syncing = true;
        for (const other of made) if (other !== m) other.jumpTo({ center: m.getCenter(), zoom: m.getZoom(), bearing: m.getBearing(), pitch: m.getPitch() });
        syncing = false;
      });
    }
    maps.current = made;
    setZoom(made[0]?.getZoom() ?? null);
    return () => {
      made.forEach((m) => m.remove());
      maps.current = [];
    };
  }, []);

  const go = (at: [number, number]) => maps.current[0]?.jumpTo({ center: at, zoom: 16 });
  const whole = () => maps.current[0]?.fitBounds(WHOLE_LINE, { padding: 60, animate: false });

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <h1 className="font-semibold">Satellite imagery: MapTiler and Esri on Kaduna–Kano (development only)</h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={whole} className="min-h-11 rounded-md px-3 ring-1 ring-line hover:bg-brand-50">Whole line</button>
          {TOWNS.map((t) => (
            <button key={t.name} type="button" onClick={() => go(t.at)} className="min-h-11 rounded-md px-3 ring-1 ring-line hover:bg-brand-50">
              {t.name} at zoom 16
            </button>
          ))}
        </div>
        <p className="ml-auto text-sm text-ink-muted" role="status">Zoom {zoom?.toFixed(1) ?? '–'}</p>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <Pane title="MapTiler (NEXT_PUBLIC_SATELLITE_STYLE_URL)" box={left} missing={SATELLITE_STYLE_URL ? null : 'Set NEXT_PUBLIC_SATELLITE_STYLE_URL in apps/web/.env.local to see this side.'} />
        <Pane title={ESRI_IMAGERY_KEY ? 'Esri World Imagery (NEXT_PUBLIC_ESRI_IMAGERY_KEY)' : 'Esri World Imagery (public server, no key: development only)'} box={right} missing={null} />
      </div>
    </main>
  );
}

function Pane({ title, box, missing }: { title: string; box: React.RefObject<HTMLDivElement | null>; missing: string | null }) {
  return (
    <section className="relative min-h-80 border-line md:border-l" aria-label={title}>
      {missing ? <p className="grid h-full place-items-center p-6 text-ink-muted">{missing}</p> : <div className="absolute inset-0"><div ref={box} className="h-full w-full" /></div>}
      <p className="pointer-events-none absolute left-3 top-3 rounded bg-surface/95 px-3 py-1 text-sm font-medium shadow-sm">{title}</p>
    </section>
  );
}
