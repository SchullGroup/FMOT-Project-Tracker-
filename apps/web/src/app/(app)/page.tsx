'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Counters } from '@/components/map/Counters';
import { Legend } from '@/components/map/Legend';
import { CURRENT_PROJECT_KEY, ProjectCardPanel } from '@/components/map/ProjectCardPanel';
import { TasksPanel } from '@/components/map/TasksPanel';
import { useCan } from '@/components/Session';
import { getMapProjects } from '@/lib/endpoints';
import { CATEGORY_LABEL, categoryOf, type MapCategory } from '@/lib/status';

const MapView = dynamic(() => import('@/components/map/MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center text-ink-muted">Loading the map…</div>,
});

const ALL: MapCategory[] = ['operational', 'construction', 'planned', 'stalled', 'draft'];

/** W3 Map home: Nigeria with every project the person may see. */
export default function MapHome() {
  const canCreate = useCan('projects:create');
  const projects = useQuery({ queryKey: ['map-projects'], queryFn: getMapProjects });

  const [visible, setVisible] = useState<Set<MapCategory>>(new Set(ALL));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // Open on a project named in the link (?focus=, used by the wizard's map
  // preview), otherwise on the person's current project if they set one.
  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get('focus') ?? localStorage.getItem(CURRENT_PROJECT_KEY);
    if (current) {
      setSelectedId(current);
      setFocusId(current);
    }
  }, []);

  const features = projects.data?.features ?? [];
  const counts = useMemo(() => {
    const c = Object.fromEntries(ALL.map((k) => [k, 0])) as Record<MapCategory, number>;
    for (const f of features) c[categoryOf(f.properties.status, f.properties.health)]++;
    return c;
  }, [features]);
  const categories = ALL.filter((c) => c !== 'draft' || counts.draft > 0);

  const select = (id: string) => {
    setSelectedId(id);
    setFocusId(id);
  };

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = features.find((f) => f.properties.name.toLowerCase().includes(q));
    if (match) {
      setSearchMessage(null);
      select(match.properties.id);
    } else {
      setSearchMessage(`No project matches "${search.trim()}".`);
    }
  }

  return (
    <main className="grid flex-1 grid-rows-[minmax(60vh,1fr)_auto] lg:grid-cols-[360px_1fr] lg:grid-rows-1">
      <div className="order-2 overflow-y-auto border-line bg-canvas lg:order-1 lg:border-r">
        <TasksPanel />
      </div>

      <div className="relative order-1 min-h-[60vh] overflow-hidden lg:order-2">
        <MapView data={projects.data} visible={visible} selectedId={selectedId} focusId={focusId} onSelect={select} />

        {/* Top overlay: search, counters, new project */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start gap-3 p-4">
          <form onSubmit={onSearch} role="search" className="pointer-events-auto flex flex-col gap-1">
            <label htmlFor="map-search" className="sr-only">
              Find a project
            </label>
            <div className="flex">
              <input
                id="map-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a project or town"
                className="min-h-12 w-64 rounded-l-md border-2 border-r-0 border-line-strong bg-surface px-4"
              />
              <button type="submit" className="min-h-12 rounded-r-md bg-brand-900 px-4 font-semibold text-white">
                Find
              </button>
            </div>
            {searchMessage && <p role="status" className="rounded bg-surface px-3 py-1 text-sm">{searchMessage}</p>}
          </form>

          <div className="pointer-events-auto">
            <Counters />
          </div>

          {canCreate && (
            <Link
              href="/projects/new"
              className="pointer-events-auto ml-auto inline-flex min-h-12 items-center rounded-md bg-brand-900 px-5 font-semibold text-white shadow-sm hover:bg-brand-800"
            >
              New project
            </Link>
          )}
        </div>

        <div className="pointer-events-auto absolute left-4 top-28">
          <Legend
            categories={categories}
            visible={visible}
            counts={counts}
            onToggle={(c) =>
              setVisible((v) => {
                const next = new Set(v);
                if (next.has(c)) next.delete(c);
                else next.add(c);
                return next;
              })
            }
          />
        </div>

        {selectedId && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex p-4 pt-24">
            <ProjectCardPanel id={selectedId} onClose={() => setSelectedId(null)} />
          </div>
        )}

        {/* The same projects as a list, for keyboard and screen-reader users. */}
        <nav aria-label="Projects on the map" className="sr-only">
          <ul>
            {features
              .filter((f) => visible.has(categoryOf(f.properties.status, f.properties.health)))
              .map((f) => (
                <li key={f.properties.id}>
                  <button type="button" onClick={() => select(f.properties.id)}>
                    {f.properties.name}, {CATEGORY_LABEL[categoryOf(f.properties.status, f.properties.health)]}
                  </button>
                </li>
              ))}
          </ul>
        </nav>

        {projects.isError && (
          <p role="alert" className="absolute bottom-8 right-4 rounded-md bg-surface p-3 text-danger shadow">
            Projects could not be loaded. Retrying…
          </p>
        )}
      </div>
    </main>
  );
}
