'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { ValuationForm } from '@/components/forms/ValuationForm';
import { useProjectId } from '@/components/project/ProjectFrame';
import { useCan } from '@/components/Session';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { QueryState, Section } from '@/components/ui/Section';
import { getCertificates, getLots } from '@/lib/endpoints';
import { formatDate, formatMonth, formatNaira, formatNairaExact, roleInSentence } from '@/lib/format';
import type { Certificate } from '@/lib/types';

const SIGNED = new Set(['certified', 'approved', 'final_approved', 'paid']);

/** Where a certificate is, in words: "Waiting for the Director, rail", "Paid". */
function chainLabel(c: Certificate): { text: string; tone: 'good' | 'warn' | 'neutral' | 'bad' | 'info' } {
  if (c.status === 'paid') return { text: 'Paid', tone: 'good' };
  if (c.status === 'draft') return { text: 'Draft', tone: 'neutral' };
  if (c.status === 'returned') return { text: 'Returned', tone: 'bad' };
  const next = c.chain.find((s) => !s.actor);
  return next ? { text: `Waiting for the ${roleInSentence(next.role)}`, tone: 'warn' } : { text: 'Approved', tone: 'info' };
}

/*
 * W5.6 Payments: every certificate in one table, each opening to its chain
 * and deductions, and what has been certified and paid so far. Amounts come
 * only to people with the financial permission.
 */
export default function PaymentsPage() {
  const id = useProjectId();
  const lots = useQuery({ queryKey: ['lots', id], queryFn: () => getLots(id) });
  const certs = useQueries({ queries: (lots.data ?? []).map((l) => ({ queryKey: ['certificates', l.id], queryFn: () => getCertificates(l.id) })) });
  const canValue = useCan('valuations:submit');
  const [valuing, setValuing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const all: Certificate[] = certs.flatMap((q) => q.data ?? []).sort((a, b) => b.period.localeCompare(a.period) || b.number - a.number);

  const contractSum = (lots.data ?? []).reduce((n, l) => n + Number(l.contractSumKobo ?? 0), 0);
  const certified = all.filter((c) => SIGNED.has(c.status)).reduce((n, c) => n + Number(c.grossKobo), 0);
  const paid = all.filter((c) => c.status === 'paid');
  const paidGross = paid.reduce((n, c) => n + Number(c.grossKobo), 0);
  const retention = paid.reduce((n, c) => n + Number(c.retentionKobo), 0);
  const recovered = paid.reduce((n, c) => n + Number(c.advanceRecoveryKobo), 0);
  const waiting = all.find((c) => c.status !== 'paid' && c.status !== 'draft' && c.chain.some((s) => !s.actor));
  const nextStep = waiting?.chain.find((s) => !s.actor);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Payments</h2>
          <p className="text-ink-muted">Interim payment certificates for every lot.</p>
        </div>
        {canValue && <Button onClick={() => setValuing(true)}>New valuation</Button>}
      </div>
      {notice && <p role="status" className="rounded-md bg-[#e3f1e6] p-4 text-[#1f5a2b]">{notice}</p>}
      {lots.data && <ValuationForm lots={lots.data} open={valuing} onClose={() => setValuing(false)} onDone={(m) => { setValuing(false); setNotice(m); }} />}

      <QueryState loading={lots.isPending || certs.some((q) => q.isPending)} error={lots.isError} empty={lots.isSuccess && all.length === 0} emptyText="No payment certificates yet." />

      {all.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="overflow-x-auto rounded-md bg-surface ring-1 ring-line">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-line text-sm text-ink-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">Certificate</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Period</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Net payable</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Where it is</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {all.map((c) => {
                  const label = chainLabel(c);
                  const updated = [...c.chain].reverse().find((s) => s.at)?.at ?? null;
                  const open = openId === c.id;
                  return (
                    <Fragment key={c.id}>
                      <tr className="border-b border-line">
                        <td className="px-4 py-3 font-semibold">IPC {c.number}<span className="block text-sm font-normal text-ink-muted">{c.lotName}</span></td>
                        <td className="whitespace-nowrap px-4 py-3">{formatMonth(c.period)}</td>
                        <td className="tabular whitespace-nowrap px-4 py-3 text-right">{formatNairaExact(c.netKobo)}</td>
                        <td className="px-4 py-3"><Pill tone={label.tone}>{label.text}</Pill></td>
                        <td className="tabular whitespace-nowrap px-4 py-3 text-sm">{formatDate(updated)}</td>
                        <td className="px-4 py-3">
                          <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : c.id)} className="min-h-11 whitespace-nowrap rounded-md px-3 font-semibold text-brand-900 underline underline-offset-4 hover:bg-brand-50">
                            {open ? 'Close' : 'Open'}
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-line bg-canvas">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid gap-6 lg:grid-cols-2">
                              <table className="w-full text-left">
                                <caption className="mb-2 text-left font-semibold">Deductions</caption>
                                <tbody className="[&>tr]:border-b [&>tr]:border-line [&_td]:py-2 [&_td:last-child]:text-right">
                                  <tr><td className="text-ink-muted">Gross value</td><td className="tabular">{formatNairaExact(c.grossKobo)}</td></tr>
                                  <tr><td className="text-ink-muted">Retention</td><td className="tabular">− {formatNairaExact(c.retentionKobo)}</td></tr>
                                  <tr><td className="text-ink-muted">Advance recovery</td><td className="tabular">− {formatNairaExact(c.advanceRecoveryKobo)}</td></tr>
                                  <tr className="font-semibold"><td>Net payable</td><td className="tabular">{formatNairaExact(c.netKobo)}</td></tr>
                                </tbody>
                              </table>
                              <div>
                                <p className="mb-2 font-semibold">Approval chain</p>
                                <ol className="flex flex-col gap-2">
                                  {c.chain.map((s) => (
                                    <li key={s.step} className="flex justify-between gap-3">
                                      <span><span className="font-medium">{s.step}</span> <span className="text-ink-muted">by {roleInSentence(s.role)}</span></span>
                                      <span className="text-right text-sm">{s.actor ? `${s.actor}, ${formatDate(s.at)}` : <span className="text-ink-muted">Not yet</span>}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </section>

          <Section title="Contract to date">
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
              {contractSum > 0 && (<><dt className="text-ink-muted">Contract sum</dt><dd className="tabular text-right">{formatNaira(contractSum, { compact: true })}</dd></>)}
              <dt className="text-ink-muted">Certified to date</dt><dd className="tabular text-right">{formatNaira(certified, { compact: true })}</dd>
              <dt className="text-ink-muted">Paid to date</dt><dd className="tabular text-right">{formatNaira(paidGross, { compact: true })}</dd>
              <dt className="text-ink-muted">Retention held</dt><dd className="tabular text-right">{formatNaira(retention, { compact: true })}</dd>
              <dt className="text-ink-muted">Advance recovered</dt><dd className="tabular text-right">{formatNaira(recovered, { compact: true })}</dd>
              {waiting && nextStep && (<><dt className="text-ink-muted">Next in the chain</dt><dd className="text-right">IPC {waiting.number}, {nextStep.role}</dd></>)}
            </dl>
            <p className="mt-3 text-sm text-ink-muted">Rounded here; the table shows each certificate to the kobo.</p>
          </Section>
        </div>
      )}
    </div>
  );
}
