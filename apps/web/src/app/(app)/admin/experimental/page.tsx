'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { EXPERIMENTAL_LABEL, lookParam, WhereToLook } from '@/components/flags/WhereToLook';
import { QueryState, Section } from '@/components/ui/Section';
import { getChangeFlagProjects, getChangeFlags } from '@/lib/endpoints';
import { formatDate } from '@/lib/format';

const FlagsMap = dynamic(() => import('@/components/flags/FlagsMap').then((m) => m.FlagsMap), { ssr: false });

/**
 * Experimental features for the IT administrator: "Where to look", the satellite change flags, while they are checked.
 * Switched on in Settings; hidden from the Director, the project manager and the resident engineer until then.
 */
export default function ExperimentalPage() {
  return (
    <Suspense>
      <Experimental />
    </Suspense>
  );
}

function Experimental() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const list = useQuery({ queryKey: ['change-flag-projects'], queryFn: getChangeFlagProjects });
  const projectId = params.get('project') ?? list.data?.projects[0]?.id ?? '';
  const flags = useQuery({ queryKey: ['change-flags', projectId], queryFn: () => getChangeFlags(projectId), enabled: !!projectId && !!list.data?.enabled });
  // ?look=<from>-<to>: that stretch, marked and fitted on the map.
  const look = params.get('look');
  const focus = useMemo(() => {
    const [from = NaN, to = NaN] = (look ?? '').split('-').map(Number);
    const parts = (flags.data?.segments ?? []).filter((s) => s.fromM >= from && s.toM <= to);
    if (!parts.length) return null;
    return { key: look!, line: { type: 'LineString' as const, coordinates: parts.flatMap((s, i) => (i ? s.line.coordinates.slice(1) : s.line.coordinates)) } };
  }, [look, flags.data]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-semibold text-brand-900">Experimental</h1>
        <span className="rounded bg-[#fff4e0] px-2 py-0.5 text-sm font-semibold text-[#7a4a00]">{EXPERIMENTAL_LABEL}</span>
      </div>
      <QueryState loading={list.isPending} error={list.isError} />
      {list.data && !list.data.enabled && (
        <Section title="Where to look (satellite change flags)">
          <p>
            Switched off. Switch it on in <Link href="/admin/settings#experimental" className="font-semibold underline underline-offset-4">Settings</Link> to see the flags and let the nightly run work them out.
          </p>
        </Section>
      )}
      {list.data?.enabled && (
        <>
          <label className="flex max-w-sm flex-col gap-1 text-sm font-medium">
            Project
            <select value={projectId} onChange={(e) => router.push(`${path}?project=${e.target.value}`)} className="min-h-11 rounded-md border-2 border-line-strong bg-surface px-3 text-base font-normal">
              {list.data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.lastRunAt ? `, worked out ${formatDate(p.lastRunAt)}` : ''}
                </option>
              ))}
            </select>
          </label>
          {list.data.projects.length === 0 && <p className="text-ink-muted">No project has flags yet. They are worked out each night after new pictures arrive, or with pnpm satellite:flags.</p>}
          <QueryState loading={!!projectId && flags.isPending} error={flags.isError} />
          {flags.data && (
            <>
              <div id="flags-map" className="scroll-mt-4">
                <FlagsMap segments={flags.data.segments} focus={focus} />
              </div>
              <WhereToLook flags={flags.data} mapHref={(s) => `${path}?project=${projectId}&look=${lookParam(s)}#flags-map`} />
            </>
          )}
        </>
      )}
    </div>
  );
}
