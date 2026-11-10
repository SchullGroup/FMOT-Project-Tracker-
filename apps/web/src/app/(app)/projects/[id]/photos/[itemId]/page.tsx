'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { NoPhotoTile } from '@/components/project/NoPhotoTile';
import { PhotoThumb } from '@/components/project/PhotoThumb';
import { useProjectId } from '@/components/project/ProjectFrame';
import { ReturnSheet } from '@/components/tasks/ReturnSheet';
import { CheckList } from '@/components/tasks/SubjectPanel';
import { Button } from '@/components/ui/Button';
import { Pill, StatusPill } from '@/components/ui/Pill';
import { QueryState, Section } from '@/components/ui/Section';
import { getFieldItem, getMediaUrl, getSubmissions, sendBackFieldItem, verifyFieldItem } from '@/lib/endpoints';
import { formatChainage, formatDate } from '@/lib/format';
import { messageFor } from '@/lib/messages';
import type { FieldItem } from '@/lib/types';

const KIND_LABEL: Record<FieldItem['kind'], string> = {
  photo: 'Photo',
  daily_report: 'Daily report',
  milestone_claim: 'Milestone claim',
  incident: 'Incident',
};

/*
 * W7.4 Verify photo, for any item from site: the photos large, the voice note, a report's answers, where and when,
 * and the automatic checks in plain words. The lot's resident engineer verifies it or sends it back with a reason
 * from the list, then moves to the next item waiting; everyone else who may see it reads it.
 */
export default function FieldItemPage() {
  const projectId = useProjectId();
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const item = useQuery({ queryKey: ['field-item', itemId], queryFn: () => getFieldItem(itemId) });
  const list = useQuery({ queryKey: ['submissions', projectId], queryFn: () => getSubmissions(projectId) });
  const [returning, setReturning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const back = `/projects/${projectId}/photos`;
  // The next item waiting for the engineer, oldest first, so a queue can be worked through without going back.
  const next = (list.data ?? [])
    .filter((s) => s.status === 'pending_re' && s.id !== itemId)
    .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt))[0];

  async function decided(message: string) {
    await Promise.all([queryClient.invalidateQueries({ queryKey: ['submissions', projectId] }), queryClient.invalidateQueries({ queryKey: ['field-item', itemId] })]);
    setDone(message);
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      await verifyFieldItem(itemId);
      await decided('Verified. It now counts towards progress.');
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  async function sendBack(reasonId: string, note: string) {
    await sendBackFieldItem(itemId, reasonId, note);
    setReturning(false);
    await decided('Sent back. The site manager sees your reason and takes it again.');
  }

  const s = item.data;
  return (
    <div className="flex flex-col gap-4">
      <Link href={back} className="self-start font-medium text-brand-900 underline underline-offset-4">
        Back to photos and reports
      </Link>
      <Section title={s ? [KIND_LABEL[s.kind], s.what].filter(Boolean).join(': ') : 'Item from site'}>
        <QueryState loading={item.isPending} error={item.isError} />
        {s && (
          <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
            <div className="flex flex-col gap-3">
              {s.photoIds.length ? (
                <div className={`grid gap-3 ${s.photoIds.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {s.photoIds.map((m, i) => (
                    <PhotoThumb key={m} mediaId={m} size="web" alt={`${KIND_LABEL[s.kind]} photo ${s.photoIds.length > 1 ? i + 1 : ''} at ${formatChainage(s.chainageM)}`.replace('  ', ' ')} />
                  ))}
                </div>
              ) : (
                <NoPhotoTile kind={s.kind} line={s.lines.length ? s.lines.filter((l) => l.label !== 'Report for').map((l) => `${l.label}: ${l.value}`).join(' · ') : null} />
              )}
              {s.voiceId && <VoiceNote mediaId={s.voiceId} />}
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-2">
                <StatusPill status={s.status} />
                {s.flagged && <Pill tone="warn">Flagged by the checks</Pill>}
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="text-ink-muted">Where</dt>
                <dd className="tabular font-medium">
                  {s.chainageM !== null ? formatChainage(s.chainageM) : 'Not given'}
                  {s.offsetM !== null && s.offsetM > 0 ? `, ${s.offsetM >= 1000 ? `${(s.offsetM / 1000).toFixed(1)} km` : `${s.offsetM} m`} from the line` : ''}, {s.lotName}
                </dd>
                <dt className="text-ink-muted">Sent by</dt>
                <dd className="font-medium">{s.submittedBy}</dd>
                <dt className="text-ink-muted">Taken</dt>
                <dd>{formatDate(s.capturedAt)}, {formatTime(s.capturedAt)}</dd>
                <dt className="text-ink-muted">Arrived</dt>
                <dd>{formatDate(s.receivedAt)}, {formatTime(s.receivedAt)}</dd>
                {s.lines.map((l) => (
                  <div key={l.label} className="contents">
                    <dt className="text-ink-muted">{l.label}</dt>
                    <dd>{l.value}</dd>
                  </div>
                ))}
                {s.reviewedBy && (
                  <>
                    <dt className="text-ink-muted">{s.status === 'sent_back' ? 'Sent back by' : 'Verified by'}</dt>
                    <dd>
                      {s.reviewedBy}
                      {s.reviewedAt ? `, ${formatDate(s.reviewedAt)}` : ''}
                    </dd>
                  </>
                )}
                {s.returnReason && (
                  <>
                    <dt className="text-ink-muted">Reason</dt>
                    <dd className="font-medium text-danger">{s.returnReason}</dd>
                  </>
                )}
              </dl>

              {s.checks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">Automatic checks</h3>
                  <CheckList checks={s.checks} />
                </div>
              )}

              {done ? (
                <div role="status" className="flex flex-col gap-3 rounded-md bg-brand-50 p-4">
                  <p className="font-medium">{done}</p>
                  <div className="flex flex-wrap gap-3">
                    {next && <Button onClick={() => router.push(`${back}/${next.id}`)}>Next item waiting</Button>}
                    <Button variant="secondary" onClick={() => router.push(back)}>
                      Back to the list
                    </Button>
                  </div>
                </div>
              ) : s.canReview ? (
                <div className="flex flex-col gap-3">
                  <p>
                    Verify it if it shows what it says, where it says. Send it back with a reason if not; {s.submittedBy} sees the reason on the phone.
                  </p>
                  {error && (
                    <p role="alert" className="font-medium text-danger">
                      {error}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button busy={busy} onClick={() => void verify()}>
                      Verify
                    </Button>
                    <Button variant="secondary" disabled={busy} onClick={() => setReturning(true)}>
                      Send back
                    </Button>
                  </div>
                </div>
              ) : (
                s.status === 'pending_re' && <p className="text-ink-muted">Waiting for the lot&rsquo;s resident engineer to verify it or send it back.</p>
              )}
            </div>
          </div>
        )}
      </Section>
      <ReturnSheet open={returning} actionLabel="Send back" onClose={() => setReturning(false)} onSubmit={sendBack} />
    </div>
  );
}

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });

/** The voice note, through a short-lived signed link. */
function VoiceNote({ mediaId }: { mediaId: string }) {
  const media = useQuery({ queryKey: ['media', mediaId, 'original'], queryFn: () => getMediaUrl(mediaId, 'original'), staleTime: 4 * 60_000, retry: false });
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold">Voice note</span>
      {media.data?.url && media.data.url !== '#' ? (
        <audio controls preload="none" src={media.data.url} className="w-full">
          <track kind="captions" />
        </audio>
      ) : (
        <span className="text-sm text-ink-muted">{media.isError ? 'The voice note could not be loaded.' : 'Loading…'}</span>
      )}
    </div>
  );
}
