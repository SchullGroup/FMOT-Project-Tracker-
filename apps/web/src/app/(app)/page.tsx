'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Counters } from '@/components/map/Counters';
import { FilterChip } from '@/components/map/FilterChip';
import { LayersPanel } from '@/components/map/LayersPanel';
import { Legend } from '@/components/map/Legend';
import { CURRENT_PROJECT_KEY, ProjectCardPanel } from '@/components/map/ProjectCardPanel';
import { useCan } from '@/components/Session';
import { getMapLayer, getMapProjects } from '@/lib/endpoints';
import { CATEGORY_LABEL, categoryOf, type MapCategory } from '@/lib/status';
import type { MapLayerName, MapProjectProperties, MapProjectsResponse } from '@/lib/types';

const MapView = dynamic(() => import('@/components/map/MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center text-ink-muted">Loading the map…</div>,
});

const CATEGORIES: MapCategory[] = ['operational', 'construction', 'planned', 'stalled', 'draft'];

const PHASES = [
  { value: 'before_funding', label: 'Before funding (gates 1 to 4)', test: (g: number | null) => g !== null && g <= 4 },
  { value: 'procurement', label: 'Procurement (gates 5 to 8)', test: (g: number | null) => g !== null && g >= 5 && g <= 8 },
  { value: 'before_works', label: 'Before works (gates 9 to 12)', test: (g: number | null) => g !== null && g >= 9 && g <= 12 },
  { value: 'construction', label: 'Construction (gate 13)', test: (g: number | null) => g === 13 },
  { value: 'completion', label: 'Commissioning and handover', test: (g: number | null) => g === 14 || g === 15 },
  { value: 'running', label: 'Running', test: (g: number | null) => g === null },
];

const FUNDING = [
  { value: 'loan', label: 'External loan' },
  { value: 'budget', label: 'Federal budget' },
  { value: 'ppp', label: 'Public-private partnership' },
  { value: 'state_private', label: 'State or private' },
];

const LAYERS_KEY = 'fmot.mapLayers';

/** W3 Map home: Nigeria with every project the person may see, with the design's filters and layers. */
export default function MapHome() {
  const canCreate = useCan('projects:create');
  const canSecurity = useCan('security:read_detail');
  const projects = useQuery({ queryKey: ['map-projects'], queryFn: getMapProjects });

  const [status, setStatus] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Set<string>>(new Set());
  const [funding, setFunding] = useState<Set<string>>(new Set());
  const [contractor, setContractor] = useState<Set<string>>(new Set());
  const [state, setState] = useState<Set<string>>(new Set());
  const [showDrafts, setShowDrafts] = useState(true);
  const [layers, setLayers] = useState<Set<MapLayerName>>(new Set(['stations']));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get('focus') ?? localStorage.getItem(CURRENT_PROJECT_KEY);
    if (current) {
      setSelectedId(current);
      setFocusId(current);
    }
    try {
      const saved = JSON.parse(localStorage.getItem(LAYERS_KEY) ?? 'null') as MapLayerName[] | null;
      if (saved) setLayers(new Set(saved));
    } catch {
      /* keep the default */
    }
  }, []);

  const toggleLayer = (n: MapLayerName) =>
    setLayers((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      try {
        localStorage.setItem(LAYERS_KEY, JSON.stringify([...next]));
      } catch {
        /* not remembered on this device, which is fine */
      }
      return next;
    });

  // A remembered no-go choice is ignored for anyone without the security permission (the API would refuse it).
  const active = [...layers].filter((n) => n !== 'no-go' || canSecurity);
  const layerQueries = useQueries({
    queries: active.map((n) => ({ queryKey: ['map-layer', n], queryFn: () => getMapLayer(n), staleTime: 10 * 60_000, retry: false })),
  });
  const overlays = useMemo(() => {
    const o: Partial<Record<MapLayerName, GeoJSON.FeatureCollection>> = {};
    active.forEach((n, i) => {
      const d = layerQueries[i]?.data;
      if (d) o[n] = d;
    });
    return o;
  }, [active.join(), layerQueries]);
  const failed = new Set(active.filter((_, i) => layerQueries[i]?.isError));

  const all = projects.data?.features ?? [];
  const cat = (p: MapProjectProperties) => categoryOf(p.status, p.health);
  const drafts = all.filter((f) => cat(f.properties) === 'draft').length;
  const options = (pick: (p: MapProjectProperties) => string[] | undefined) =>
    [...new Set(all.flatMap((f) => pick(f.properties) ?? []))].sort().map((v) => ({ value: v, label: v }));

  const filtered: MapProjectsResponse | undefined = projects.data && {
    type: 'FeatureCollection',
    features: all.filter(({ properties: p }) => {
      const c = cat(p);
      if (c === 'draft' && !showDrafts) return false;
      if (status.size && !status.has(c)) return false;
      if (phase.size && !PHASES.some((ph) => phase.has(ph.value) && ph.test(c === 'operational' ? null : p.currentGate))) return false;
      if (funding.size && !funding.has(p.fundingRoute ?? '')) return false;
      if (contractor.size && !(p.contractors ?? []).some((x) => contractor.has(x))) return false;
      if (state.size && !(p.states ?? []).some((x) => state.has(x))) return false;
      return true;
    }),
  };
  const shown = filtered?.features ?? [];
  const filtering = status.size + phase.size + funding.size + contractor.size + state.size > 0;

  const select = (id: string) => {
    setSelectedId(id);
    setFocusId(id);
  };

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = all.find((f) => f.properties.name.toLowerCase().includes(q) || (f.properties.states ?? []).some((s) => s.toLowerCase() === q));
    if (match) {
      setSearchMessage(null);
      select(match.properties.id);
    } else {
      setSearchMessage(`No project matches "${search.trim()}".`);
    }
  }

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
      <div className="relative min-h-[60vh] flex-1 shrink-0 overflow-hidden">
        <MapView data={filtered} overlays={overlays} selectedId={selectedId} focusId={focusId} onSelect={select} />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-start gap-2">
            <form onSubmit={onSearch} role="search" className="pointer-events-auto flex flex-col gap-1">
              <label htmlFor="map-search" className="sr-only">Find a project, town or state</label>
              <div className="flex">
                <input id="map-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search project, town or state" className="min-h-11 w-64 rounded-l-md border-2 border-r-0 border-line-strong bg-surface px-4" />
                <button type="submit" className="min-h-11 rounded-r-md bg-brand-900 px-4 font-semibold text-white">Find</button>
              </div>
              {searchMessage && <p role="status" className="rounded bg-surface px-3 py-1 text-sm">{searchMessage}</p>}
            </form>
            <div className="pointer-events-auto flex flex-wrap gap-2" role="group" aria-label="Filter projects">
              <FilterChip label="Status" options={CATEGORIES.filter((c) => c !== 'draft').map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))} chosen={status} onChange={setStatus} />
              <FilterChip label="Phase" options={PHASES.map(({ value, label }) => ({ value, label }))} chosen={phase} onChange={setPhase} />
              <FilterChip label="Funding" options={FUNDING} chosen={funding} onChange={setFunding} />
              <FilterChip label="Contractor" options={options((p) => p.contractors)} chosen={contractor} onChange={setContractor} />
              <FilterChip label="State" options={options((p) => p.states)} chosen={state} onChange={setState} />
            </div>
          </div>
          <div className="pointer-events-auto flex flex-wrap items-center gap-3">
            <Counters />
            {filtering && (
              <p role="status" className="rounded-md bg-surface/95 px-3 py-2 shadow-sm ring-1 ring-line">
                Showing {shown.filter((f) => cat(f.properties) !== 'draft').length} of {all.filter((f) => cat(f.properties) !== 'draft').length} projects.{' '}
                <button type="button" className="font-semibold text-brand-900 underline underline-offset-4" onClick={() => { setStatus(new Set()); setPhase(new Set()); setFunding(new Set()); setContractor(new Set()); setState(new Set()); }}>
                  Clear filters
                </button>
              </p>
            )}
            <div className="pointer-events-auto ml-auto flex gap-2">
              {drafts > 0 && (
                <button type="button" aria-pressed={showDrafts} onClick={() => setShowDrafts((v) => !v)} className={`min-h-11 rounded-full border-2 border-dashed px-4 font-medium shadow-sm ${showDrafts ? 'border-status-draft bg-surface' : 'border-line bg-canvas text-ink-muted line-through'}`}>
                  Drafts ({drafts})
                </button>
              )}
              {canCreate && (
                <Link href="/projects/new" className="inline-flex min-h-11 items-center rounded-md bg-brand-900 px-5 font-semibold text-white shadow-sm hover:bg-brand-800">
                  New project
                </Link>
              )}
            </div>
          </div>
          <div className="pointer-events-auto w-fit">
            <Legend categories={CATEGORIES.filter((c) => c !== 'draft' || drafts > 0)} />
          </div>
        </div>

        {selectedId && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex p-4 pt-36">
            <ProjectCardPanel id={selectedId} onClose={() => setSelectedId(null)} line={all.find((f) => f.properties.id === selectedId)?.geometry.coordinates} />
          </div>
        )}

        <nav aria-label="Projects on the map" className="sr-only">
          <ul>
            {shown.map((f) => (
              <li key={f.properties.id}>
                <button type="button" onClick={() => select(f.properties.id)}>
                  {f.properties.name}, {CATEGORY_LABEL[cat(f.properties)]}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {projects.isError && (
          <p role="alert" className="absolute bottom-8 right-4 rounded-md bg-surface p-3 text-danger shadow">Projects could not be loaded. Retrying…</p>
        )}
      </div>

      {/* Under the map on a narrow screen, over its bottom-left corner on a wide one. */}
      <div className="p-4 lg:absolute lg:bottom-0 lg:left-0">
        <LayersPanel on={layers} onToggle={toggleLayer} canSecurity={canSecurity} failed={failed} />
      </div>
    </main>
  );
}
