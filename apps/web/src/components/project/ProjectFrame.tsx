'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { getProjectCard } from '@/lib/endpoints';
import { CATEGORY_COLOUR, CATEGORY_LABEL, categoryOf, formatPhone } from '@/lib/status';

export const SECTIONS = [
  { slug: '', label: 'Overview' },
  { slug: 'gates', label: 'Gates' },
  { slug: 'corridor', label: 'Corridor' },
  { slug: 'photos', label: 'Photos and reports' },
  { slug: 'progress', label: 'Progress' },
  { slug: 'payments', label: 'Payments' },
  { slug: 'design', label: 'Design' },
  { slug: 'documents', label: 'Documents' },
  { slug: 'land', label: 'Land and community' },
  { slug: 'issues', label: 'Issues and variations' },
  { slug: 'people', label: 'People' },
  { slug: 'reports', label: 'Reports' },
  { slug: 'activity', label: 'Activity' },
] as const;

export function useProjectId(): string {
  return useParams<{ id: string }>().id;
}

/** W5: the header that stays on every project section, and the section list. */
export function ProjectFrame({ children }: { children: ReactNode }) {
  const id = useProjectId();
  const pathname = usePathname();
  const card = useQuery({ queryKey: ['card', id], queryFn: () => getProjectCard(id) });
  const c = card.data;
  const category = c ? categoryOf(c.status, c.health) : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-brand-800 text-white">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-md px-2 text-brand-100 underline underline-offset-4 hover:text-white">
            Back to map
          </Link>
          <h1 className="text-2xl font-semibold">{c?.name ?? 'Loading project…'}</h1>
          {c && category && (
            <>
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-white px-3 text-sm font-semibold text-ink">
                <span aria-hidden className="size-2.5 rounded-full" style={{ background: CATEGORY_COLOUR[category] }} />
                {CATEGORY_LABEL[category]}
                {c.health === 'behind' && category !== 'draft' ? ', behind' : ''}
              </span>
              {c.currentGate && (
                <span>
                  Gate {c.currentGate.no}{c.daysAtGate !== null ? `, ${c.daysAtGate} days at gate` : ''}
                </span>
              )}
              {c.physicalPercent !== null && <span className="tabular">{c.physicalPercent}% built</span>}
              {c.personInCharge && (
                <span className="ml-auto text-brand-100">
                  In charge: <span className="text-white">{c.personInCharge.name}</span>{' '}
                  <a href={`tel:${c.personInCharge.phone}`} className="tabular text-white underline underline-offset-4">
                    {formatPhone(c.personInCharge.phone)}
                  </a>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        <nav aria-label="Project sections" className="border-b border-line bg-surface lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
          <ul className="flex overflow-x-auto lg:flex-col lg:py-3">
            {SECTIONS.map((s) => {
              const href = `/projects/${id}${s.slug ? `/${s.slug}` : ''}`;
              const active = s.slug ? pathname.startsWith(href) : pathname === href;
              return (
                <li key={s.slug} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 items-center whitespace-nowrap px-5 ${active ? 'border-b-4 border-brand-900 font-semibold text-brand-900 lg:border-b-0 lg:border-l-4 lg:bg-brand-50' : 'hover:bg-brand-50'}`}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex-1 overflow-x-hidden p-5 lg:p-6">{card.isError ? <p className="text-danger">This project could not be loaded, or you cannot see it.</p> : children}</div>
      </div>
    </div>
  );
}
