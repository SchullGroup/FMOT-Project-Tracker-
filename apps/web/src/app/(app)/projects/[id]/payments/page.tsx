'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StatusPill } from '@/components/ui/Pill';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getCertificates, getLots } from '@/lib/endpoints';
import { formatDate, formatMonth, formatNaira } from '@/lib/format';
import type { Certificate } from '@/lib/types';

/*
 * W5.6 Payments: certificates per lot and where each sits in the approval
 * chain. Amounts appear only for people with the financial permission; the
 * API leaves them out otherwise.
 */
export default function PaymentsPage() {
  const id = useProjectId();
  const lots = useQuery({ queryKey: ['lots', id], queryFn: () => getLots(id) });
  const certs = useQueries({
    queries: (lots.data ?? []).map((l) => ({ queryKey: ['certificates', l.id], queryFn: () => getCertificates(l.id) })),
  });
  const all: Certificate[] = certs.flatMap((q) => q.data ?? []).sort((a, b) => b.period.localeCompare(a.period) || b.number - a.number);

  return (
    <div className="flex flex-col gap-5">
      <QueryState loading={lots.isPending || certs.some((q) => q.isPending)} error={lots.isError} empty={lots.isSuccess && all.length === 0} emptyText="No payment certificates yet." />
      {all.map((c) => (
        <Section
          key={c.id}
          title={`Certificate ${c.number}, ${c.lotName}, ${formatMonth(c.period)}`}
          aside={<StatusPill status={c.status} />}
        >
          <dl className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            <Money label="Gross" kobo={c.grossKobo} />
            <Money label="Retention" kobo={c.retentionKobo} />
            <Money label="Advance recovery" kobo={c.advanceRecoveryKobo} />
            <Money label="Net to pay" kobo={c.netKobo} strong />
          </dl>
          <details open={c.status !== 'paid'} className="group">
            <summary className="mb-2 flex min-h-11 cursor-pointer items-center font-semibold text-brand-900 underline underline-offset-4 group-open:mb-3">
              {c.status === 'paid' ? 'Show who approved it' : 'Approval steps'}
            </summary>
          <Table head={['Step', 'Who', 'Done by', 'When']}>
            {c.chain.map((s) => (
              <tr key={s.step}>
                <td className="font-medium">{s.step}</td>
                <td>{s.role}</td>
                <td>{s.actor ?? <span className="text-ink-muted">Waiting</span>}</td>
                <td className="tabular">{formatDate(s.at)}</td>
              </tr>
            ))}
          </Table>
          </details>
        </Section>
      ))}
    </div>
  );
}

function Money({ label, kobo, strong }: { label: string; kobo: number | string | null; strong?: boolean }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={`tabular ${strong ? 'text-xl font-semibold' : 'text-lg'}`}>{formatNaira(kobo, { compact: true })}</dd>
    </div>
  );
}
