import type { ReactNode } from 'react';

/** A titled block inside a project section page. */
export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-md bg-surface p-5 ring-1 ring-line">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Loading, error and empty states in one place, worded the same everywhere. */
export function QueryState({ loading, error, empty, emptyText }: { loading: boolean; error: boolean; empty?: boolean; emptyText?: string }) {
  if (loading) return <p className="text-ink-muted">Loading…</p>;
  if (error) return <p className="text-danger">This could not be loaded. It will retry shortly.</p>;
  if (empty) return <p className="text-ink-muted">{emptyText ?? 'Nothing here yet.'}</p>;
  return null;
}

/** A plain, readable table that scrolls sideways on small screens. */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-base">
        <thead>
          <tr className="border-b-2 border-line">
            {head.map((h, i) => (
              <th key={`${i}:${h}`} scope="col" className="whitespace-nowrap px-3 py-2 text-sm font-semibold text-ink-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-line [&_td]:px-3 [&_td]:py-3 [&_td]:align-top">{children}</tbody>
      </table>
    </div>
  );
}
