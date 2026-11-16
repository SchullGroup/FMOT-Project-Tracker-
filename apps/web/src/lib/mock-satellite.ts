/*
 * Sample satellite pictures for NEXT_PUBLIC_API_MOCK=1: three real Sentinel-2 pictures of Kaduna–Kano, drawn once by
 * the API's satellite job and kept as tiles in public/sample-satellite (docs/data-sources.md). Other lines have none.
 */
import type { LatestPictures, SatelliteScene, SatelliteTimeline, SatelliteUsage } from './types';
import { ROUTES } from './sample-routes';

// [folder in public/sample-satellite, date taken, cloud cover over the corridor %, share of the corridor covered %]
export const SAMPLE_PICTURES: Array<[string, string, number, number]> = [
  ['kk-2025-11-27', '2025-11-27T10:07:17Z', 1, 100],
  ['kk-2026-09-08', '2026-09-08T10:07:22Z', 1, 100],
  ['kk-2026-11-12', '2026-11-12T10:07:25Z', 0, 100],
];

const CLOUD_LIMIT = 30;
// The sample tiles go to zoom 12; the map enlarges them past it.
const MIN_ZOOM = 8;
const MAX_ZOOM = 12;

const kk = ROUTES['p-kk']!;
const pad = 0.01;
const BOUNDS: [number, number, number, number] = [
  Math.min(...kk.map((p) => p[0])) - pad,
  Math.min(...kk.map((p) => p[1])) - pad,
  Math.max(...kk.map((p) => p[0])) + pad,
  Math.max(...kk.map((p) => p[1])) + pad,
];

const scene = ([folder, takenAt, cloud, coverage]: (typeof SAMPLE_PICTURES)[number]): SatelliteScene => ({
  id: `sat-${folder}`,
  sceneId: `sentinel-2-l2a:${takenAt.slice(0, 10)}`,
  takenAt,
  cloudCoverPercent: cloud,
  coveragePercent: coverage,
  hiddenByDefault: cloud > CLOUD_LIMIT,
  tiles: `/sample-satellite/${folder}/{z}/{x}/{y}.png`,
  attribution: `Contains modified Copernicus Sentinel data ${takenAt.slice(0, 4)}`,
});

export function mockSatellite(route: string): { status: number; body: unknown } | undefined {
  const timeline = /^\/projects\/([^/]+)\/satellite$/.exec(route);
  if (timeline) {
    const own = timeline[1] === 'p-kk';
    const body: SatelliteTimeline = {
      scenes: own ? SAMPLE_PICTURES.map(scene).sort((a, b) => b.takenAt.localeCompare(a.takenAt)) : [],
      bounds: own ? BOUNDS : null,
      cloudLimit: CLOUD_LIMIT,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      paused: false,
      configured: true,
    };
    return { status: 200, body };
  }
  if (route === '/map/satellite') {
    const latest = SAMPLE_PICTURES.map(scene).filter((s) => !s.hiddenByDefault).sort((a, b) => b.takenAt.localeCompare(a.takenAt))[0];
    const body: LatestPictures = { pictures: latest ? [{ ...latest, projectId: 'p-kk', bounds: BOUNDS }] : [], minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM };
    return { status: 200, body };
  }
  if (route === '/admin/satellite') {
    const body: SatelliteUsage = { configured: true, month: '2026-11-01', processingUnits: 412.5, requests: 1689, tilesDrawn: 1650, limit: 27_000, paused: false };
    return { status: 200, body };
  }
  return undefined;
}
