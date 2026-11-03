'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useCan } from '@/components/Session';
import { PinSheet } from '@/components/tasks/PinSheet';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Pill } from '@/components/ui/Pill';
import { getPracticalCompletion, recordPracticalCompletion } from '@/lib/endpoints';
import { formatDate } from '@/lib/format';

// Lagos is UTC+1 all year, so its calendar date is UTC's an hour on.
const today = () => new Date(Date.now() + 3_600_000).toISOString().slice(0, 10);

/*
 * Practical completion of a lot: recorded by the project manager with the
 * PIN, then confirmed by the Director from Tasks. Gate 13 passes once every
 * lot is confirmed.
 */
export function PracticalCompletionPanel({ projectId, lotId, lotName }: { projectId: string; lotId: string; lotName: string }) {
  const qc = useQueryClient();
  const canEdit = useCan('completion:record');
  const pc = useQuery({ queryKey: ['practical-completion', lotId], queryFn: () => getPracticalCompletion(projectId, lotId) });
  const [date, setDate] = useState('');
  const [pin, setPin] = useState(false);

  if (!pc.data) return null;
  const s = pc.data;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">Practical completion</h3>
      {s.status === 'confirmed' && <p><Pill tone="good">Confirmed</Pill> Completed on {formatDate(s.completedOn)}.</p>}
      {s.status === 'waiting_for_director' && (
        <p><Pill tone="info">Waiting for the Director</Pill> Recorded by {s.recordedBy} as complete on {formatDate(s.completedOn)}.</p>
      )}
      {s.status === 'not_recorded' && !canEdit && <p className="text-ink-muted">Not recorded yet.</p>}
      {s.status === 'not_recorded' && canEdit && (
        <div className="flex flex-col gap-3 rounded-md border border-line p-4">
          <p className="text-ink-muted">Record this when the resident engineer certifies {lotName} as substantially complete. The Director confirms it; gate 13 passes when every lot is confirmed.</p>
          <div className="max-w-xs"><Field label="Completed on" hint="The date on the resident engineer's certificate; not in the future." type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <Button variant="secondary" className="w-fit" disabled={!date} onClick={() => setPin(true)}>
            Record practical completion <span className="text-sm font-normal opacity-80">(PIN)</span>
          </Button>
        </div>
      )}
      {pin && (
        <PinSheet
          open
          action="completion.record"
          actionLabel="Record practical completion"
          subjectId={lotId}
          summary={`${lotName} completed on ${formatDate(date)}. The Director will be asked to confirm it.`}
          onClose={() => setPin(false)}
          onConfirmed={async (token) => {
            await recordPracticalCompletion(projectId, lotId, date, token);
            setPin(false);
            await qc.invalidateQueries({ queryKey: ['practical-completion', lotId] });
            await qc.invalidateQueries({ queryKey: ['tasks'] });
          }}
        />
      )}
    </div>
  );
}
