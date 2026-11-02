'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { PhotoThumb } from '@/components/project/PhotoThumb';
import { Field } from '@/components/ui/Field';
import { formatChainage, formatDate, formatMonth, formatNaira, lowerFirst } from '@/lib/format';
import { roleLabel } from '@/lib/roles';
import { formatKm, formatPhone } from '@/lib/status';
import type { CheckResult, TaskSubject } from '@/lib/types';

const RESULT: Record<CheckResult['result'], { mark: string; cls: string; word: string }> = {
  pass: { mark: '✓', cls: 'bg-[#e3f1e6] text-[#1f5a2b]', word: 'Passed' },
  warn: { mark: '!', cls: 'bg-[#fbecd9] text-[#7a4304]', word: 'Warning' },
  fail: { mark: '✕', cls: 'bg-[#fbe3e6] text-[#8a0019]', word: 'Failed' },
};

/** The part of a task screen that shows what is being decided. */
export function SubjectPanel(props: {
  subject: TaskSubject;
  upload?: { file: File | null; date: string; onFile: (f: File | null) => void; onDate: (d: string) => void };
}) {
  const s = props.subject;
  switch (s.kind) {
    case 'photo':
      return (
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-2">
            <PhotoThumb mediaId={s.mediaId} alt={`${s.discipline ?? 'Site'} photo at ${formatChainage(s.chainageM)}`} className="aspect-[4/3]" />
            <p className="text-sm text-ink-muted">
              {s.discipline}, {formatChainage(s.chainageM)}, taken {formatDate(s.capturedAt)} by {s.submittedBy}
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <CorridorDiagram offsetM={s.offsetM} widthM={s.corridorWidthM} />
            <LotDiagram name={s.lotName} fromM={s.lotFromM} toM={s.lotToM} atM={s.chainageM} />
            <ul className="flex flex-col gap-2" aria-label="Automatic checks">
              {s.checks.map((c) => (
                <li key={c.name} className="flex items-start gap-3">
                  <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${RESULT[c.result].cls}`}>{RESULT[c.result].mark}</span>
                  <span>
                    <span className="font-semibold">{c.name}</span> <span className="sr-only">{RESULT[c.result].word}.</span>
                    <span className="block text-sm text-ink-muted">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    case 'milestone':
      return (
        <div className="flex flex-col gap-4">
          <p className="text-lg"><strong>{s.name}</strong> at {formatChainage(s.chainageM)}, {s.lotName}. Claimed by {s.submittedBy} on {formatDate(s.claimedAt)}.</p>
          <div className="grid grid-cols-2 gap-3">
            {s.mediaIds.map((m, i) => <PhotoThumb key={m} mediaId={m} alt={`Milestone photo ${i + 1}`} />)}
          </div>
        </div>
      );
    case 'gate':
      return (
        <dl className="grid grid-cols-[12rem_1fr] gap-y-2 text-lg">
          <dt className="text-ink-muted">Gate</dt><dd><span className="tabular font-semibold">{s.gateNo}</span>, {s.gateName}</dd>
          <dt className="text-ink-muted">Date of the decision</dt><dd className="tabular">{formatDate(s.effectiveDate)}</dd>
          <dt className="text-ink-muted">Uploaded by</dt><dd>{s.uploadedBy}, {formatDate(s.uploadedAt)}</dd>
        </dl>
      );
    case 'certificate':
      return (
        <div className="flex flex-col gap-5">
          <p className="text-lg">Certificate {s.number}, {s.lotName}, for {formatMonth(s.period)}.</p>
          {s.netKobo !== null ? (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Money label="Gross" kobo={s.grossKobo} />
              <Money label="Retention" kobo={s.retentionKobo} />
              <Money label="Advance recovery" kobo={s.advanceRecoveryKobo} />
              <Money label="Net to pay" kobo={s.netKobo} strong />
            </dl>
          ) : (
            <p className="text-ink-muted">Amounts are shown only to people with the financial permission.</p>
          )}
          <div>
            <h3 className="mb-2 font-semibold">Work measured this period</h3>
            <ul className="flex flex-col gap-1">
              {s.measurement.map((m) => <li key={m.discipline}><span className="font-medium">{m.discipline}:</span> {m.done}</li>)}
            </ul>
            <p className="mt-2 text-ink-muted"><span className="tabular font-semibold text-ink">{s.verifiedPhotos}</span> verified photos back this measurement.</p>
          </div>
        </div>
      );
    case 'design':
      return (
        <div className="flex flex-col gap-3">
          <p className="text-lg"><strong>{s.title}</strong>, {s.discipline}, {s.lotName}, version {s.version}.</p>
          {s.comments.length > 0 && (
            <ul className="flex flex-col gap-2">
              {s.comments.map((c, i) => <li key={i} className="rounded-md bg-canvas p-3"><span className="font-semibold">{c.by}:</span> {c.text}</li>)}
            </ul>
          )}
        </div>
      );
    case 'variation':
      return (
        <div className="flex flex-col gap-3 text-lg">
          <p><strong>{s.title}</strong></p>
          <p>Asks for {s.type === 'variation' ? <strong className="tabular">{formatNaira(s.amountKobo, { compact: true })}</strong> : <strong className="tabular">{s.days} more days</strong>}.</p>
          {s.assessment && <p><span className="text-ink-muted">Resident engineer:</span> {s.assessment}</p>}
          {s.recommendation && <p><span className="text-ink-muted">Project manager:</span> {s.recommendation}</p>}
          {s.aboveThreshold && <p className="rounded-md bg-[#fbecd9] p-3 text-base">This is above your limit, so it also needs BPP and FEC approval, uploaded as evidence before you confirm.</p>}
        </div>
      );
    case 'document_upload':
      return (
        <div className="flex flex-col gap-5">
          <p className="text-lg">Gate {s.gateNo}, {lowerFirst(s.gateName)}, is waiting for <strong><span className="tabular">{s.code}</span> {s.title}</strong>.</p>
          {props.upload && (
            <>
              <label className="inline-flex min-h-12 w-fit cursor-pointer items-center rounded-md border-2 border-dashed border-line-strong bg-surface px-5 font-semibold text-brand-900 hover:bg-brand-50">
                {props.upload.file ? `Chosen: ${props.upload.file.name}` : 'Choose the file'}
                <input type="file" accept=".pdf,.docx,.jpg,.png" className="sr-only" onChange={(e) => props.upload!.onFile(e.target.files?.[0] ?? null)} />
              </label>
              <div className="max-w-xs">
                <Field label="Date on the document" type="date" value={props.upload.date} onChange={(e) => props.upload!.onDate(e.target.value)} />
              </div>
            </>
          )}
        </div>
      );
    case 'account':
      return (
        <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-lg">
          <dt className="text-ink-muted">Name</dt><dd className="font-semibold">{s.name}</dd>
          <dt className="text-ink-muted">Phone</dt><dd className="tabular">{formatPhone(s.phone)}</dd>
          <dt className="text-ink-muted">Organisation</dt><dd>{s.organisation}</dd>
          <dt className="text-ink-muted">Role</dt><dd>{roleLabel(s.role)}</dd>
          <dt className="text-ink-muted">Will work on</dt><dd>{s.lots.join('; ') || 'No project yet'}</dd>
          <dt className="text-ink-muted">Asked for by</dt><dd>{s.requestedBy}</dd>
        </dl>
      );
    case 'publish': {
      const r = s.review;
      return (
        <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-lg">
          <dt className="text-ink-muted">Project</dt><dd className="font-semibold">{r.basics?.name}</dd>
          <dt className="text-ink-muted">Route</dt><dd>{r.basics?.startTown} to {r.basics?.endTown}{r.alignment ? `, ${formatKm(r.alignment.lengthM)} through ${r.alignment.states.join(' and ')}` : ''}</dd>
          <dt className="text-ink-muted">Stations</dt><dd>{r.stations.map((x) => x.name).join(', ') || 'None yet'}</dd>
          <dt className="text-ink-muted">Funding</dt><dd>{r.fundingRoute === 'loan' ? 'External loan' : r.fundingRoute === 'budget' ? 'Federal budget' : r.fundingRoute === 'ppp' ? 'Public-private partnership' : 'State or private'}</dd>
          <dt className="text-ink-muted">People</dt><dd>{r.members.map((m) => `${m.name} (${roleLabel(m.role)})`).join('; ')}</dd>
          <dt className="text-ink-muted">Gate 1</dt><dd>Minister approved on {formatDate(r.gate1PassedOn)}; publishing confirms it</dd>
        </dl>
      );
    }
    case 'generic':
      return (
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold">{s.heading}</p>
          {s.lines.length > 0 && (
            <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-lg">
              {s.lines.map((l) => (
                <Fragment key={l.label}>
                  <dt className="text-ink-muted">{l.label}</dt>
                  <dd>{l.value}</dd>
                </Fragment>
              ))}
            </dl>
          )}
          {s.link && (
            <Link href={s.link.href} className="text-lg font-semibold text-brand-700 underline">
              {s.link.label}
            </Link>
          )}
        </div>
      );
  }
}

function Money({ label, kobo, strong }: { label: string; kobo: number | string | null; strong?: boolean }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={`tabular ${strong ? 'text-2xl font-semibold' : 'text-xl'}`}>{formatNaira(kobo, { compact: true })}</dd>
    </div>
  );
}

/** Where the photo was taken across the corridor: the line, the band, the dot. */
function CorridorDiagram({ offsetM, widthM }: { offsetM: number | null; widthM: number }) {
  if (offsetM === null) return null;
  const span = Math.max(widthM * 1.6, Math.abs(offsetM) * 1.15);
  const x = (m: number) => 50 + (m / span) * 45; // percent across, line at 50
  const inside = Math.abs(offsetM) <= widthM;
  return (
    <figure>
      <svg viewBox="0 0 100 24" className="w-full" role="img" aria-label={`Taken ${Math.round(Math.abs(offsetM))} metres from the line; the corridor is ${widthM} metres each side. ${inside ? 'Inside' : 'Outside'} the corridor.`}>
        <rect x={x(-widthM)} y="4" width={x(widthM) - x(-widthM)} height="16" fill="#dfe6f0" rx="1" />
        <line x1="50" x2="50" y1="2" y2="22" stroke="#0b2545" strokeWidth="0.8" />
        <circle cx={x(offsetM)} cy="12" r="2.4" fill={inside ? '#2f7a3e' : '#b00020'} stroke="#fff" strokeWidth="0.6" />
      </svg>
      <figcaption className="text-sm text-ink-muted">
        Across the corridor: taken <strong className="tabular text-ink">{Math.round(Math.abs(offsetM))} m</strong> from the line; the shaded band is the {widthM} m corridor each side.
      </figcaption>
    </figure>
  );
}

/** Where the photo was taken along the lot. */
function LotDiagram({ name, fromM, toM, atM }: { name: string; fromM: number; toM: number; atM: number | null }) {
  if (atM === null) return null;
  const lo = Math.min(fromM, atM) - (toM - fromM) * 0.08;
  const hi = Math.max(toM, atM) + (toM - fromM) * 0.08;
  const x = (m: number) => ((m - lo) / (hi - lo)) * 100;
  const inside = atM >= fromM && atM <= toM;
  return (
    <figure>
      <svg viewBox="0 0 100 14" className="w-full" role="img" aria-label={`${formatChainage(atM)} is ${inside ? 'inside' : 'outside'} ${name}, which runs ${formatChainage(fromM)} to ${formatChainage(toM)}.`}>
        <line x1="0" x2="100" y1="7" y2="7" stroke="#c9d1db" strokeWidth="1" />
        <line x1={x(fromM)} x2={x(toM)} y1="7" y2="7" stroke="#0b2545" strokeWidth="3" strokeLinecap="round" />
        <circle cx={x(atM)} cy="7" r="2.4" fill={inside ? '#2f7a3e' : '#b00020'} stroke="#fff" strokeWidth="0.6" />
      </svg>
      <figcaption className="text-sm text-ink-muted">
        Along the line: {formatChainage(atM)}; {name} runs {formatChainage(fromM)} to {formatChainage(toM)}.
      </figcaption>
    </figure>
  );
}
