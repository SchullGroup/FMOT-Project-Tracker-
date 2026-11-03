'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { addObligation, getDocuments, getLots } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import type { NewObligation } from '@/lib/types';

const KINDS: Array<{ key: NewObligation['kind']; label: string; reminded: string }> = [
  { key: 'performance_bond', label: 'Performance bond', reminded: "the project's legal officers (the project manager if there is none)" },
  { key: 'advance_payment_guarantee', label: 'Advance payment guarantee', reminded: "the project's legal officers (the project manager if there is none)" },
  { key: 'insurance', label: 'Insurance', reminded: "the project's legal officers (the project manager if there is none)" },
  { key: 'eia_condition', label: 'Environmental (EIA) condition', reminded: 'the project manager' },
];

const empty: NewObligation = { kind: 'performance_bond', reference: '', description: '', expiresOn: '', lotId: null, documentId: null };

/** Add something that expires, so the people who renew it get a text 30 and 7 days before. */
export function ObligationForm({ projectId, open, onClose }: { projectId: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const lots = useQuery({ queryKey: ['lots', projectId], queryFn: () => getLots(projectId), enabled: open });
  const documents = useQuery({ queryKey: ['documents', projectId], queryFn: () => getDocuments(projectId), enabled: open });
  const [form, setForm] = useState<NewObligation>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const kind = KINDS.find((k) => k.key === form.kind)!;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.reference.trim() || !form.expiresOn) return setError('Give its reference number and when it expires.');
    setBusy(true);
    setError(null);
    try {
      await addObligation(projectId, { ...form, reference: form.reference.trim(), description: form.description.trim() });
      await qc.invalidateQueries({ queryKey: ['obligations', projectId] });
      setForm(empty);
      onClose();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} title="Add something that expires" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className="ml-auto" type="submit" form="obligation" busy={busy}>Add</Button></>}>
      <form id="obligation" onSubmit={submit} className="flex flex-col gap-5">
        <Select label="Kind" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as NewObligation['kind'] })}>
          {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
        </Select>
        <Field label="Reference" hint="The bond, policy or certificate number." placeholder="PB/2026/0142" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
        <Field label="What it covers (optional)" placeholder="Lot 3 works, 10 percent of the contract sum" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="max-w-xs"><Field label="Expires on" type="date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} /></div>
        <Select label="Lot (optional)" value={form.lotId ?? ''} onChange={(e) => setForm({ ...form, lotId: e.target.value || null })}>
          <option value="">The whole project</option>
          {lots.data?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </Select>
        <Select label="The document in the register (optional)" value={form.documentId ?? ''} onChange={(e) => setForm({ ...form, documentId: e.target.value || null })}>
          <option value="">Not uploaded yet</option>
          {documents.data?.flatMap((g) => g.documents).map((d) => <option key={d.id} value={d.id}>{d.code}: {d.title}</option>)}
        </Select>
        <p className="text-sm text-ink-muted">Reminders go to {kind.reminded}, 30 days and 7 days before it expires.</p>
        {error && <p role="alert" className="text-danger">{error}</p>}
      </form>
    </Drawer>
  );
}
