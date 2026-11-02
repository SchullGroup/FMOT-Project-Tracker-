'use client';

import { ATTRIBUTION, STYLE_URL } from '@/lib/map';
import {
  LngLatBounds,
  Map as MlMap,
  NavigationControl,
  setWorkerUrl,
  type ExpressionSpecification,
  type GeoJSONSource,
  type LngLatBoundsLike,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { CATEGORY_COLOUR, categoryOf, type MapCategory } from '@/lib/status';
import type { MapProjectsResponse } from '@/lib/types';

const NIGERIA: LngLatBoundsLike = [
  [2.6, 4.2],
  [14.7, 13.9],
];
// See scripts/copy-maplibre-worker.mjs
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');


interface Props {
  data: MapProjectsResponse | undefined;
  visible: Set<MapCategory>;
  selectedId: string | null;
  focusId: string | null;
  onSelect: (id: string) => void;
}

const colourExpression = [
  'match',
  ['get', 'category'],
  ...Object.entries(CATEGORY_COLOUR).flat(),
  '#6b7280',
] as unknown as ExpressionSpecification;

/*
 * The map of Nigeria with every project the person may see. Lines are
 * coloured by category (the same colours as the legend and cards); drafts
 * are dashed. Clicking a line selects the project.
 */
export function MapView({ data, visible, selectedId, focusId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const ready = useRef(false);
  const pending = useRef<Array<() => void>>([]);
  const whenReady = (fn: () => void) => (ready.current ? fn() : pending.current.push(fn));
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!container.current) return;
    const m = new MlMap({
      container: container.current,
      style: STYLE_URL,
      bounds: NIGERIA,
      // Room for the top bar of controls; the legend sits over the empty north-west.
      fitBoundsOptions: { padding: { top: 110, bottom: 30, left: 30, right: 30 } },
      attributionControl: ATTRIBUTION,
      cooperativeGestures: false,
    });
    m.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');
    map.current = m;

    m.on('load', () => {
      m.addSource('projects', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({
        id: 'projects-casing',
        type: 'line',
        source: 'projects',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 10, 'line-opacity': 0.9 },
      });
      m.addLayer({
        id: 'projects-selected',
        type: 'line',
        source: 'projects',
        filter: ['==', ['get', 'id'], ''],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#0b2545', 'line-width': 14, 'line-opacity': 0.35 },
      });
      m.addLayer({
        id: 'projects-line',
        type: 'line',
        source: 'projects',
        filter: ['!=', ['get', 'category'], 'draft'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': colourExpression, 'line-width': 6 },
      });
      m.addLayer({
        id: 'projects-draft',
        type: 'line',
        source: 'projects',
        filter: ['==', ['get', 'category'], 'draft'],
        layout: { 'line-join': 'round' },
        paint: { 'line-color': colourExpression, 'line-width': 5, 'line-dasharray': [2, 1.5] },
      });

      for (const layer of ['projects-line', 'projects-draft', 'projects-casing']) {
        m.on('click', layer, (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties?.id as string | undefined;
          if (id) onSelectRef.current(id);
        });
        m.on('mouseenter', layer, () => (m.getCanvas().style.cursor = 'pointer'));
        m.on('mouseleave', layer, () => (m.getCanvas().style.cursor = ''));
      }
      ready.current = true;
      pending.current.splice(0).forEach((fn) => fn());
    });

    return () => {
      ready.current = false;
      pending.current = [];
      m.remove();
      map.current = null;
    };
  }, []);

  // Data and visibility
  useEffect(() => {
    const m = map.current;
    if (!m || !data) return;
    const apply = () => {
      const features = data.features
        .map((f) => ({
          ...f,
          properties: { ...f.properties, category: categoryOf(f.properties.status, f.properties.health) },
        }))
        .filter((f) => visible.has(f.properties.category));
      (m.getSource('projects') as GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features });
    };
    whenReady(apply);
  }, [data, visible]);

  // Selection highlight
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const apply = () => m.setFilter('projects-selected', ['==', ['get', 'id'], selectedId ?? '']);
    whenReady(apply);
  }, [selectedId]);

  // Fly to a project
  useEffect(() => {
    const m = map.current;
    const f = data?.features.find((x) => x.properties.id === focusId);
    if (!m || !f) return;
    const bounds = f.geometry.coordinates.reduce(
      (b, c) => b.extend(c),
      new LngLatBounds(f.geometry.coordinates[0], f.geometry.coordinates[0]),
    );
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    m.fitBounds(bounds, { padding: { top: 120, bottom: 60, left: 320, right: 440 }, maxZoom: 8, animate: !reduce });
  }, [focusId, data]);

  // MapLibre sets position: relative on its container, so the positioning
  // lives on a wrapper and the map simply fills it.
  return (
    <div className="absolute inset-0">
      <div ref={container} className="h-full w-full" role="region" aria-label="Map of railway projects in Nigeria" />
    </div>
  );
}
