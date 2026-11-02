'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useProjectId } from '@/components/project/ProjectFrame';
import { pollWhileMaking, ReportList } from '@/components/reports/ReportList';
import { useCan } from '@/components/Session';
import { Button } from '@/components/ui/Button';
import { QueryState, Section } from '@/components/ui/Section';
import { generateProjectReport, getProjectReports } from '@/lib/endpoints';
import { formatMonth } from '@/lib/format';
import { messageFor } from '@/lib/messages';

/** The last twelve months, newest first, as YYYY-MM. */
function recentMonths(): string[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

/*
 * W5.12 Reports: the monthly progress report is made automatically on the
 * 2nd of each month; anyone can ask for another month, and people with the
 * financial permission can make the lender report.
 */
export default function ReportsPage() {
  const id = useProjectId();
  const qc = useQueryClient();
  const canFinance = useCan('finance:read_amounts');
  const reports = useQuery({ queryKey: ['reports', id], queryFn: () => getProjectReports(id), refetchInterval: (q) => pollWhileMaking(q.state.data) });
  const months = recentMonths();
  const [kind, setKind] = useState<'monthly' | 'lender'>('monthly');
  const [period, setPeriod] = useState(months[0]!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<string | null>(null);

  async function make() {
    setBusy(true);
    setError(null);
    try {
      await generateProjectReport(id, kind, period);
      await qc.invalidateQueries({ queryKey: ['reports', id] });
      setMade(`The ${kind === 'monthly' ? 'monthly progress' : 'lender'} report for ${formatMonth(period)} is being made. You will get a text when it is ready.`);
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Make a report">
        <div className="flex flex-wrap items-end gap-4">
          {canFinance && (
            <fieldset>
              <legend className="mb-2 font-semibold">Report</legend>
              <div className="flex flex-wrap gap-2">
                {(['monthly', 'lender'] as const).map((k) => (
                  <label key={k} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 px-4 ${kind === k ? 'border-brand-900 bg-brand-50 font-semibold' : 'border-line'}`}>
                    <input type="radio" name="kind" checked={kind === k} onChange={() => setKind(k)} className="size-5 accent-brand-900" />
                    {k === 'monthly' ? 'Monthly progress' : 'For the lender'}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label className="flex flex-col gap-2">
            <span className="font-semibold">Month</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="min-h-12 rounded-md border-2 border-line-strong bg-surface px-3 text-lg">
              {months.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
            </select>
          </label>
          <Button busy={busy} onClick={make}>Make the report</Button>
        </div>
        {made && <p role="status" className="mt-4 rounded-md bg-[#e3f1e6] p-3 text-[#1f5a2b]">{made}</p>}
        {error && <p role="alert" className="mt-4 text-danger">{error}</p>}
      </Section>
      <Section title="Reports for this project">
        <QueryState loading={reports.isPending} error={reports.isError} />
        {reports.data && <ReportList reports={reports.data} empty="No reports yet. The first monthly report is made on the 2nd of next month." />}
      </Section>
    </div>
  );
}
