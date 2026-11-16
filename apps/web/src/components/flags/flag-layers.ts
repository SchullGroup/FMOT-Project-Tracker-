import { LngLatBounds, Popup, type Map as MlMap } from 'maplibre-gl';
import type { ChangeFlagSegment } from '@/lib/types';

/*
 * Experimental "Where to look" (satellite change flags, not yet reliable): the colours and words of the flags, and
 * the map layers that show them as a band beside the line.
 */

export const FLAG_STATUSES = ['changed', 'waiting', 'cleared', 'no_change', 'not_enough'] as const;
export const FLAG_COLOURS: Record<ChangeFlagSegment['status'], string> = { changed: '#b0179a', waiting: '#e08a1e', cleared: '#7fb0e8', no_change: '#1f5fd6', not_enough: '#8a94a6' };
export const FLAG_LABELS: Record<ChangeFlagSegment['status'], string> = {
  changed: 'Changed',
  waiting: 'Waiting for confirmation',
  cleared: 'Cleared',
  no_change: 'No visible change',
  not_enough: 'Not enough clear pictures',
};

const day = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');
const km = (m: number) => (m / 1000).toFixed(1);

/** How a change stands, in words: when it started and, for a rainy-season change, what the dry season showed. */
export function changeWords(s: { status: ChangeFlagSegment['status']; since?: string | null; changedSince?: string | null; season: string | null; resolvedOn: string | null }) {
  const since = day(s.since ?? s.changedSince ?? null);
  if (s.status === 'waiting') return `waiting for confirmation: started ${since} in the rainy season; the next clear dry-season picture confirms or clears it`;
  if (s.status === 'cleared') return `cleared: a rainy-season change from ${since} that was gone on ${day(s.resolvedOn)}`;
  if (s.season === 'rainy') return `changed since ${since}, confirmed on ${day(s.resolvedOn)} in the dry season`;
  return `changed since ${since} (dry season)`;
}

/** What hovering a segment says: its kilometres, its flag and the clear dates it rests on. */
export function flagText(s: ChangeFlagSegment) {
  const what =
    s.status === 'changed' || s.status === 'waiting' || s.status === 'cleared'
      ? changeWords(s).replace(/^./, (c) => c.toUpperCase())
      : s.status === 'no_change'
        ? `No visible change for ${s.steadyMonths} months`
        : 'Not enough clear pictures';
  const dates = s.clearDates ? `${s.clearDates} clear date${s.clearDates === 1 ? '' : 's'}, ${day(s.firstDate)} to ${day(s.lastDate)}` : 'no clear dates';
  return `km ${km(s.fromM)} to ${km(s.toM)}: ${what}. ${dates}.`;
}

/** The flags as a band just beside the line (offset so the line stays readable), white-edged for the imagery. */
export function showFlags(m: MlMap, flags: ChangeFlagSegment[]) {
  const data: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: flags.map((s) => ({ type: 'Feature', geometry: s.line, properties: { status: s.status, text: flagText(s) } })),
  };
  const source = m.getSource('flags') as { setData?: (d: GeoJSON.FeatureCollection) => void } | undefined;
  if (source?.setData) {
    source.setData(data);
    return;
  }
  m.addSource('flags', { type: 'geojson', data });
  m.addLayer({ id: 'flags-casing', type: 'line', source: 'flags', layout: { 'line-cap': 'butt' }, paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-offset': 11 } });
  m.addLayer({
    id: 'flags',
    type: 'line',
    source: 'flags',
    layout: { 'line-cap': 'butt' },
    paint: {
      'line-color': ['match', ['get', 'status'], 'changed', FLAG_COLOURS.changed, 'waiting', FLAG_COLOURS.waiting, 'cleared', FLAG_COLOURS.cleared, 'no_change', FLAG_COLOURS.no_change, FLAG_COLOURS.not_enough],
      'line-width': 5,
      'line-offset': 11,
    },
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

/** A stretch picked from a list: a wide yellow mark under `below` (our line), and the map fitted to it. */
export function showFocus(m: MlMap, focus: { key: string; line: GeoJSON.LineString } | null, below?: string) {
  if (m.getLayer('focus')) m.removeLayer('focus');
  if (m.getSource('focus')) m.removeSource('focus');
  if (!focus) return;
  m.addSource('focus', { type: 'geojson', data: focus.line });
  m.addLayer({ id: 'focus', type: 'line', source: 'focus', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffd23f', 'line-width': 22, 'line-opacity': 0.85 } }, below && m.getLayer(below) ? below : undefined);
  const b = new LngLatBounds();
  for (const p of focus.line.coordinates) b.extend(p as [number, number]);
  m.fitBounds(b, { padding: 60, maxZoom: 14, duration: 600 });
}
