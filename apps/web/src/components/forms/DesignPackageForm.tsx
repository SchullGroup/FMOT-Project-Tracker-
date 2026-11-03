'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { submitDesignPackage } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import type { Lot } from '@/lib/types';

// The discipline codes and labels seeded on the API (seed-data.ts).
const DISCIPLINES = [
  ['earthworks', 'Earthworks'],
  ['drainage', 'Drainage'],
  ['structures', 'Bridges and culverts'],
  ['track', 'Track laying'],
  ['stations', 'Stations'],
  ['systems', 'Signalling, telecoms and power'],
  ['equipment', 'Equipment'],
  ['other', 'Other'],
];

/** The lot's contractor commercial manager sends a design package (D21); the resident engineer, the NRC and the Director review it in turn. */
export function DesignPackageForm({ lots, open, onClose, onDone }: { lots: Lot[]; open: boolean; onClose: () => void; onDone: (m: string) => void }) {
  const qc = useQueryClient();
  const [lotId, setLotId] = useState(lots.length === 1 ? lots[0]!.id : '');
  const [discipline, setDiscipline] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!lotId || !discipline || title.trim().length < 3 || !file) return setError('Choose the lot and discipline, give a title and attach the drawings.');
    setBusy(true);
    setError(null);
    try {
      await submitDesignPackage(lotId, discipline, title.trim(), file);
      await qc.invalidateQueries({ queryKey: ['design', lotId] });
      await qc.invalidateQueries({ queryKey: ['design-requirements', lotId] });
      setTitle('');
      setFile(null);
      onDone(`"${title.trim()}" is sent. The resident engineer reviews it first.`);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} title="Send a design package" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className="ml-auto" type="submit" form="design-package" busy={busy}>Send for review</Button></>}>
      <form id="design-package" onSubmit={submit} className="flex flex-col gap-5">
        <Select label="Lot" value={lotId} onChange={(e) => setLotId(e.target.value)}>
          {lots.length !== 1 && <option value="">Choose a lot</option>}
          {lots.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </Select>
        <Select label="Discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
          <option value="">Choose</option>
          {DISCIPLINES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Field label="Title" placeholder="Rigachikun river bridge, piers and deck" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Drawings and calculations (D21)</span>
          <span className="text-sm text-ink-muted">One PDF, or a .zip of several files.</span>
          <label className="inline-flex min-h-12 w-fit cursor-pointer items-center rounded-md border-2 border-dashed border-line-strong bg-surface px-5 font-semibold text-brand-900 hover:bg-brand-50">
            {file ? `Chosen: ${file.name}` : 'Choose the file'}
            <input type="file" accept=".pdf,.zip" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {error && <p role="alert" className="text-danger">{error}</p>}
      </form>
    </Drawer>
  );
}
