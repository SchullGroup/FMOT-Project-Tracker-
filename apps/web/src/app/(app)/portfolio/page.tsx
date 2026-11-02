'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Counters } from '@/components/map/Counters';
import { pollWhileMaking, ReportList } from '@/components/reports/ReportList';
import { useCan } from '@/components/Session';
import { Button } from '@/components/ui/Button';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { exportEyemark, generatePortfolioReport, getPortfolio, getPortfolioReports } from '@/lib/endpoints';
import { formatDate, lowerFirst } from '@/lib/format';
import { messageFor } from '@/lib/messages';
import { CATEGORY_COLOUR, CATEGORY_LABEL, categoryOf, HEALTH_LABEL } from '@/lib/status';
import type { PortfolioRow } from '@/lib/types';

type Sort = 'waiting' | 'name' | 'built';
const SORTS: Record<Sort, { label: string; fn: (a: PortfolioRow, b: PortfolioRow) => number }> = {
  waiting: { label: 'Longest waiting at a gate', fn: (a, b) => (b.daysAtGate ?? -1) - (a.daysAtGate ?? -1) },
  built: { label: 'Least built first', fn: (a, b) => (a.physicalPercent ?? -1) - (b.physicalPercent ?? -1) },
  name: { label: 'Name', fn: (a, b) => a.name.localeCompare(b.name) },
};

/*
 * W8.2 Portfolio: every project in one table, longest-waiting first, so the
 * question "which project is stuck, and on whom?" has a one-line answer.
 */
export default function PortfolioPage() {
  const qc = useQueryClient();
  const canEyemark = useCan('reports:export_eyemark');
  const rows = useQuery({ queryKey: ['portfolio'], queryFn: getPortfolio });
  const reports = useQuery({ queryKey: ['portfolio-reports'], queryFn: getPortfolioReports, refetchInterval: (q) => pollWhileMaking(q.state.data) });
  const [sort, setSort] = useState<Sort>('waiting');
  const [hideOperational, setHideOperational] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(
    () => (rows.data ?? []).filter((r) => !hideOperational || (r.status !== 'operational' && r.status !== 'closed')).sort(SORTS[sort].fn),
    [rows.data, sort, hideOperational],
  );
  const showMoney = shown.some((r) => r.financialPercent !== null);

  async function make(what: 'pdf' | 'xlsx' | 'eyemark') {
    setBusy(what);
    setError(null);
    try {
      if (what === 'eyemark') await exportEyemark();
      else await generatePortfolioReport(what);
      await qc.invalidateQueries({ queryKey: ['portfolio-reports'] });
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold text-brand-900">Portfolio</h1>
        <Counters />
      </div>

      <Section
        title="Every project"
        aside={
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex min-h-11 items-center gap-2">
              <input type="checkbox" checked={hideOperational} onChange={(e) => setHideOperational(e.target.checked)} className="size-5 accent-brand-900" />
              Hide lines already running
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Order</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-h-11 rounded-md border-2 border-line-strong bg-surface px-3">
                {(Object.keys(SORTS) as Sort[]).map((k) => <option key={k} value={k}>{SORTS[k].label}</option>)}
              </select>
            </label>
          </div>
        }
      >
        <QueryState loading={rows.isPending} error={rows.isError} empty={rows.isSuccess && shown.length === 0} emptyText="No projects to show." />
        {shown.length > 0 && (
          <Table head={['Project', 'Status', 'Where it is', 'Waiting', 'Built', ...(showMoney ? ['Paid'] : []), 'Next milestone']}>
            {shown.map((r) => {
              const cat = categoryOf(r.status, r.health);
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/projects/${r.id}`} className="font-semibold text-brand-900 underline underline-offset-4">{r.name}</Link>
                    <span className="block text-sm text-ink-muted">{r.states.length > 3 ? `${r.states.length} states` : r.states.join(', ')}{r.contractor ? `, ${r.contractor}` : ''}</span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span aria-hidden className="size-2.5 rounded-full" style={{ background: CATEGORY_COLOUR[cat] }} />
                      {CATEGORY_LABEL[cat]}
                    </span>
                    {r.health && r.health !== 'on_track' && cat !== 'stalled' && <span className="block text-sm font-semibold text-status-construction">{HEALTH_LABEL[r.health]}</span>}
                  </td>
                  <td>{r.currentGate ? <>Gate {r.currentGate.no}, {lowerFirst(r.currentGate.name)}</> : 'Running'}</td>
                  <td className={`tabular whitespace-nowrap ${r.daysAtGate !== null && r.daysAtGate > 60 ? 'font-semibold text-status-stalled' : ''}`}>{r.daysAtGate !== null ? `${r.daysAtGate} days` : '–'}</td>
                  <td className="tabular">{r.physicalPercent !== null ? `${r.physicalPercent}%` : '–'}</td>
                  {showMoney && <td className="tabular">{r.financialPercent !== null ? `${r.financialPercent}%` : '–'}</td>}
                  <td className="text-sm">
                    {r.nextMilestone ? (
                      <>
                        {r.nextMilestone.name}
                        {r.nextMilestone.dueOn && (
                          <span className={`block ${new Date(r.nextMilestone.dueOn) < new Date() ? 'font-semibold text-status-stalled' : 'text-ink-muted'}`}>
                            {new Date(r.nextMilestone.dueOn) < new Date() ? 'Was due ' : 'Due '}{formatDate(r.nextMilestone.dueOn)}
                          </span>
                        )}
                      </>
                    ) : '–'}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Section>

      <Section
        title="Portfolio reports"
        aside={
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" busy={busy === 'pdf'} onClick={() => make('pdf')}>Make a PDF</Button>
            <Button variant="secondary" busy={busy === 'xlsx'} onClick={() => make('xlsx')}>Make an Excel file</Button>
            {canEyemark && <Button variant="secondary" busy={busy === 'eyemark'} onClick={() => make('eyemark')}>Export for Eyemark</Button>}
          </div>
        }
      >
        <p className="mb-4 text-ink-muted">Reports are made from the data in the tracker. You get a text when a report is ready.</p>
        {error && <p role="alert" className="mb-3 text-danger">{error}</p>}
        <ReportList reports={reports.data ?? []} empty="No portfolio reports made yet." />
      </Section>
    </main>
  );
}
