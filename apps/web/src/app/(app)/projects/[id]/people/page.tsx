'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AddMemberForm } from '@/components/forms/AddMemberForm';
import { useProjectId } from '@/components/project/ProjectFrame';
import { useCan } from '@/components/Session';
import { Button } from '@/components/ui/Button';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getLots, getPeople } from '@/lib/endpoints';
import { roleLabel } from '@/lib/roles';
import { formatPhone } from '@/lib/status';

/** W5.11 People on the project, and who uploads, checks and approves each gate. */
export default function PeoplePage() {
  const id = useProjectId();
  const people = useQuery({ queryKey: ['people', id], queryFn: () => getPeople(id) });
  const lots = useQuery({ queryKey: ['lots', id], queryFn: () => getLots(id) });
  const canAdd = useCan('members:manage');
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <Section title="People on this project" aside={canAdd ? <Button variant="secondary" onClick={() => setAdding(true)}>Add a member</Button> : undefined}>
        {notice && <p role="status" className="mb-4 rounded-md bg-[#e3f1e6] p-4 text-[#1f5a2b]">{notice}</p>}
        <AddMemberForm projectId={id} lots={lots.data ?? []} open={adding} onClose={() => setAdding(false)} onDone={(m) => { setAdding(false); setNotice(m); }} />
        <QueryState loading={people.isPending} error={people.isError} />
        {people.data && (
          <Table head={['Name', 'Role', 'Organisation', 'Lot', 'Phone']}>
            {people.data.members.map((m) => (
              <tr key={m.id}>
                <td className="font-medium">{m.name}</td>
                <td>{roleLabel(m.role)}</td>
                <td>{m.organisation}</td>
                <td>{m.lot ?? 'Whole project'}</td>
                <td>
                  <a href={`tel:${m.phone}`} className="tabular whitespace-nowrap text-brand-900 underline underline-offset-4">
                    {formatPhone(m.phone)}
                  </a>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
      <Section title="Who does what at each gate">
        {people.data && (
          <Table head={['Gate', 'Uploads the evidence', 'Checks', 'Approves']}>
            {people.data.matrix.map((r) => (
              <tr key={r.gateNo}>
                <td><span className="tabular font-semibold">{r.gateNo}</span> {r.gateName}</td>
                <td>{r.uploader ? roleLabel(r.uploader) : '–'}</td>
                <td>{r.verifier ? roleLabel(r.verifier) : '–'}</td>
                <td>{roleLabel(r.approver)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
    </div>
  );
}
