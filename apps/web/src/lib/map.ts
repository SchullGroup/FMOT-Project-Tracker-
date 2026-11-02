/*
 * Settings shared by the three maps (map home, corridor, wizard preview). The style is any MapLibre style JSON URL;
 * see README.md for the MapTiler satellite-hybrid option.
 */
export const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty';

// CC BY 4.0 credit for the state boundaries (docs/data-sources.md), shown on every map.
export const BOUNDARY_CREDIT = 'State boundaries: GRID3 Nigeria (2022) via geoBoundaries (Runfola et al. 2020), CC BY 4.0';

export const ATTRIBUTION = { compact: true, customAttribution: BOUNDARY_CREDIT } as const;
