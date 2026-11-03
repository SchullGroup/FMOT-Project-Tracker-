'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { actOnTask, getDocumentUrl, getTask, uploadTaskDocument, type ActInput } from '@/lib/endpoints';
import { formatDate, formatNairaExact, lowerFirst } from '@/lib/format';
import { afterText, whyText } from '@/lib/task-copy';
import { messageFor } from '@/lib/messages';
import { formatAge } from '@/lib/status';
import type { TaskAction, TaskDetail } from '@/lib/types';
import { PinSheet } from './PinSheet';
import { ReturnSheet } from './ReturnSheet';
import { SubjectPanel } from './SubjectPanel';

/** What the confirmation says after each action: what happened, and what happens next. */
const DONE_MESSAGE: Record<string, string> = {
  verify: 'Verified. It now counts toward progress.',
  send_back: 'Sent back with your reason.',
  recommend: 'Recommended. It has moved to the next step.',
  certify: 'Certified. It has moved to the next step.',
  approve: 'Approved. It has moved to the next step.',
  final_approve: 'Final approval given. Finance will record the payment.',
  countersign: 'Countersigned. The design is approved for construction.',
  confirm: 'Confirmed.',
  publish: 'Published. The project is now on the map.',
  return: 'Returned with your reason.',
  decline: 'Declined with your reason.',
  mark_paid: 'Marked paid. This payment is closed.',
  submit: 'Submitted for confirmation.',
};

/*
 * W7.1 to W7.9: one task, one screen, one main button. The subject panel
 * changes with the task type; the actions come from the API, which decides
 * who may do what.
 */
export function TaskView({ id, onDone }: { id: string; onDone: (message: string) => void }) {
  const qc = useQueryClient();
  const task = useQuery({ queryKey: ['task', id], queryFn: () => getTask(id), retry: false });
  const [pinFor, setPinFor] = useState<TaskAction | null>(null);
  const [returnFor, setReturnFor] = useState<TaskAction | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (task.isPending) return <p className="p-6 text-ink-muted">Opening the task…</p>;
  if (task.isError) return <p className="p-6 text-lg">This task is no longer waiting for you. Someone may have dealt with it already.</p>;
  const t: TaskDetail = task.data;

  async function send(action: TaskAction, input: Omit<ActInput, 'action'>, pin?: string) {
    await actOnTask(t.id, { action: action.action, ...input }, pin);
    await Promise.all([qc.invalidateQueries({ queryKey: ['tasks'] }), qc.invalidateQueries({ queryKey: ['map-counters'] })]);
    qc.removeQueries({ queryKey: ['task', t.id] });
    setPinFor(null);
    setReturnFor(null);
    onDone(`${t.title}: ${DONE_MESSAGE[action.action] ?? 'Done.'}`);
  }

  async function prepare(action: TaskAction): Promise<Omit<ActInput, 'action'>> {
    if (!action.needsFile) return {};
    if (!file) throw new Error('choose_file');
    const doc = await uploadTaskDocument(t.project!.id, action.needsFile.code, t.subject.kind === 'document_upload' ? t.subject.gateNo : 13, action.needsFile.title, file);
    return { documentId: doc.id, effectiveDate: date || undefined };
  }

  async function onPrimary(action: TaskAction) {
    setError(null);
    if (action.needsFile && !file) return setError('Choose the file first.');
    if (action.needsDate && !date) return setError('Enter the date on the document.');
    if (action.needsPin) return setPinFor(action);
    setBusy(true);
    try {
      await send(action, await prepare(action));
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  const primary = t.actions.filter((a) => a.kind === 'primary');
  const returns = t.actions.filter((a) => a.kind === 'return');
  const needsUpload = primary.some((a) => a.needsFile);

  return (
    <article aria-labelledby="task-title" className="flex flex-col gap-6 p-6">
      <header>
        {t.project && (
          <p className="text-sm text-ink-muted">
            <Link href={`/projects/${t.project.id}`} className="text-brand-800 underline underline-offset-4">{t.project.name}</Link>
            <span aria-hidden> · </span>
            {t.subject.kind === 'gate' || t.subject.kind === 'document_upload' ? `Gate ${t.subject.gateNo}, ${lowerFirst(t.subject.gateName)}` : t.subject.kind === 'certificate' ? 'Gate 13, certify and pay' : t.subject.kind === 'publish' ? 'Gate 1, initiation' : 'Tasks'}
          </p>
        )}
        <h1 id="task-title" className="mt-1 text-2xl font-semibold text-brand-900">{t.title}</h1>
        <p className="mt-1 text-lg">{t.reason}</p>
        <p className={`mt-1 text-sm ${t.overdue ? 'font-semibold text-status-stalled' : 'text-ink-muted'}`}>
          {t.overdue ? 'Overdue. ' : ''}Waiting {formatAge(t.createdAt)}{t.dueAt ? `, due ${formatDate(t.dueAt)}` : ''}
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
      <section className="rounded-md bg-surface p-5 ring-1 ring-line">
        <SubjectPanel subject={t.subject} upload={needsUpload ? { file, date, onFile: setFile, onDate: setDate } : undefined} />
      </section>

      {t.documents.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Documents</h2>
          <ul className="flex flex-wrap gap-2">
            {t.documents.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={async () => {
                    const { url } = await getDocumentUrl(d.id);
                    if (url && url !== '#') window.open(url, '_blank', 'noopener');
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 hover:border-brand-900"
                >
                  <span className="tabular font-semibold">{d.code}</span> {d.title}
                  {d.version > 1 && <span className="text-sm text-ink-muted">v{d.version}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

        </div>
        <aside className="flex flex-col gap-4">
      {t.chain.length > 0 && (
        <section className="rounded-md bg-surface p-4 ring-1 ring-line">
          <h2 className="mb-2 text-lg font-semibold">Approval chain</h2>
          <ol className="flex flex-col gap-1">
            {t.chain.map((c, i) => (
              <li key={c.step} className={`grid grid-cols-[2rem_1fr] items-start gap-2 rounded-md px-2 py-2 ${c.current ? 'bg-brand-50' : ''}`}>
                <span aria-hidden className={`grid size-7 place-items-center rounded-full text-sm font-semibold ${c.actor ? 'bg-status-operational text-white' : c.current ? 'bg-brand-900 text-white' : 'bg-canvas text-ink-muted ring-1 ring-line'}`}>
                  {c.actor ? '✓' : i + 1}
                </span>
                <span>
                  <span className="font-semibold">{c.step}</span> by {c.role}
                  <span className="block text-sm text-ink-muted">{c.actor ? `${c.actor}, ${formatDate(c.at)}` : c.current ? 'Waiting for you' : 'Not yet'}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

          {whyText(t) && (
            <section className="rounded-md bg-surface p-4 ring-1 ring-line">
              <h2 className="mb-1 font-semibold">Why you</h2>
              <p>{whyText(t)}</p>
            </section>
          )}
        </aside>
      </div>

      {t.blockedReason ? (
        <p className="rounded-md bg-[#fbecd9] p-4">{t.blockedReason}</p>
      ) : (
        <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center gap-3 border-t border-line bg-surface px-6 py-4">
          {primary[0] && afterText(t, primary[0].label) && <p className="w-full text-sm text-ink-muted xl:w-auto xl:flex-1">{afterText(t, primary[0].label)}</p>}
          {returns.map((a) => (
            <Button key={a.action} variant="secondary" className="ml-auto xl:ml-0" onClick={() => setReturnFor(a)}>
              {a.label}
            </Button>
          ))}
          {primary.map((a) => (
            <Button key={a.action} className="min-w-48" busy={busy} onClick={() => onPrimary(a)}>
              {a.label}
              {a.needsPin && <span className="text-sm font-normal opacity-80">(PIN)</span>}
            </Button>
          ))}
          {error && <p role="alert" className="w-full font-medium text-danger">{error}</p>}
        </div>
      )}

      {pinFor && (
        <PinSheet
          open
          action={pinFor.action}
          actionLabel={pinFor.label}
          subjectId={t.subjectId}
          summary={[t.title, t.subject.kind === 'certificate' && t.subject.netKobo !== null ? formatNairaExact(t.subject.netKobo) : t.subject.kind === 'variation' && t.subject.amountKobo !== null ? formatNairaExact(t.subject.amountKobo) : null, t.project?.name].filter(Boolean).join(' · ')}
          onClose={() => setPinFor(null)}
          onConfirmed={async (token) => send(pinFor, await prepare(pinFor), token)}
        />
      )}
      {returnFor && (
        <ReturnSheet
          open
          actionLabel={returnFor.label}
          onClose={() => setReturnFor(null)}
          onSubmit={(reasonId, comment) => send(returnFor, { returnReasonId: reasonId, comment: comment || undefined })}
        />
      )}
    </article>
  );
}
