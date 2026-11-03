'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useCan } from '@/components/Session';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Select } from '@/components/ui/Select';
import { getBaselineRevisions, getVariations, uploadBaseline } from '@/lib/endpoints';
import { formatDate } from '@/lib/format';
import { messageFor } from '@/lib/messages';

const STATUS = {
  approved: { tone: 'good', label: 'In use' },
  pending: { tone: 'info', label: 'Waiting for the Director' },
  returned: { tone: 'bad', label: 'Returned' },
  superseded: { tone: 'neutral', label: 'Replaced' },
} as const;

/*
 * A CSV the project manager can fill in, in the layout the API reads: one row per measured discipline (earthworks,
 * drainage, structures, track, stations, systems) and month, the planned percentage complete by the end of that
 * month, never going down.
 */
function downloadTemplate(lotName: string) {
  const rows = ['discipline,month,planned_percent', 'earthworks,2026-11,85', 'earthworks,2026-12,95', 'structures,2026-11,60', 'structures,2026-12,70'];
  const url = URL.createObjectURL(new Blob([rows.join('\n') + '\n'], { type: 'text/csv' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `programme-${lotName.toLowerCase().replace(/\W+/g, '-')}.csv` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/*
 * The lot's programme: the planned percentage per discipline per month that
 * "planned against done" is measured by. The first upload (revision 1) is used
 * at once; any later one is a revision that needs a reason and the Director's
 * approval (PIN), and may name the approved extension of time behind it.
 */
export function BaselinePanel({ projectId, lotId, lotName }: { projectId: string; lotId: string; lotName: string }) {
  const qc = useQueryClient();
  const canEdit = useCan('progress:plan');
  const revisions = useQuery({ queryKey: ['baseline', lotId], queryFn: () => getBaselineRevisions(lotId) });
  const eots = useQuery({ queryKey: ['variations', projectId], queryFn: () => getVariations(projectId), retry: false });
  const approvedEots = (eots.data ?? []).filter((v) => v.type === 'extension_of_time' && v.approved);
  const [file, setFile] = useState<File | null>(null);
  const [reason, setReason] = useState('');
  const [eot, setEot] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const list = revisions.data ?? [];
  const first = list.length === 0;
  const pending = list.some((r) => r.status === 'pending');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError('Choose the programme file (CSV).');
    if (!first && reason.trim().length < 5) return setError('Say why the programme is changing.');
    setBusy(true);
    setError(null);
    try {
      await uploadBaseline(lotId, file, reason.trim(), eot || null);
      await qc.invalidateQueries({ queryKey: ['baseline', lotId] });
      await qc.invalidateQueries({ queryKey: ['progress', projectId] });
      setFile(null);
      setReason('');
      setEot('');
      setNotice(first ? 'Programme saved. Planned figures now use it.' : 'Revised programme sent to the Director. The current one stays in use until it is approved.');
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">Programme</h3>
      {list.length === 0 ? (
        <p className="text-ink-muted">No programme yet, so this lot has no planned figures.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 rounded-md bg-canvas p-3">
              <span>
                <span className="font-medium">{r.revision === 1 ? 'First programme' : `Revision ${r.revision}`}</span>, {formatDate(r.uploadedAt)}, {r.uploadedBy}
                {r.reason && <span className="block text-sm">Why: {r.reason}</span>}
                {r.extensionOfTimeId && <span className="block text-sm text-ink-muted">Follows: {eots.data?.find((v) => v.id === r.extensionOfTimeId)?.title ?? 'an approved extension of time'}</span>}
              </span>
              <Pill tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Pill>
            </li>
          ))}
        </ul>
      )}
      {notice && <p role="status" className="rounded-md bg-[#e3f1e6] p-3 text-[#1f5a2b]">{notice}</p>}
      {canEdit && !pending && (
        <form onSubmit={submit} className="flex flex-col gap-3 rounded-md border border-line p-4">
          <p className="font-medium">{first ? 'Upload the programme' : 'Upload a revised programme'}</p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex min-h-12 cursor-pointer items-center rounded-md border-2 border-dashed border-line-strong bg-surface px-4 font-semibold text-brand-900 hover:bg-brand-50">
              {file ? `Chosen: ${file.name}` : 'Choose the CSV file'}
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setNotice(null); }} />
            </label>
            <button type="button" onClick={() => downloadTemplate(lotName)} className="min-h-11 font-semibold text-brand-900 underline underline-offset-4">
              Get a blank template
            </button>
          </div>
          {!first && (
            <>
              <label className="flex flex-col gap-2">
                <span className="font-semibold">Why is it changing?</span>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="rounded-md border-2 border-line-strong bg-surface p-3" />
              </label>
              <Select label="Linked extension of time (optional)" value={eot} onChange={(e) => setEot(e.target.value)}>
                <option value="">None</option>
                {approvedEots.map((v) => <option key={v.id} value={v.id}>{v.title} ({v.days} days)</option>)}
              </Select>
            </>
          )}
          {error && <p role="alert" className="text-danger">{error}</p>}
          <Button type="submit" variant="secondary" busy={busy} className="w-fit">{first ? 'Save the programme' : 'Send to the Director'}</Button>
        </form>
      )}
      {canEdit && pending && <p className="text-ink-muted">A revision is waiting for the Director. You can send another once it is decided.</p>}
    </div>
  );
}
