'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { QueryState, Table } from '@/components/ui/Section';
import { createOrganisation, getOrganisations } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import { NEEDS_DIRECTOR, ORG_TYPE_LABEL } from '@/lib/org-roles';
import { formatPhone } from '@/lib/status';
import type { OrganisationType } from '@/lib/types';

/** S1 Organisations: every body whose people use the tracker. Its type decides which roles its people can hold. */
export default function OrganisationsPage() {
  const qc = useQueryClient();
  const orgs = useQuery({ queryKey: ['organisations'], queryFn: getOrganisations });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', type: '' as OrganisationType | '', contactName: '', contactPhone: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.type) return setError('Give the name and the kind of organisation.');
    setBusy(true);
    setError(null);
    try {
      const o = await createOrganisation({ ...form, type: form.type as OrganisationType });
      await qc.invalidateQueries({ queryKey: ['organisations'] });
      setAdding(false);
      setForm({ name: '', type: '', contactName: '', contactPhone: '' });
      setNotice(`${o.name} is added. You can now add its people.`);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-brand-900">Organisations</h1>
          <p className="text-ink-muted">Add an organisation before adding its people.</p>
        </div>
        <Button onClick={() => setAdding(true)}>Add an organisation</Button>
      </div>
      {notice && <p role="status" className="rounded-md bg-[#e3f1e6] p-4 font-medium text-[#1f5a2b]">{notice}</p>}
      <QueryState loading={orgs.isPending} error={orgs.isError} />
      {orgs.data && (
        <Table head={['Organisation', 'Kind', 'Contact', 'People', 'New accounts']}>
          {orgs.data.map((o) => (
            <tr key={o.id}>
              <td className="font-medium">{o.name}</td>
              <td>{ORG_TYPE_LABEL[o.type]}</td>
              <td>{o.contactName ?? '–'}{o.contactPhone && <span className="block text-sm tabular text-ink-muted">{formatPhone(o.contactPhone)}</span>}</td>
              <td className="tabular">{o.people}</td>
              <td className="text-sm">{NEEDS_DIRECTOR.includes(o.type) ? 'Director confirms' : 'Active on first sign-in'}</td>
            </tr>
          ))}
        </Table>
      )}
      <Drawer open={adding} title="Add an organisation" onClose={() => setAdding(false)} footer={<><Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button><Button className="ml-auto" type="submit" form="add-org" busy={busy}>Add organisation</Button></>}>
        <form id="add-org" onSubmit={submit} className="flex flex-col gap-5">
          <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          <Select label="Kind of organisation" hint="This decides which roles its people can hold." value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OrganisationType })}>
            <option value="">Choose</option>
            {(Object.keys(ORG_TYPE_LABEL) as OrganisationType[]).map((t) => <option key={t} value={t}>{ORG_TYPE_LABEL[t]}</option>)}
          </Select>
          <Field label="Contact person (optional)" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          <Field label="Contact phone (optional)" type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          {error && <p role="alert" className="font-medium text-danger">{error}</p>}
        </form>
      </Drawer>
    </div>
  );
}
