'use client';

import { useQuery } from '@tanstack/react-query';
import { GateStrip } from '@/components/project/GateStrip';
import { useProjectId } from '@/components/project/ProjectFrame';
import { StatusPill } from '@/components/ui/Pill';
import { QueryState, Section, Table } from '@/components/ui/Section';
import { getGates } from '@/lib/endpoints';
import { dayCount, formatDate } from '@/lib/format';
import { roleLabel } from '@/lib/roles';

/** W5.2 Gates: every gate, who decides it, and the evidence behind it. */
export default function GatesPage() {
  const id = useProjectId();
  const gates = useQuery({ queryKey: ['gates', id], queryFn: () => getGates(id) });

  return (
    <div className="flex flex-col gap-5">
      <Section title="Where this project is">
        <QueryState loading={gates.isPending} error={gates.isError} />
        {gates.data && <GateStrip gates={gates.data} />}
      </Section>
      <Section title="All gates">
        {gates.data && (
          <Table head={['Gate', 'Decided by', 'Status', 'Passed', 'Waiting', 'Evidence', 'Uploaded by', 'Confirmed by']}>
            {gates.data.map((g) => (
              <tr key={g.no} className={g.status === 'in_progress' || g.status === 'awaiting_confirmation' ? 'bg-brand-50' : undefined}>
                <td>
                  <span className="tabular font-semibold">{g.no}</span> {g.name}
                  <span className="block text-sm text-ink-muted">{g.kind === 'attach_evidence' ? 'Outside decision, evidence uploaded' : 'Approved in the system'}</span>
                </td>
                <td>{roleLabel(g.approverRole)}</td>
                <td><StatusPill status={g.status} /></td>
                <td className="tabular whitespace-nowrap">{formatDate(g.passedAt)}</td>
                <td className="tabular">{g.daysWaiting !== null ? dayCount(g.daysWaiting) : '–'}</td>
                <td>
                  {g.evidence.length === 0 ? '–' : (
                    <ul>
                      {g.evidence.map((e) => (
                        <li key={e.documentId}><span className="tabular font-semibold">{e.code}</span> {e.title}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>{g.uploadedBy ?? '–'}</td>
                <td>{g.confirmedBy ?? '–'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
    </div>
  );
}
