'use client';

import { createMap, LABEL_FONT } from '@/lib/basemap';
import { SATELLITE_AVAILABLE } from '@/lib/map';
import { LngLatBounds, NavigationControl, Popup, setWorkerUrl, type Map as MlMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import type { ChangeFlagSegment, SatelliteScene } from '@/lib/types';

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

interface Props {
  /** The picture shown; the right-hand side when comparing. */
  scene: SatelliteScene;
  /** When comparing: the earlier picture, on the left of the divider. */
  before?: SatelliteScene | null;
  /** Where the divider sits, 0 to 100 percent from the left. */
  split: number;
  corridor?: GeoJSON.FeatureCollection;
  bounds: [number, number, number, number] | null;
  minZoom: number;
  maxZoom: number;
  /** The SkyFi previews panel is below, so the zoomed-in note can point to it. */
  skyfiBelow?: boolean;
  /** "Where to look": each segment's flag, drawn as a band beside the line, with its kilometres and dates on hover. */
  flags?: ChangeFlagSegment[];
  /** A stretch to show: the map fits it and marks it. `key` changes when another is picked. */
  focus?: { key: string; line: GeoJSON.LineString } | null;
}

export const FLAG_COLOURS: Record<ChangeFlagSegment['status'], string> = { changed: '#b0179a', no_change: '#1f5fd6', not_enough: '#8a94a6' };
export const FLAG_LABELS: Record<ChangeFlagSegment['status'], string> = { changed: 'Changed', no_change: 'No visible change', not_enough: 'Not enough clear pictures' };

const day = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');
const km = (m: number) => (m / 1000).toFixed(1);

/** What hovering a segment says: its kilometres, its flag and the clear dates it rests on. */
export function flagText(s: ChangeFlagSegment) {
  const what =
    s.status === 'changed'
      ? `Changed since ${day(s.changedSince)}`
      : s.status === 'no_change'
        ? `No visible change for ${s.steadyMonths} months${s.changedSince ? ` (changed ${day(s.changedSince)}, steady since)` : ''}`
        : 'Not enough clear pictures';
  const dates = s.clearDates ? `${s.clearDates} clear date${s.clearDates === 1 ? '' : 's'}, ${day(s.firstDate)} to ${day(s.lastDate)}` : 'no clear dates';
  return `km ${km(s.fromM)} to ${km(s.toM)}: ${what}. ${dates}.`;
}

// The flags as a band just beside the line (offset so the line and lots stay readable), white-edged for the imagery.
function showFlags(m: MlMap, flags: ChangeFlagSegment[] | undefined) {
  const data: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: (flags ?? []).map((s) => ({ type: 'Feature', geometry: s.line, properties: { status: s.status, text: flagText(s) } })),
  };
  const source = m.getSource('flags') as { setData?: (d: GeoJSON.FeatureCollection) => void } | undefined;
  if (source?.setData) {
    source.setData(data);
    return;
  }
  if (!flags?.length) return;
  m.addSource('flags', { type: 'geojson', data });
  m.addLayer({ id: 'flags-casing', type: 'line', source: 'flags', layout: { 'line-cap': 'butt' }, paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-offset': 11 } });
  m.addLayer({
    id: 'flags',
    type: 'line',
    source: 'flags',
    layout: { 'line-cap': 'butt' },
    paint: { 'line-color': ['match', ['get', 'status'], 'changed', FLAG_COLOURS.changed, 'no_change', FLAG_COLOURS.no_change, FLAG_COLOURS.not_enough], 'line-width': 5, 'line-offset': 11 },
  });
  const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 12, maxWidth: '320px' });
  m.on('mousemove', 'flags', (e) => {
    const text = e.features?.[0]?.properties?.text;
    if (typeof text !== 'string') return;
    m.getCanvas().style.cursor = 'help';
    popup.setLngLat(e.lngLat).setText(text).addTo(m);
  });
  m.on('mouseleave', 'flags', () => {
    m.getCanvas().style.cursor = '';
    popup.remove();
  });
}

// The stretch picked from a list: a wide yellow mark under our line, lots and flags, and the map fitted to it.
function showFocus(m: MlMap, focus: Props['focus']) {
  if (m.getLayer('focus')) m.removeLayer('focus');
  if (m.getSource('focus')) m.removeSource('focus');
  if (!focus) return;
  m.addSource('focus', { type: 'geojson', data: focus.line });
  m.addLayer({ id: 'focus', type: 'line', source: 'focus', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffd23f', 'line-width': 22, 'line-opacity': 0.85 } }, [...OVERLAYS, 'flags-casing'].find((id) => m.getLayer(id)));
  const b = new LngLatBounds();
  for (const p of focus.line.coordinates) b.extend(p as [number, number]);
  m.fitBounds(b, { padding: 60, maxZoom: 14, duration: 600 });
}

const OVERLAYS = ['line-casing', 'line', 'lot-casing', 'lot', 'station', 'station-label', 'photo'];

// Each Sentinel-2 dot is 10 m, a smudge past zoom 14: the picture fades out between 14 and 15 so the sharp background
// shows when zoomed in close.
const FADE_FROM = 14;
const FADE_TO = 15;
// The section opens close enough for the 1 km corridor strip to read clearly (about 25 px wide at zoom 12).
const OPEN_ZOOM = 12;

// The point halfway along the line, by distance (flat-earth lengths are close enough for picking a view).
function middleOfLine(corridor?: GeoJSON.FeatureCollection): [number, number] | null {
  const line = corridor?.features.find((f) => f.properties?.kind === 'line')?.geometry;
  const parts = line?.type === 'LineString' ? [line.coordinates] : line?.type === 'MultiLineString' ? line.coordinates : [];
  const steps: Array<{ a: number[]; b: number[]; d: number }> = [];
  for (const part of parts) for (let i = 1; i < part.length; i++) {
    const a = part[i - 1]!;
    const b = part[i]!;
    const k = Math.cos((((a[1]! + b[1]!) / 2) * Math.PI) / 180);
    steps.push({ a, b, d: Math.hypot((b[0]! - a[0]!) * k, b[1]! - a[1]!) });
  }
  let left = steps.reduce((n, s) => n + s.d, 0) / 2;
  for (const { a, b, d } of steps) {
    if (left <= d) {
      const t = d ? left / d : 0;
      return [a[0]! + (b[0]! - a[0]!) * t, a[1]! + (b[1]! - a[1]!) * t];
    }
    left -= d;
  }
  return null;
}

// The picture's tiles: the API's template made absolute without encoding its {z}/{x}/{y}.
function showPicture(m: MlMap, scene: SatelliteScene, p: Pick<Props, 'bounds' | 'minZoom' | 'maxZoom'>) {
  if (m.getLayer('picture')) m.removeLayer('picture');
  if (m.getSource('picture')) m.removeSource('picture');
  m.addSource('picture', {
    type: 'raster',
    tiles: [`${window.location.origin}${scene.tiles}`],
    tileSize: 256,
    minzoom: p.minZoom,
    maxzoom: p.maxZoom,
    ...(p.bounds ? { bounds: p.bounds } : {}),
  });
  m.addLayer(
    { id: 'picture', type: 'raster', source: 'picture', paint: { 'raster-fade-duration': 0, 'raster-opacity': ['interpolate', ['linear'], ['zoom'], FADE_FROM, 1, FADE_TO, 0] } },
    OVERLAYS.find((id) => m.getLayer(id)),
  );
}

// Lots, stations and verified photo pins on top of the picture, with white outlines for the imagery.
export function addOverlays(m: MlMap, corridor: GeoJSON.FeatureCollection) {
  m.addSource('corridor', { type: 'geojson', data: corridor });
  const kind = (k: string) => ['==', ['get', 'kind'], k] as ['==', ['get', string], string];
  m.addLayer({ id: 'line-casing', type: 'line', source: 'corridor', filter: kind('line'), layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 7 } });
  m.addLayer({ id: 'line', type: 'line', source: 'corridor', filter: kind('line'), layout: { 'line-cap': 'round' }, paint: { 'line-color': '#8a94a6', 'line-width': 3 } });
  m.addLayer({ id: 'lot-casing', type: 'line', source: 'corridor', filter: kind('lot'), layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 8 } });
  m.addLayer({ id: 'lot', type: 'line', source: 'corridor', filter: kind('lot'), layout: { 'line-cap': 'round' }, paint: { 'line-color': ['match', ['get', 'state'], 'complete', '#2f7a3e', '#c76f0a'], 'line-width': 4 } });
  m.addLayer({ id: 'station', type: 'circle', source: 'corridor', filter: kind('station'), paint: { 'circle-radius': 6, 'circle-color': '#ffffff', 'circle-stroke-color': '#0b2545', 'circle-stroke-width': 2.5 } });
  if (m.getStyle().glyphs) {
    m.addLayer({ id: 'station-label', type: 'symbol', source: 'corridor', filter: kind('station'), layout: { 'text-field': ['get', 'name'], 'text-font': LABEL_FONT, 'text-size': 13, 'text-offset': [0.9, 0], 'text-anchor': 'left' }, paint: { 'text-color': '#1b2430', 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 } });
  }
  m.addLayer({ id: 'photo', type: 'circle', source: 'corridor', filter: kind('photo'), paint: { 'circle-radius': 6, 'circle-color': '#2f6fde', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
}

/*
 * W5.14: one satellite picture over the corridor, on the Esri imagery (the street map when no satellite background is
 * set up). Comparing, a second map with the earlier picture sits on top, cut off at the divider, and both move together.
 */
export function SatelliteMap({ scene, before, split, corridor, bounds, minZoom, maxZoom, skyfiBelow, flags, focus }: Props) {
  const mainBox = useRef<HTMLDivElement>(null);
  const beforeBox = useRef<HTMLDivElement>(null);
  const main = useRef<MlMap | null>(null);
  const other = useRef<MlMap | null>(null);
  const loaded = useRef(new WeakSet<MlMap>());
  const [closeIn, setCloseIn] = useState(false);
  const picture = { bounds, minZoom, maxZoom };
  // The latest flags and focus, for the map's load handler.
  const latest = useRef({ flags, focus });
  latest.current = { flags, focus };

  const make = (box: HTMLDivElement, onReady: (m: MlMap) => void) => {
    const m = createMap({ container: box, bounds: bounds ?? [[2.6, 4.2], [14.7, 13.9]], fitBoundsOptions: { padding: 30 } }, SATELLITE_AVAILABLE ? 'satellite' : 'map');
    const ro = new ResizeObserver(() => m.resize());
    if (box.parentElement) ro.observe(box.parentElement);
    m.on('load', () => {
      if (corridor) addOverlays(m, corridor);
      loaded.current.add(m);
      onReady(m);
    });
    return { m, stop: () => ro.disconnect() };
  };

  // The main map (the picture, or the later one when comparing).
  useEffect(() => {
    if (!mainBox.current) return;
    const { m, stop } = make(mainBox.current, (map) => {
      showPicture(map, scene, picture);
      showFlags(map, latest.current.flags);
      showFocus(map, latest.current.focus);
    });
    // Fitted to the whole corridor a long line is too far out to see the strip: start on its middle, close enough.
    const middle = middleOfLine(corridor);
    if (middle && m.getZoom() < OPEN_ZOOM) m.jumpTo({ center: middle, zoom: OPEN_ZOOM });
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    const zoomed = () => setCloseIn(m.getZoom() > FADE_FROM);
    zoomed();
    m.on('zoom', zoomed);
    main.current = m;
    return () => {
      stop();
      m.remove();
      main.current = null;
    };
  }, [corridor]);

  useEffect(() => {
    const m = main.current;
    if (m && loaded.current.has(m)) showPicture(m, scene, picture);
  }, [scene.id]);

  useEffect(() => {
    const m = main.current;
    if (m && loaded.current.has(m)) showFlags(m, flags);
  }, [flags]);

  useEffect(() => {
    const m = main.current;
    if (m && loaded.current.has(m)) showFocus(m, focus);
  }, [focus?.key]);

  // The earlier picture on top, synced with the main map both ways.
  useEffect(() => {
    if (!before || !beforeBox.current || !main.current) return;
    const mainMap = main.current;
    const { m, stop } = make(beforeBox.current, (map) => showPicture(map, before, picture));
    m.jumpTo({ center: mainMap.getCenter(), zoom: mainMap.getZoom() });
    other.current = m;
    let syncing = false;
    const follow = (from: MlMap, to: MlMap) => () => {
      if (syncing) return;
      syncing = true;
      to.jumpTo({ center: from.getCenter(), zoom: from.getZoom(), bearing: from.getBearing(), pitch: from.getPitch() });
      syncing = false;
    };
    const a = follow(mainMap, m);
    const b = follow(m, mainMap);
    mainMap.on('move', a);
    m.on('move', b);
    return () => {
      mainMap.off('move', a);
      stop();
      m.remove();
      other.current = null;
    };
  }, [before?.id === undefined, corridor]);

  useEffect(() => {
    const m = other.current;
    if (m && before && loaded.current.has(m)) showPicture(m, before, picture);
  }, [before?.id]);

  const year = (s: SatelliteScene) => new Date(s.takenAt).getUTCFullYear();
  const years = before && year(before) !== year(scene) ? `${Math.min(year(before), year(scene))}–${Math.max(year(before), year(scene))}` : String(year(scene));

  return (
    <div className="relative h-[520px] overflow-hidden rounded-md ring-1 ring-line">
      <div className="absolute inset-0">
        <div ref={mainBox} className="h-full w-full" role="region" aria-label={`Satellite picture of the corridor, ${new Date(scene.takenAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`} />
      </div>
      {before && (
        <>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
            <div ref={beforeBox} className="h-full w-full" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" style={{ left: `${split}%` }} />
        </>
      )}
      <p className="pointer-events-none absolute left-2 top-2 rounded bg-surface/90 px-2 py-1 text-[13px] font-medium text-ink shadow-sm">
        Contains modified Copernicus Sentinel data {years}
      </p>
      {closeIn && (
        <p role="status" className="pointer-events-none absolute left-2 top-11 max-w-[min(26rem,calc(100%-4rem))] rounded bg-[#fff4e0] px-2 py-1 text-[13px] font-medium text-[#7a4a00] shadow-sm">
          {skyfiBelow ? 'Free pictures are 10 m detail; zoom out to see them, or see SkyFi previews below for close detail.' : 'Free pictures are 10 m detail; zoom out to see them.'}
        </p>
      )}
    </div>
  );
}
