'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { addLot, findOrganisations } from '@/lib/endpoints';
import { formatChainage, formatNairaExact, nairaToKobo } from '@/lib/format';
import { messageFor } from '@/lib/messages';
import type { Lot } from '@/lib/types';

/*
 * A lot, one per contract, added once the contract is signed (gate 8). It
 * needs the Director's confirmation; then its contractor and consultant can
 * be given people.
 */
export function AddLotForm({ projectId, lengthM, existing, open, onClose, onDone }: { projectId: string; lengthM: number; existing: Lot[]; open: boolean; onClose: () => void; onDone: (m: string) => void }) {
  const qc = useQueryClient();
  const contractors = useQuery({ queryKey: ['orgs', 'contractor'], queryFn: () => findOrganisations('contractor'), enabled: open });
  const consultants = useQuery({ queryKey: ['orgs', 'consultant'], queryFn: () => findOrganisations('consultant'), enabled: open });
  const nextFrom = existing.length ? Math.max(...existing.map((l) => l.chainageToM)) / 1000 : 0;
  const [f, setF] = useState({ name: `Lot ${existing.length + 1}`, contractRef: '', contractorOrgId: '', consultantOrgId: '', fromKm: String(nextFrom), toKm: '', sum: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fromM = Math.round(Number(f.fromKm) * 1000);
  const toM = Math.round(Number(f.toKm) * 1000);
  const overlaps = existing.find((l) => fromM < l.chainageToM && toM > l.chainageFromM);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || f.contractRef.trim().length < 2 || !f.contractorOrgId || !f.consultantOrgId || f.toKm === '' || !nairaToKobo(f.sum)) return setError('Fill in every field.');
    if (toM <= fromM) return setError('The lot must end after it starts.');
    if (toM > lengthM) return setError(`The line is only ${formatChainage(lengthM)} long.`);
    if (overlaps) return setError(`This overlaps ${overlaps.name} (${formatChainage(overlaps.chainageFromM)} to ${formatChainage(overlaps.chainageToM)}).`);
    setBusy(true);
    setError(null);
    try {
      await addLot(projectId, { name: f.name.trim(), contractRef: f.contractRef.trim(), contractorOrgId: f.contractorOrgId, consultantOrgId: f.consultantOrgId, chainageFromM: fromM, chainageToM: toM, contractSumKobo: nairaToKobo(f.sum)! });
      await qc.invalidateQueries({ queryKey: ['lots', projectId] });
      onDone(`${f.name.trim()} is added. The Director confirms it, then its contractor and consultant can be given people.`);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} title="Add a lot" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className="ml-auto" type="submit" form="add-lot" busy={busy}>Add the lot</Button></>}>
      <form id="add-lot" onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Field label="Contract reference" placeholder="FMOT/RL/KK/04" value={f.contractRef} onChange={(e) => setF({ ...f, contractRef: e.target.value })} />
        </div>
        <Select label="Contractor" value={f.contractorOrgId} onChange={(e) => setF({ ...f, contractorOrgId: e.target.value })}>
          <option value="">Choose the contractor</option>
          {contractors.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
        <Select label="Supervising consultant" value={f.consultantOrgId} onChange={(e) => setF({ ...f, consultantOrgId: e.target.value })}>
          <option value="">Choose the consultant</option>
          {consultants.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From km" inputMode="decimal" value={f.fromKm} onChange={(e) => setF({ ...f, fromKm: e.target.value.replace(/[^\d.]/g, '') })} />
          <Field label="To km" inputMode="decimal" hint={`The line is ${Math.round(lengthM / 1000)} km long`} value={f.toKm} onChange={(e) => setF({ ...f, toKm: e.target.value.replace(/[^\d.]/g, '') })} />
        </div>
        <Field label="Contract sum, in naira" inputMode="decimal" value={f.sum} onChange={(e) => setF({ ...f, sum: e.target.value.replace(/[^\d.,]/g, '') })} hint={nairaToKobo(f.sum) ? formatNairaExact(nairaToKobo(f.sum)) : undefined} />
        {error && <p role="alert" className="text-danger">{error}</p>}
      </form>
    </Drawer>
  );
}
