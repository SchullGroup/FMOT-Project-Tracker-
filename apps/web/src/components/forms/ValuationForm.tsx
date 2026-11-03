'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { getValuationPrefill, submitValuation } from '@/lib/endpoints';
import { formatMonth, formatNairaExact, nairaToKobo } from '@/lib/format';
import { messageFor } from '@/lib/messages';
import type { Lot } from '@/lib/types';

function lastMonths(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

/*
 * The contractor's monthly valuation (the lot's contractor commercial
 * manager). It shows the work the resident engineer has already measured and
 * verified for the month, so the claim is made against it, and sends those
 * quantities with it; submitting starts the payment certificate chain. One
 * valuation per lot and month.
 */
export function ValuationForm({ lots, open, onClose, onDone }: { lots: Lot[]; open: boolean; onClose: () => void; onDone: (message: string) => void }) {
  const qc = useQueryClient();
  const months = lastMonths(6);
  const [lotId, setLotId] = useState(lots.length === 1 ? lots[0]!.id : '');
  const [period, setPeriod] = useState(months[0]!);
  const [naira, setNaira] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefill = useQuery({ queryKey: ['valuation-prefill', lotId, period], queryFn: () => getValuationPrefill(lotId, period), enabled: open && Boolean(lotId) });
  const grossKobo = nairaToKobo(naira);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!lotId || !grossKobo || grossKobo === '0' || !file) return setError('Choose the lot, enter the gross amount and attach the valuation file.');
    setBusy(true);
    setError(null);
    try {
      await submitValuation(lotId, period, grossKobo, file, prefill.data);
      await qc.invalidateQueries({ queryKey: ['certificates', lotId] });
      setNaira('');
      setFile(null);
      onDone(`Valuation for ${formatMonth(period)} sent. The resident engineer checks it first.`);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} title="New valuation" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className="ml-auto" type="submit" form="valuation" busy={busy}>Send the valuation</Button></>}>
      <form id="valuation" onSubmit={submit} className="flex flex-col gap-5">
        <Select label="Lot" value={lotId} onChange={(e) => setLotId(e.target.value)}>
          {lots.length !== 1 && <option value="">Choose a lot</option>}
          {lots.map((l) => <option key={l.id} value={l.id}>{l.name}, {l.contractRef}</option>)}
        </Select>
        <Select label="Month" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {months.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
        </Select>
        {prefill.data && (
          <div className="rounded-md bg-canvas p-4">
            <p className="mb-2 font-semibold">Work measured and verified for {formatMonth(period)}</p>
            {prefill.data.lines.length === 0 ? (
              <p className="text-ink-muted">Nothing measured for this month yet. Ask the resident engineer before claiming.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {prefill.data.lines.map((l) => <li key={l.code}><span className="font-medium">{l.discipline}:</span> {l.measured}</li>)}
              </ul>
            )}
            <p className="mt-2 text-sm text-ink-muted"><span className="tabular">{prefill.data.verifiedPhotos}</span> verified field {prefill.data.verifiedPhotos === 1 ? 'submission backs' : 'submissions back'} this work.</p>
          </div>
        )}
        <Field
          label="Gross amount claimed, in naira"
          inputMode="decimal"
          value={naira}
          onChange={(e) => setNaira(e.target.value.replace(/[^\d.,]/g, ''))}
          hint={grossKobo && grossKobo !== '0' ? `You are claiming ${formatNairaExact(grossKobo)}. Retention and advance recovery are worked out for you.` : 'Before retention and advance recovery.'}
        />
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Valuation file (D31)</span>
          <label className="inline-flex min-h-12 w-fit cursor-pointer items-center rounded-md border-2 border-dashed border-line-strong bg-surface px-5 font-semibold text-brand-900 hover:bg-brand-50">
            {file ? `Chosen: ${file.name}` : 'Choose the PDF or Excel file'}
            <input type="file" accept=".pdf,.xlsx" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {error && <p role="alert" className="text-danger">{error}</p>}
      </form>
    </Drawer>
  );
}
