'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useCan } from '@/components/Session';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Pill';
import { Table } from '@/components/ui/Section';
import { getDesignRequirements, saveDesignRequirements } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';

/*
 * Which design packages a lot must have approved. Gate 12 passes by itself
 * once every required discipline, in every lot, has a package approved for
 * construction. The project manager marks what is required.
 */
export function DesignRequirements({ lotId, lotName }: { lotId: string; lotName: string }) {
  const qc = useQueryClient();
  const canEdit = useCan('progress:plan');
  const reqs = useQuery({ queryKey: ['design-requirements', lotId], queryFn: () => getDesignRequirements(lotId) });
  const [required, setRequired] = useState<Set<string>>(new Set());
  const [state, setState] = useState<'idle' | 'busy' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reqs.data) setRequired(new Set(reqs.data.filter((r) => r.required).map((r) => r.disciplineCode)));
  }, [reqs.data]);

  if (!reqs.data) return null;
  const changed = reqs.data.some((r) => r.required !== required.has(r.disciplineCode));
  const done = reqs.data.filter((r) => required.has(r.disciplineCode) && r.status === 'approved_for_construction').length;

  async function save() {
    setState('busy');
    setError(null);
    try {
      await saveDesignRequirements(lotId, reqs.data!.map((r) => r.disciplineCode), [...required]);
      await qc.invalidateQueries({ queryKey: ['design-requirements', lotId] });
      await qc.invalidateQueries({ queryKey: ['gates'] });
      setState('saved');
    } catch (e) {
      setError(messageFor(e));
      setState('idle');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p>
        <strong>{lotName}:</strong> {done} of {required.size} required designs approved for construction.
        {required.size > 0 && done === required.size && <span className="font-semibold text-status-operational"> This lot is ready for gate 12.</span>}
      </p>
      <Table head={['Discipline', 'Required for this lot', 'Design status']}>
        {reqs.data.map((r) => (
          <tr key={r.disciplineCode}>
            <td>{r.disciplineName}</td>
            <td>
              {canEdit ? (
                <label className="flex min-h-11 items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-5 accent-brand-900"
                    checked={required.has(r.disciplineCode)}
                    onChange={() => {
                      setRequired((s) => {
                        const n = new Set(s);
                        if (n.has(r.disciplineCode)) n.delete(r.disciplineCode);
                        else n.add(r.disciplineCode);
                        return n;
                      });
                      setState('idle');
                    }}
                    aria-label={`${r.disciplineName} required for ${lotName}`}
                  />
                  {required.has(r.disciplineCode) ? 'Required' : 'Not needed'}
                </label>
              ) : required.has(r.disciplineCode) ? 'Required' : 'Not needed'}
            </td>
            <td>{r.status === 'none' ? <span className="text-ink-muted">No package yet</span> : <StatusPill status={r.status} />}</td>
          </tr>
        ))}
      </Table>
      {canEdit && (
        <div className="flex items-center gap-4">
          <Button variant="secondary" busy={state === 'busy'} disabled={!changed} onClick={save}>Save what is required</Button>
          {state === 'saved' && <span role="status" className="font-medium text-status-operational">Saved</span>}
          {error && <span role="alert" className="text-danger">{error}</span>}
        </div>
      )}
    </div>
  );
}
