'use client';

import {
  AttributionControl,
  Map as MlMap,
  type IControl,
  type MapOptions,
  type StyleSpecification,
} from 'maplibre-gl';
import { useCallback, useSyncExternalStore } from 'react';
import { ESRI_CREDIT, MAP_CREDITS, ESRI_IMAGERY_KEY, esriTiles, SATELLITE_AVAILABLE, SATELLITE_STYLE_URL, STYLE_URL } from '@/lib/map';

/*
 * The Map / Satellite choice, shared by every map. It is remembered on this browser; every map on screen follows a
 * change at once. Without a satellite setting (src/lib/map.ts) it is always the street map and the switch is hidden.
 */
export type Basemap = 'map' | 'satellite';

const KEY = 'fmot.basemap';
const listeners = new Set<() => void>();

function read(): Basemap {
  if (!SATELLITE_AVAILABLE) return 'map';
  try {
    return localStorage.getItem(KEY) === 'satellite' ? 'satellite' : 'map';
  } catch {
    return 'map';
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  // Another tab changing it
  window.addEventListener('storage', fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', fn);
  };
}

export function useBasemap(): [Basemap, (b: Basemap) => void] {
  const basemap = useSyncExternalStore(subscribe, read, (): Basemap => 'map');
  const set = useCallback((b: Basemap) => {
    try {
      localStorage.setItem(KEY, b);
    } catch {
      /* not remembered on this browser, which is fine */
    }
    listeners.forEach((fn) => fn());
  }, []);
  return [basemap, set];
}

/*
 * Our own labels (station names, the project's line name). Esri imagery has no labels, so on satellite these are the
 * only names on the map. Noto Sans is in the OpenFreeMap and MapTiler fonts, and the app serves the ranges it needs
 * (public/fonts) for the Esri style.
 */
export const LABEL_FONT = ['Noto Sans Regular'];
export const LINE_LABEL_FONT = ['Noto Sans Bold'];

/** Labels that only show on satellite (the street map has its own place names). */
export function showOnSatellite(m: MlMap, b: Basemap, layerIds: string[]) {
  for (const id of layerIds) if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', b === 'satellite' ? 'visible' : 'none');
}

/** Esri World Imagery as a style of its own (raster tiles, no labels), with the app's fonts for our labels. */
export function esriStyle(key: string | null): StyleSpecification {
  return {
    version: 8,
    glyphs: `${window.location.origin}/fonts/{fontstack}/{range}.pbf`,
    sources: { 'esri-imagery': { type: 'raster', tiles: [esriTiles(key)], tileSize: 256, maxzoom: 19, attribution: ESRI_CREDIT } },
    layers: [{ id: 'esri-imagery', type: 'raster', source: 'esri-imagery' }],
  };
}

export function styleFor(b: Basemap): string | StyleSpecification {
  if (b === 'map' || !SATELLITE_AVAILABLE) return STYLE_URL;
  return SATELLITE_STYLE_URL ?? esriStyle(ESRI_IMAGERY_KEY);
}

/** MapTiler's logo, which its terms ask for beside its maps. */
class MapTilerLogo implements IControl {
  el?: HTMLElement;
  onAdd() {
    const a = document.createElement('a');
    a.href = 'https://www.maptiler.com';
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'maplibregl-ctrl';
    a.innerHTML = '<img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler" width="88" height="23">';
    this.el = a;
    return a;
  }
  onRemove() {
    this.el?.remove();
  }
}

interface Extras {
  attribution: AttributionControl;
  logo?: MapTilerLogo;
  // The base style's own layers and sources; everything else on the map is the app's and survives a swap.
  baseLayers: Set<string>;
  baseSources: Set<string>;
}
const extras = new WeakMap<MlMap, Extras>();

/*
 * The credits: the provider's (from the style's sources), the boundaries' and OpenStreetMap's for the railway lines. On satellite they stay open, as
 * the imagery providers require; on the street map they fold behind (i) on a small map (under 640 px wide), where
 * they would cover much of it.
 */
function placeCredits(m: MlMap, b: Basemap) {
  const old = extras.get(m);
  if (old) {
    m.removeControl(old.attribution);
    if (old.logo) m.removeControl(old.logo);
  }
  const satellite = b === 'satellite' && SATELLITE_AVAILABLE;
  const attribution = new AttributionControl({ compact: !satellite, customAttribution: MAP_CREDITS });
  const logo = satellite && SATELLITE_STYLE_URL?.includes('maptiler.com') ? new MapTilerLogo() : undefined;
  if (logo) m.addControl(logo, 'bottom-right');
  m.addControl(attribution, 'bottom-right');
  // Always at the foot of the corner, under the zoom buttons, however often the basemap changes.
  const credit = m.getContainer().querySelector('.maplibregl-ctrl-attrib');
  const corner = credit?.parentElement;
  if (logo?.el) corner?.appendChild(logo.el);
  if (credit) corner?.appendChild(credit);
  if (!satellite && m.getContainer().clientWidth < 640) credit?.classList.remove('maplibregl-compact-show');
  return { attribution, logo };
}

function rememberBase(m: MlMap) {
  const s = m.getStyle();
  const e = extras.get(m);
  if (e) {
    e.baseLayers = new Set(s.layers.map((l) => l.id));
    e.baseSources = new Set(Object.keys(s.sources));
  }
}

/**
 * A map on the chosen basemap with its credits. The base style's layers are noted before the caller's 'load'
 * handler adds its own, so a later setBasemap keeps those.
 */
export function createMap(options: Omit<MapOptions, 'style' | 'attributionControl'>, b: Basemap): MlMap {
  const m = new MlMap({ ...options, style: styleFor(b), attributionControl: false });
  extras.set(m, { ...placeCredits(m, b), baseLayers: new Set(), baseSources: new Set() });
  m.once('load', () => rememberBase(m));
  return m;
}

/**
 * Swaps the basemap under the app's lines, lots, stations and pins, which are carried over unchanged. Labels need the
 * style's fonts, so a symbol layer is dropped on a style without them (Esri). Calls done once the new style is in.
 */
export function setBasemap(m: MlMap, b: Basemap, done?: () => void) {
  const e = extras.get(m);
  if (!e) return;
  m.setStyle(styleFor(b), {
    diff: false,
    transformStyle: (prev, next) => {
      if (!prev) return next;
      const sources = Object.fromEntries(Object.entries(prev.sources).filter(([id]) => !e.baseSources.has(id)));
      const layers = prev.layers.filter((l) => !e.baseLayers.has(l.id) && (l.type !== 'symbol' || next.glyphs));
      e.baseLayers = new Set(next.layers.map((l) => l.id));
      e.baseSources = new Set(Object.keys(next.sources));
      return { ...next, sources: { ...next.sources, ...sources }, layers: [...next.layers, ...layers] };
    },
  });
  Object.assign(e, placeCredits(m, b));
  if (done) m.once('style.load', done);
}
