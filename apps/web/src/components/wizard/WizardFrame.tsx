'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export const STEPS = ['Basics', 'Funding route', 'Geography', 'People', 'Documents', 'Review and publish'] as const;

/*
 * W6: the frame around every wizard step. The stepper shows where you are
 * and which steps are done; done steps can be reopened.
 */
export function WizardFrame(props: {
  draftId: string | null;
  step: number;
  done: boolean[];
  title: string;
  intro?: string;
  children: ReactNode;
  aside?: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="border-b border-line bg-surface px-6 py-4">
        <p className="text-sm text-ink-muted">New project</p>
        <h1 className="text-2xl font-semibold text-brand-900">{props.title}</h1>
      </div>
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)_minmax(0,1fr)]">
        <nav aria-label="Steps" className="border-b border-line bg-surface p-4 lg:border-b-0 lg:border-r">
          <ol className="flex gap-2 overflow-x-auto lg:flex-col">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const current = n === props.step;
              const reachable = props.draftId && (props.done[i] || n <= firstOpen(props.done));
              const content = (
                <>
                  <span
                    aria-hidden
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${current ? 'bg-brand-900 text-white' : props.done[i] ? 'bg-status-operational text-white' : 'bg-canvas text-ink-muted ring-1 ring-line-strong'}`}
                  >
                    {props.done[i] && !current ? '✓' : n}
                  </span>
                  <span className={current ? 'font-semibold' : ''}>{label}</span>
                  <span className="sr-only">{current ? '(this step)' : props.done[i] ? '(done)' : ''}</span>
                </>
              );
              return (
                <li key={label} className="shrink-0">
                  {reachable && !current ? (
                    <Link href={`/setup/${props.draftId}?step=${n}`} className="flex min-h-12 items-center gap-3 rounded-md px-2 hover:bg-brand-50">
                      {content}
                    </Link>
                  ) : (
                    <span aria-current={current ? 'step' : undefined} className={`flex min-h-12 items-center gap-3 rounded-md px-2 ${current ? 'bg-brand-50' : 'text-ink-muted'}`}>
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-col gap-6 p-6">
          {props.intro && <p className="max-w-prose text-lg">{props.intro}</p>}
          {props.children}
        </div>

        <div className="min-h-80 p-6 lg:pl-0">{props.aside}</div>
      </div>
      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-line bg-surface px-6 py-3">{props.footer}</div>
    </main>
  );
}

function firstOpen(done: boolean[]): number {
  const i = done.findIndex((d) => !d);
  return i === -1 ? done.length : i + 1;
}
