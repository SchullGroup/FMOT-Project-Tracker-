'use client';

import { useQuery } from '@tanstack/react-query';
import { Pill } from '@/components/ui/Pill';
import { QueryState, Table } from '@/components/ui/Section';
import { getNotificationLog } from '@/lib/endpoints';
import { formatPhone } from '@/lib/status';

const TONE = { queued: 'neutral', sent: 'info', delivered: 'good', failed: 'bad' } as const;
const LABEL = { queued: 'Waiting to send', sent: 'Sent', delivered: 'Delivered', failed: 'Not delivered' } as const;

/** Messages sent: every text the system sent, and whether it arrived. First stop when someone says "I never got the code". */
export default function MessagesPage() {
  const log = useQuery({ queryKey: ['notification-log'], queryFn: getNotificationLog });
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-semibold text-brand-900">Messages sent</h1>
      <p className="max-w-prose text-ink-muted">Codes are never shown here, only that a message went and whether the network delivered it.</p>
      <QueryState loading={log.isPending} error={log.isError} empty={log.data?.length === 0} emptyText="No messages yet." />
      {log.data && log.data.length > 0 && (
        <Table head={['When', 'To', 'Message', 'Status']}>
          {log.data.map((n) => (
            <tr key={n.id}>
              <td className="tabular whitespace-nowrap">{new Date(n.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td className="tabular">{formatPhone(n.to)}</td>
              <td>{n.template.replace(/_/g, ' ')}</td>
              <td><Pill tone={TONE[n.status]}>{LABEL[n.status]}</Pill></td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
