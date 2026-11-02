'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Field } from '@/components/ui/Field';
import { QueryState, Table } from '@/components/ui/Section';
import { getAuditLog } from '@/lib/endpoints';

/** S8 Activity record across the whole system. Read-only; nothing in it can be changed or deleted. */
export default function AuditPage() {
  const log = useQuery({ queryKey: ['audit'], queryFn: () => getAuditLog() });
  const [q, setQ] = useState('');
  const shown = (log.data ?? []).filter((a) => !q || `${a.actor} ${a.action} ${a.entity} ${a.project ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-semibold text-brand-900">Activity record</h1>
      <p className="max-w-prose text-ink-muted">Every sign-in, decision and change, newest first. Entries cannot be edited or removed.</p>
      <div className="max-w-md"><Field label="Filter" type="search" placeholder="Person, action or project" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <QueryState loading={log.isPending} error={log.isError} empty={shown.length === 0} emptyText="Nothing matches." />
      {shown.length > 0 && (
        <Table head={['When', 'Who', 'Did', 'What', 'Project']}>
          {shown.map((a) => (
            <tr key={a.id}>
              <td className="tabular whitespace-nowrap">{new Date(a.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td className="font-medium">{a.actor}</td>
              <td>{a.action}</td>
              <td>{a.entity}</td>
              <td>{a.project ?? '–'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
