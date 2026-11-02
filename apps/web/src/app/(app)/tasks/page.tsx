'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { TaskView } from '@/components/tasks/TaskView';
import { getTasks } from '@/lib/endpoints';
import { formatAge } from '@/lib/status';

/*
 * W7: the inbox on the left, the open task on the right (the task alone on
 * small screens). After acting, the next task opens on its own.
 */
function Tasks() {
  const router = useRouter();
  const selected = useSearchParams().get('task');
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: getTasks });
  const [message, setMessage] = useState<string | null>(null);
  const flat = (tasks.data?.groups ?? []).flatMap((g) => g.tasks);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 6000);
    return () => clearTimeout(t);
  }, [message]);

  const open = (id: string | null) => router.replace(id ? `/tasks?task=${id}` : '/tasks', { scroll: false });

  return (
    <main className="grid flex-1 lg:grid-cols-[400px_1fr]">
      <div className={`border-line bg-canvas lg:border-r ${selected ? 'hidden lg:block' : ''}`}>
        <div className="flex items-baseline justify-between gap-3 p-5">
          <h1 className="text-2xl font-semibold text-brand-900">Your tasks</h1>
          {tasks.data && <p className="text-ink-muted">Done today: <span className="tabular font-semibold text-ink">{tasks.data.doneToday}</span></p>}
        </div>
        {tasks.isPending && <p className="px-5 text-ink-muted">Loading tasks…</p>}
        {tasks.data && flat.length === 0 && <p className="mx-5 rounded-md bg-surface p-5 text-lg">Nothing needs you today.</p>}
        <div className="flex flex-col gap-6 px-5 pb-6">
          {tasks.data?.groups.filter((g) => g.tasks.length).map((g) => (
            <section key={g.project?.id ?? 'none'}>
              <h2 className="mb-2 font-semibold text-ink-muted">{g.project?.name ?? 'Not tied to a project'}</h2>
              <ul className="flex flex-col gap-2">
                {g.tasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tasks?task=${t.id}`}
                      scroll={false}
                      aria-current={selected === t.id ? 'true' : undefined}
                      className={`block rounded-md border-2 bg-surface p-4 ${selected === t.id ? 'border-brand-900' : t.overdue ? 'border-status-stalled/60' : 'border-transparent ring-1 ring-line hover:ring-brand-900'}`}
                    >
                      <span className="flex justify-between gap-3">
                        <span className="font-semibold">{t.title}</span>
                        <span className={`shrink-0 text-sm tabular ${t.overdue ? 'font-semibold text-status-stalled' : 'text-ink-muted'}`}>{t.overdue ? 'Overdue' : formatAge(t.createdAt)}</span>
                      </span>
                      <span className="mt-1 block text-sm">{t.reason}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <div className={selected ? '' : 'hidden lg:block'}>
        {message && (
          <p role="status" className="m-6 mb-0 rounded-md bg-[#e3f1e6] p-4 text-lg font-medium text-[#1f5a2b]">
            {message}
          </p>
        )}
        {selected ? (
          <>
            <Link href="/tasks" className="m-6 mb-0 inline-flex min-h-11 items-center font-semibold text-brand-900 underline underline-offset-4 lg:hidden">All tasks</Link>
            <TaskView
              key={selected}
              id={selected}
              onDone={(m) => {
                setMessage(m);
                const next = flat.find((t) => t.id !== selected);
                open(next?.id ?? null);
              }}
            />
          </>
        ) : (
          <p className="p-6 text-lg text-ink-muted">{flat.length ? 'Choose a task on the left.' : ''}</p>
        )}
      </div>
    </main>
  );
}

export default function TasksPage() {
  return (
    <Suspense>
      <Tasks />
    </Suspense>
  );
}
