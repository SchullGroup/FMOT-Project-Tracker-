/*
 * Settings shared by the maps (map home, corridor, the overview's mini-map, wizard preview). The street map is any
 * MapLibre style JSON URL. Satellite is MapTiler's satellite-hybrid style (with its key) or, failing that, Esri World
 * Imagery with an ArcGIS key; with neither, there is no satellite choice. This file is also read by src/proxy.ts for
 * the Content Security Policy, so it must not import MapLibre.
 */
export const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty';
export const SATELLITE_STYLE_URL = process.env.NEXT_PUBLIC_SATELLITE_STYLE_URL || null;
export const ESRI_IMAGERY_KEY = process.env.NEXT_PUBLIC_ESRI_IMAGERY_KEY || null;
export const SATELLITE_AVAILABLE = Boolean(SATELLITE_STYLE_URL || ESRI_IMAGERY_KEY);

// Esri World Imagery tiles: with a key from ArcGIS Location Platform, or (development only, /dev/basemaps) the public
// server, whose terms do not cover a production app.
export const ESRI_KEYED_ORIGIN = 'https://ibasemaps-api.arcgis.com';
export const ESRI_PUBLIC_ORIGIN = 'https://server.arcgisonline.com';
export const ESRI_CREDIT = 'Powered by <a href="https://www.esri.com">Esri</a> | Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

export function esriTiles(key: string | null) {
  const path = '/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  return key ? `${ESRI_KEYED_ORIGIN}${path}?token=${encodeURIComponent(key)}` : `${ESRI_PUBLIC_ORIGIN}${path.replace('/arcgis', '/ArcGIS')}`;
}

// Credits shown on every map (docs/data-sources.md): the state boundaries (CC BY 4.0) and the sample and demo railway
// lines, which come from OpenStreetMap (ODbL).
export const BOUNDARY_CREDIT = 'State boundaries: GRID3 Nigeria (2022) via geoBoundaries (Runfola et al. 2020), CC BY 4.0';
export const RAIL_CREDIT = 'Railway lines: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ODbL';
export const MAP_CREDITS = [BOUNDARY_CREDIT, RAIL_CREDIT];
