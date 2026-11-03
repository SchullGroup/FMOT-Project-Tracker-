'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getTasks } from '@/lib/endpoints';
import { formatAge } from '@/lib/status';

/** "Your tasks today": the four oldest open tasks, and a link to the rest. */
export function TasksPanel() {
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: getTasks });

  const all = (tasks.data?.groups ?? [])
    .flatMap((g) => g.tasks.map((t) => ({ ...t, project: g.project })))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const shown = all.slice(0, 4);

  return (
    <section aria-labelledby="tasks-heading" className="flex flex-col gap-3 p-5">
      <h2 id="tasks-heading" className="flex items-center gap-3 text-xl font-semibold">
        Your tasks today
        {all.length > 0 && (
          <span className="tabular rounded-full bg-brand-900 px-2.5 text-base text-white">{all.length}</span>
        )}
      </h2>

      {tasks.isPending && <p className="text-ink-muted">Loading tasks…</p>}
      {tasks.isError && <p className="text-danger">Tasks could not be loaded. They will retry shortly.</p>}
      {tasks.isSuccess && all.length === 0 && (
        <p className="rounded-md bg-surface p-4 text-lg">Nothing needs you today.</p>
      )}

      <ul className="flex flex-col gap-3">
        {shown.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tasks?task=${t.id}`}
              className={`block rounded-md border bg-surface p-4 hover:border-brand-900 ${t.overdue ? 'border-status-stalled' : 'border-line'}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold">{t.title}</span>
                <span className={`shrink-0 text-sm tabular ${t.overdue ? 'font-semibold text-status-stalled' : 'text-ink-muted'}`}>
                  {t.overdue ? 'Overdue' : formatAge(t.createdAt)}
                </span>
              </span>
              {t.project && <span className="mt-1 block text-sm text-ink-muted">{t.project.name}</span>}
              <span className="mt-1 block text-sm">{t.reason}</span>
            </Link>
          </li>
        ))}
      </ul>

      {all.length > shown.length && (
        <Link href="/tasks" className="min-h-12 py-3 font-semibold text-brand-900 underline underline-offset-4">
          See all {all.length} tasks
        </Link>
      )}
    </section>
  );
}
