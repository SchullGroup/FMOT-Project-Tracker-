'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { PhotoThumb } from '@/components/project/PhotoThumb';
import { useProjectId } from '@/components/project/ProjectFrame';
import { Pill, StatusPill } from '@/components/ui/Pill';
import { QueryState, Section } from '@/components/ui/Section';
import { getSubmissions } from '@/lib/endpoints';
import { formatChainage, formatDate } from '@/lib/format';
import type { Submission } from '@/lib/types';

const KIND_LABEL: Record<Submission['kind'], string> = {
  photo: 'Photo',
  daily_report: 'Daily report',
  milestone_claim: 'Milestone claim',
  incident: 'Incident',
};

const FILTERS = [
  { key: 'all', label: 'Everything' },
  { key: 'pending_re', label: 'Waiting for the engineer' },
  { key: 'flagged', label: 'Flagged by the checks' },
  { key: 'verified', label: 'Verified' },
  { key: 'sent_back', label: 'Sent back' },
] as const;

/*
 * W5.4 Photos and reports. What a person sees here depends on their role:
 * the API only returns unverified items to the submitter, the lot's
 * engineer and the project manager. Each card opens the item (W7.4), where
 * the lot's engineer verifies it or sends it back.
 */
export default function PhotosPage() {
  const id = useProjectId();
  const items = useQuery({ queryKey: ['submissions', id], queryFn: () => getSubmissions(id) });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [order, setOrder] = useState<'date' | 'chainage'>('date');

  const shown = (items.data ?? [])
    .filter((s) => (filter === 'all' ? true : filter === 'flagged' ? s.flagged : s.status === filter))
    .sort((a, b) => (order === 'date' ? b.capturedAt.localeCompare(a.capturedAt) : (a.chainageM ?? 0) - (b.chainageM ?? 0)));

  return (
    <Section
      title="Photos and reports from site"
      aside={
        <label className="flex items-center gap-2">
          <span className="text-sm text-ink-muted">Order by</span>
          <select value={order} onChange={(e) => setOrder(e.target.value as 'date' | 'chainage')} className="min-h-11 rounded-md border-2 border-line-strong bg-surface px-3">
            <option value="date">Newest first</option>
            <option value="chainage">Along the line</option>
          </select>
        </label>
      }
    >
      <div role="group" aria-label="Show" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`min-h-11 rounded-full border-2 px-4 font-medium ${filter === f.key ? 'border-brand-900 bg-brand-900 text-white' : 'border-line-strong bg-surface hover:bg-brand-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <QueryState loading={items.isPending} error={items.isError} empty={shown.length === 0} emptyText="Nothing matches this filter." />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((s) => (
          <li key={s.id}>
            <Link
              href={`/projects/${id}/photos/${s.id}`}
              className={`flex h-full gap-4 rounded-md border bg-surface p-3 hover:bg-brand-50 focus-visible:outline-2 ${s.flagged ? 'border-status-construction' : 'border-line'}`}
            >
              <div className="w-32 shrink-0">
                {s.mediaId ? (
                  <PhotoThumb mediaId={s.mediaId} alt={`${KIND_LABEL[s.kind]} at ${formatChainage(s.chainageM)}`} />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center rounded-md bg-canvas text-sm text-ink-muted">{KIND_LABEL[s.kind]}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {KIND_LABEL[s.kind]}
                  {s.discipline ? `, ${s.discipline.toLowerCase()}` : ''}
                </p>
                <p className="tabular text-sm">{s.chainageM !== null ? formatChainage(s.chainageM) : s.lotName}</p>
                <p className="text-sm text-ink-muted">
                  {formatDate(s.capturedAt)}, {s.submittedBy}
                </p>
                {s.summary && <p className="mt-1 text-sm">{s.summary}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill status={s.status} />
                  {s.flagged && <Pill tone="warn">Flagged</Pill>}
                </div>
                {s.returnReason && <p className="mt-1 text-sm text-danger">Reason: {s.returnReason}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
