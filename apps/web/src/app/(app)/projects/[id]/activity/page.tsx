'use client';

import { useQuery } from '@tanstack/react-query';
import { useProjectId } from '@/components/project/ProjectFrame';
import { QueryState, Section } from '@/components/ui/Section';
import { getActivity } from '@/lib/endpoints';

/** W5.13 Activity: the audit trail of every decision on this project. */
export default function ActivityPage() {
  const id = useProjectId();
  const activity = useQuery({ queryKey: ['activity', id], queryFn: () => getActivity(id), retry: false });

  return (
    <Section title="Everything that happened, newest first">
      <QueryState loading={activity.isPending} error={activity.isError} empty={activity.data?.length === 0} emptyText="No activity yet." />
      {activity.isError && <p className="mt-2 text-ink-muted">The activity record is open to approvers and the auditor only.</p>}
      <ol className="flex flex-col">
        {activity.data?.map((a) => (
          <li key={a.id} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-3 last:border-b-0">
            <time dateTime={a.at} className="tabular text-sm text-ink-muted">
              {new Date(a.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </time>
            <p>
              <span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()}: {a.summary}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
