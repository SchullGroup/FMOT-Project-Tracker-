'use client';

import { useState } from 'react';
import { Pill } from '@/components/ui/Pill';
import { Table } from '@/components/ui/Section';
import { getReportFile } from '@/lib/endpoints';
import { formatDate, formatMonth } from '@/lib/format';
import { messageFor } from '@/lib/messages';
import type { Report } from '@/lib/types';

const KIND: Record<Report['kind'], string> = {
  monthly: 'Monthly progress report',
  lender: 'Lender report',
  portfolio: 'Portfolio report',
  eyemark: 'Eyemark export',
};

/** A list of generated reports. While any is being made, the caller polls; ready ones download. */
export function ReportList({ reports, empty }: { reports: Report[]; empty: string }) {
  const [error, setError] = useState<string | null>(null);
  if (reports.length === 0) return <p className="text-ink-muted">{empty}</p>;

  async function download(r: Report) {
    setError(null);
    try {
      const { url } = await getReportFile(r.id);
      if (url && url !== '#') window.open(url, '_blank', 'noopener');
    } catch (e) {
      setError(messageFor(e));
    }
  }

  return (
    <>
      <Table head={['Report', 'Period', 'Made', '', '']}>
        {reports.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="font-medium">{KIND[r.kind]}</span>
              {r.version === 'finance' && <span className="block text-sm text-ink-muted">With the financial summary</span>}
            </td>
            <td className="whitespace-nowrap">{r.period ? formatMonth(r.period) : 'All projects'}</td>
            <td className="text-sm">
              {formatDate(r.createdAt)}
              <span className="block text-ink-muted">{r.requestedBy ? `by ${r.requestedBy}` : 'automatically'}</span>
            </td>
            <td>
              {r.status === 'ready' ? <Pill tone="good">Ready</Pill> : r.status === 'failed' ? <Pill tone="bad">Could not be made</Pill> : <Pill tone="info">Being made…</Pill>}
            </td>
            <td>
              {r.status === 'ready' && (
                <button type="button" onClick={() => download(r)} className="min-h-11 whitespace-nowrap rounded-md px-3 font-semibold text-brand-900 underline underline-offset-4 hover:bg-brand-50">
                  Download {r.format.toUpperCase()}
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
      {error && <p role="alert" className="mt-2 text-danger">{error}</p>}
    </>
  );
}

/** Poll every 3 seconds while any report in the list is still being made. */
export const pollWhileMaking = (data: Report[] | undefined) => (data?.some((r) => r.status === 'queued' || r.status === 'generating') ? 3000 : false);
