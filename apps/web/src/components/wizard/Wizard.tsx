'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import {
  addMember,
  addStation,
  attachGateEvidence,
  createProject,
  findUsers,
  getReview,
  removeStation,
  sendForPublishing,
  setFundingRoute,
  updateBasics,
  uploadAlignment,
  uploadDocument,
} from '@/lib/endpoints';
import { formatChainage, formatDate, lowerFirst } from '@/lib/format';
import { messageFor } from '@/lib/messages';
import { roleLabel } from '@/lib/roles';
import { formatKm } from '@/lib/status';
import { TOWNS, TOWN_NAMES } from '@/lib/towns';
import type { DraftReview, FundingRoute, ProjectBasics } from '@/lib/types';
import { GATES, ROUTES } from './gates';
import { STEPS, WizardFrame } from './WizardFrame';

const PreviewMap = dynamic(() => import('./PreviewMap').then((m) => m.PreviewMap), { ssr: false });

const TYPES: Array<{ key: ProjectBasics['type']; label: string }> = [
  { key: 'new_line', label: 'New line' },
  { key: 'rehabilitation', label: 'Rehabilitation' },
  { key: 'extension', label: 'Extension' },
  { key: 'station', label: 'Station' },
];
const ORIGINS: Array<{ key: ProjectBasics['originKind']; label: string }> = [
  { key: 'master_plan', label: 'Rail master plan' },
  { key: 'presidential_directive', label: 'Presidential directive' },
  { key: 'state_request', label: 'Request from a state' },
  { key: 'unsolicited_proposal', label: 'Unsolicited proposal' },
];

/** Which steps are complete, from the draft as the API reports it. */
function doneFlags(d: DraftReview | undefined): boolean[] {
  const has = (code: string) => Boolean(d?.documents.some((x) => x.code === code));
  return [
    Boolean(d?.basics),
    Boolean(d?.fundingRoute),
    Boolean(d?.alignment),
    Boolean(d?.members.some((m) => m.role === 'nrc_project_engineer')),
    has('D01') && has('D02') && Boolean(d?.gate1PassedOn),
    Boolean(d?.locked),
  ];
}

/** Station positions for the preview, interpolated along the line by chainage. */
function placeOnLine(line: [number, number][], lengthM: number, chainageM: number): [number, number] {
  const seg = line.slice(1).map((b, i) => {
    const a = line[i]!;
    return { a, b, d: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  });
  const total = seg.reduce((n, s) => n + s.d, 0);
  let target = (Math.min(Math.max(chainageM, 0), lengthM) / lengthM) * total;
  for (const s of seg) {
    if (target <= s.d) return [s.a[0] + ((s.b[0] - s.a[0]) * target) / s.d, s.a[1] + ((s.b[1] - s.a[1]) * target) / s.d];
    target -= s.d;
  }
  return line[line.length - 1]!;
}

export function Wizard({ draftId, step }: { draftId: string | null; step: number }) {
  const router = useRouter();
  const qc = useQueryClient();
  const review = useQuery({ queryKey: ['draft', draftId], queryFn: () => getReview(draftId!), enabled: Boolean(draftId) });
  const d = review.data;
  const done = doneFlags(d);
  const locked = Boolean(d?.locked);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ['draft', draftId] });
  const go = (n: number, id = draftId) => router.push(`/setup/${id}?step=${n}`);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  const line: [number, number][] | null = d?.alignment?.geometry.coordinates
    ?? (d?.basics && TOWNS[d.basics.startTown] && TOWNS[d.basics.endTown] ? [TOWNS[d.basics.startTown]!, TOWNS[d.basics.endTown]!] : null);
  const stationPoints = useMemo(
    () => (d?.alignment ? d.stations.map((s) => ({ name: s.name, at: placeOnLine(d.alignment!.geometry.coordinates, d.alignment!.lengthM, s.chainageM) })) : []),
    [d],
  );

  if (draftId && review.isPending) {
    return <main className="p-6 text-ink-muted">Opening the draft…</main>;
  }
  if (draftId && review.isError) {
    return <main className="p-6 text-danger">This draft could not be opened. It may belong to someone else.</main>;
  }

  const title = d?.basics?.name ?? 'Basics';
  const frame = (content: ReactNode, footer: ReactNode, intro?: string, aside: ReactNode = <PreviewMap line={line} stations={stationPoints} />) => (
    <WizardFrame draftId={draftId} step={step} done={done} title={title} intro={intro} aside={aside} footer={
      <>
        {footer}
        {error && <p role="alert" className="w-full font-medium text-danger">{error}</p>}
      </>
    }>
      {locked && step !== 6 && (
        <p className="rounded-md bg-brand-50 p-4">This draft is with the Director for publishing, so it cannot be changed. If the Director returns it, you can edit it again.</p>
      )}
      {content}
    </WizardFrame>
  );

  const back = (n: number) => (
    <Button type="button" variant="secondary" onClick={() => (n === 0 ? router.push('/') : go(n))}>
      {n === 0 ? 'Cancel' : 'Back'}
    </Button>
  );

  /* ---------- Step 1: Basics ---------- */
  if (step === 1) {
    return <BasicsStep initial={d?.basics ?? null} busy={busy} locked={locked} frame={frame} back={back} onSubmit={(basics, conceptNote) =>
      run(async () => {
        let id = draftId;
        if (id) await updateBasics(id, basics);
        else id = (await createProject(basics)).id;
        if (conceptNote) await uploadDocument(id, 'D01', 1, 'Concept note', conceptNote);
        await qc.invalidateQueries({ queryKey: ['draft', id] });
        go(2, id);
      })
    } />;
  }

  /* ---------- Step 2: Funding route ---------- */
  if (step === 2) {
    return <RouteStep initial={d?.fundingRoute ?? null} busy={busy} locked={locked} frame={frame} back={back} onSubmit={(route) =>
      run(async () => {
        await setFundingRoute(draftId!, route);
        await refresh();
        go(3);
      })
    } />;
  }

  /* ---------- Step 3: Geography ---------- */
  if (step === 3) {
    return frame(
      <>
        <fieldset disabled={locked} className="flex flex-col gap-3">
          <legend className="mb-2 text-lg font-semibold">The line</legend>
          <p className="text-ink-muted">Upload the alignment from the consultant: KML, KMZ, GeoJSON, or a shapefile in a .zip. Until then the map shows a straight placeholder.</p>
          <label className="inline-flex min-h-12 w-fit cursor-pointer items-center rounded-md border-2 border-dashed border-line-strong bg-surface px-5 font-semibold text-brand-900 hover:bg-brand-50">
            {d?.alignment ? 'Replace the alignment file' : 'Choose the alignment file'}
            <input
              type="file"
              accept=".kml,.kmz,.geojson,.json,.zip"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void run(async () => { await uploadAlignment(draftId!, f); await refresh(); });
                e.target.value = '';
              }}
            />
          </label>
          {busy && <p className="text-ink-muted">Reading the file…</p>}
          {d?.alignment && (
            <p className="rounded-md bg-[#e3f1e6] p-4">
              Line loaded: <strong className="tabular">{formatKm(d.alignment.lengthM)}</strong> through {d.alignment.states.join(' and ')}.
            </p>
          )}
        </fieldset>

        <StationsEditor draft={d!} disabled={locked || !d?.alignment} busy={busy} onAdd={(name, km) => run(async () => { await addStation(draftId!, name, Math.round(km * 1000)); await refresh(); })} onRemove={(sid) => run(async () => { await removeStation(draftId!, sid); await refresh(); })} />
      </>,
      <>
        {back(2)}
        <Button className="ml-auto" onClick={() => go(4)}>Next</Button>
      </>,
      'Where the line runs, and its stations.',
    );
  }

  /* ---------- Step 4: People ---------- */
  if (step === 4) {
    return <PeopleStep draft={d!} busy={busy} locked={locked} frame={frame} back={back} onAdd={(userId) => run(async () => { await addMember(draftId!, userId, 'nrc_project_engineer'); await refresh(); })} next={() => go(5)} />;
  }

  /* ---------- Step 5: Documents ---------- */
  if (step === 5) {
    return <DocumentsStep draft={d!} busy={busy} locked={locked} frame={frame} back={back}
      onUpload={(code, title, file) => run(async () => { await uploadDocument(draftId!, code, 1, title, file); await refresh(); })}
      onPass={(date) => run(async () => {
        const ids = d!.documents.filter((x) => x.code === 'D01' || x.code === 'D02').map((x) => x.id);
        await attachGateEvidence(draftId!, 1, ids, date);
        await refresh();
        go(6);
      })} />;
  }

  /* ---------- Step 6: Review and publish ---------- */
  const missing = STEPS.slice(0, 5).filter((_, i) => !done[i]);
  return frame(
    <>
      {d?.returnReason && !locked && (
        <p className="rounded-md border-l-4 border-status-stalled bg-[#fbeaec] p-4"><strong>Returned by the Director:</strong> {d.returnReason}</p>
      )}
      {locked ? (
        <p className="rounded-md bg-[#e3f1e6] p-4 text-lg">Sent to the Director for publishing. You will get a message when it is published or returned.</p>
      ) : (
        <p className="text-lg">Check everything below. The Director sees exactly this page before publishing.</p>
      )}
      <Recap title="Basics" step={1} id={draftId!} locked={locked}>
        {d?.basics && (
          <dl className="grid grid-cols-[10rem_1fr] gap-y-1">
            <dt className="text-ink-muted">Type</dt><dd>{TYPES.find((t) => t.key === d.basics!.type)?.label}, {d.basics.gauge} gauge</dd>
            <dt className="text-ink-muted">From and to</dt><dd>{d.basics.startTown} to {d.basics.endTown}</dd>
            <dt className="text-ink-muted">Origin</dt><dd>{ORIGINS.find((o) => o.key === d.basics!.originKind)?.label}{d.basics.originReference ? `, ${d.basics.originReference}` : ''}</dd>
          </dl>
        )}
      </Recap>
      <Recap title="Funding route" step={2} id={draftId!} locked={locked}>
        {d?.fundingRoute ? <p>{ROUTES.find((r) => r.key === d.fundingRoute)?.title}. Gate 4: {lowerFirst(ROUTES.find((r) => r.key === d.fundingRoute)?.gate4 ?? '')}.</p> : <Missing />}
      </Recap>
      <Recap title="Geography" step={3} id={draftId!} locked={locked}>
        {d?.alignment ? (
          <p>{formatKm(d.alignment.lengthM)} through {d.alignment.states.join(' and ')}; {d.stations.length ? `stations: ${d.stations.map((s) => `${s.name} (${formatChainage(s.chainageM)})`).join(', ')}` : 'no stations yet'}.</p>
        ) : <Missing />}
      </Recap>
      <Recap title="People" step={4} id={draftId!} locked={locked}>
        <ul>{d?.members.map((m) => <li key={m.name + m.role}>{m.name}, {roleLabel(m.role)}{m.confirmed ? '' : ' (waiting for the Director to confirm)'}</li>)}</ul>
      </Recap>
      <Recap title="Documents" step={5} id={draftId!} locked={locked}>
        <ul>{d?.documents.map((x) => <li key={x.id}><span className="tabular font-semibold">{x.code}</span> {x.title}</li>)}</ul>
        {d?.gate1PassedOn ? <p className="mt-1">Gate 1 passed on {formatDate(d.gate1PassedOn)}, to be confirmed by the Director.</p> : <Missing />}
      </Recap>
      {!locked && missing.length > 0 && (
        <p className="rounded-md bg-[#fbecd9] p-4">Still to do before sending: {missing.join(', ').toLowerCase()}.</p>
      )}
    </>,
    <>
      {back(5)}
      <Link href={`/?focus=${draftId}`} className="inline-flex min-h-12 items-center rounded-md px-4 font-semibold text-brand-900 underline underline-offset-4 hover:bg-brand-50">Preview on the map</Link>
      <Link href={`/projects/${draftId}`} className="inline-flex min-h-12 items-center rounded-md px-4 font-semibold text-brand-900 underline underline-offset-4 hover:bg-brand-50">Preview the project page</Link>
      {!locked && (
        <Button className="ml-auto" busy={busy} disabled={missing.length > 0} onClick={() => run(async () => { await sendForPublishing(draftId!); await refresh(); })}>
          Send for publishing
        </Button>
      )}
    </>,
  );
}

function Missing() {
  return <p className="font-medium text-status-construction">Not done yet</p>;
}

function Recap({ title, step, id, locked, children }: { title: string; step: number; id: string; locked: boolean; children: ReactNode }) {
  return (
    <section className="rounded-md bg-surface p-4 ring-1 ring-line">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {!locked && <Link href={`/setup/${id}?step=${step}`} className="min-h-11 py-2 font-semibold text-brand-900 underline underline-offset-4">Edit</Link>}
      </div>
      {children}
    </section>
  );
}

type Frame = (content: ReactNode, footer: ReactNode, intro?: string, aside?: ReactNode) => ReactNode;

function BasicsStep({ initial, busy, locked, frame, back, onSubmit }: { initial: ProjectBasics | null; busy: boolean; locked: boolean; frame: Frame; back: (n: number) => ReactNode; onSubmit: (b: ProjectBasics, conceptNote: File | null) => void }) {
  const [b, setB] = useState<ProjectBasics>(initial ?? { name: '', type: 'new_line', gauge: 'standard', startTown: '', endTown: '', originKind: 'master_plan', originReference: '' });
  const [note, setNote] = useState<File | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const set = <K extends keyof ProjectBasics>(k: K, v: ProjectBasics[K]) => setB((x) => ({ ...x, [k]: v }));
  const line: [number, number][] | null = TOWNS[b.startTown] && TOWNS[b.endTown] ? [TOWNS[b.startTown]!, TOWNS[b.endTown]!] : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!b.name.trim() || !b.startTown || !b.endTown) return setInvalid('Give the project a name and choose both towns.');
    if (b.startTown === b.endTown) return setInvalid('The start and end towns must be different.');
    setInvalid(null);
    onSubmit(b, note);
  };

  return frame(
    <form id="basics" onSubmit={submit} className="flex flex-col gap-6">
      <fieldset disabled={locked} className="flex flex-col gap-6">
        <Field label="Project name" placeholder="Kano–Katsina–Maradi standard gauge railway" value={b.name} onChange={(e) => set('name', e.target.value)} className="text-lg" />
        <Tiles legend="Type" value={b.type} options={TYPES} onChange={(v) => set('type', v)} />
        <Tiles legend="Gauge" value={b.gauge} options={[{ key: 'standard', label: 'Standard gauge' }, { key: 'narrow', label: 'Narrow gauge' }]} onChange={(v) => set('gauge', v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TownSelect label="Starts at" value={b.startTown} onChange={(v) => set('startTown', v)} />
          <TownSelect label="Ends at" value={b.endTown} onChange={(v) => set('endTown', v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-semibold">Where the idea came from</span>
            <select value={b.originKind} onChange={(e) => set('originKind', e.target.value as ProjectBasics['originKind'])} className="min-h-14 rounded-md border-2 border-line-strong bg-surface px-3 text-lg">
              {ORIGINS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </label>
          <Field label="Reference (optional)" placeholder="Letter or file number" value={b.originReference} onChange={(e) => set('originReference', e.target.value)} className="text-lg" />
        </div>
        <FilePick label="Concept note (D01)" hint="PDF or Word. You can also add it at step 5." file={note} onPick={setNote} />
      </fieldset>
      {invalid && <p role="alert" className="font-medium text-danger">{invalid}</p>}
    </form>,
    <>
      {back(0)}
      <Button className="ml-auto" type="submit" form="basics" busy={busy} disabled={locked}>Next</Button>
    </>,
    'Start with what the project is and where it runs. Only you and the Director can see it until it is published.',
    <PreviewMapLazy line={line} />,
  );
}

const PreviewMapLazy = ({ line }: { line: [number, number][] | null }) => <PreviewMap line={line} stations={[]} />;

function RouteStep({ initial, busy, locked, frame, back, onSubmit }: { initial: FundingRoute | null; busy: boolean; locked: boolean; frame: Frame; back: (n: number) => ReactNode; onSubmit: (r: FundingRoute) => void }) {
  const [route, setRoute] = useState<FundingRoute | null>(initial);
  const chosen = ROUTES.find((r) => r.key === route);
  return frame(
    <fieldset disabled={locked} className="flex flex-col gap-4">
      <legend className="sr-only">Funding route</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROUTES.map((r) => (
          <label key={r.key} className={`flex cursor-pointer flex-col gap-1 rounded-md border-2 p-4 ${route === r.key ? 'border-brand-900 bg-brand-50' : 'border-line bg-surface hover:border-line-strong'}`}>
            <span className="flex items-center gap-3">
              <input type="radio" name="route" value={r.key} checked={route === r.key} onChange={() => setRoute(r.key)} className="size-5 accent-brand-900" />
              <span className="text-lg font-semibold">{r.title}</span>
            </span>
            <span className="text-ink-muted">{r.text}</span>
          </label>
        ))}
      </div>
    </fieldset>,
    <>
      {back(1)}
      <Button className="ml-auto" busy={busy} disabled={!route || locked} onClick={() => route && onSubmit(route)}>Next</Button>
    </>,
    'How the project will be paid for. This sets which approvals it needs.',
    <section className="rounded-md bg-surface p-5 ring-1 ring-line">
      <h2 className="mb-3 text-lg font-semibold">The 15 gates this project will pass</h2>
      <ol className="flex flex-col gap-1">
        {GATES.map((g, i) => (
          <li key={g} className={`flex gap-3 rounded px-2 py-1 ${i === 3 && chosen ? 'bg-brand-50' : ''}`}>
            <span className="tabular w-6 shrink-0 text-right font-semibold">{i + 1}</span>
            <span>
              {g}
              {i === 3 && chosen && <span className="block text-sm text-ink-muted">{chosen.gate4}</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>,
  );
}

function StationsEditor({ draft, disabled, busy, onAdd, onRemove }: { draft: DraftReview; disabled: boolean; busy: boolean; onAdd: (name: string, km: number) => void; onRemove: (id: string) => void }) {
  const [name, setName] = useState('');
  const [km, setKm] = useState('');
  const max = draft.alignment ? draft.alignment.lengthM / 1000 : 0;
  const kmNum = Number(km);
  const valid = name.trim() && km !== '' && kmNum >= 0 && kmNum <= max;
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-3">
      <legend className="mb-2 text-lg font-semibold">Stations</legend>
      {disabled && !draft.alignment && <p className="text-ink-muted">Stations can be added once the line is loaded.</p>}
      <ul className="flex flex-col gap-2">
        {draft.stations.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 rounded-md bg-surface p-3 ring-1 ring-line">
            <span><strong>{s.name}</strong> <span className="tabular text-ink-muted">{formatChainage(s.chainageM)}</span></span>
            <button type="button" onClick={() => onRemove(s.id)} className="min-h-11 rounded-md px-3 text-danger underline underline-offset-4 hover:bg-[#fbeaec]">Remove</button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1"><Field label="Station name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="w-40"><Field label="At km" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value.replace(/[^\d.]/g, ''))} hint={max ? `0 to ${Math.round(max)}` : undefined} /></div>
        <Button type="button" variant="secondary" busy={busy} disabled={!valid} onClick={() => { onAdd(name.trim(), kmNum); setName(''); setKm(''); }}>Add station</Button>
      </div>
    </fieldset>
  );
}

function PeopleStep({ draft, busy, locked, frame, back, onAdd, next }: { draft: DraftReview; busy: boolean; locked: boolean; frame: Frame; back: (n: number) => ReactNode; onAdd: (userId: string) => void; next: () => void }) {
  const engineers = useQuery({ queryKey: ['users', 'nrc_project_engineer'], queryFn: () => findUsers('nrc_project_engineer') });
  const [pick, setPick] = useState('');
  const hasEngineer = draft.members.some((m) => m.role === 'nrc_project_engineer');
  return frame(
    <fieldset disabled={locked} className="flex flex-col gap-5">
      <legend className="sr-only">People</legend>
      <ul className="flex flex-col gap-2">
        {draft.members.map((m) => (
          <li key={m.name + m.role} className="rounded-md bg-surface p-3 ring-1 ring-line">
            <strong>{m.name}</strong>, {roleLabel(m.role)}
            <span className="block text-sm text-ink-muted">{m.organisation}{m.confirmed ? '' : ', waiting for the Director to confirm'}</span>
          </li>
        ))}
      </ul>
      {!hasEngineer && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-64 flex-1 flex-col gap-2">
            <span className="font-semibold">NRC project engineer</span>
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="min-h-14 rounded-md border-2 border-line-strong bg-surface px-3 text-lg">
              <option value="">Choose a person</option>
              {engineers.data?.map((u) => <option key={u.id} value={u.id}>{u.name}, {u.organisation}</option>)}
            </select>
          </label>
          <Button type="button" variant="secondary" busy={busy} disabled={!pick} onClick={() => onAdd(pick)}>Add to the project</Button>
        </div>
      )}
      <p className="text-ink-muted">The contractor and the supervising consultant are added later, with their lots, once the contract is signed (gate 8).</p>
    </fieldset>,
    <>
      {back(3)}
      <Button className="ml-auto" onClick={next}>Next</Button>
    </>,
    'Who works on the project from the start. You are the project manager; the Director is added automatically.',
  );
}

function DocumentsStep({ draft, busy, locked, frame, back, onUpload, onPass }: { draft: DraftReview; busy: boolean; locked: boolean; frame: Frame; back: (n: number) => ReactNode; onUpload: (code: string, title: string, file: File) => void; onPass: (date: string) => void }) {
  const [date, setDate] = useState(draft.gate1PassedOn?.slice(0, 10) ?? '');
  const doc = (code: string) => draft.documents.find((x) => x.code === code);
  const ready = doc('D01') && doc('D02') && date;
  return frame(
    <fieldset disabled={locked} className="flex flex-col gap-5">
      <legend className="sr-only">Documents for gate 1</legend>
      {[
        { code: 'D01', title: 'Concept note' },
        { code: 'D02', title: 'Minister\u2019s approval minute' },
      ].map((x) => (
        <div key={x.code} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface p-4 ring-1 ring-line">
          <div>
            <p className="font-semibold"><span className="tabular">{x.code}</span> {x.title}</p>
            <p className={doc(x.code) ? 'text-status-operational' : 'text-ink-muted'}>{doc(x.code) ? `Attached, version ${doc(x.code)!.version}` : 'Not attached yet'}</p>
          </div>
          <label className="inline-flex min-h-12 cursor-pointer items-center rounded-md border-2 border-brand-900 px-4 font-semibold text-brand-900 hover:bg-brand-50">
            {doc(x.code) ? 'Replace' : 'Attach'}
            <input type="file" accept=".pdf,.docx" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(x.code, x.title, f); e.target.value = ''; }} />
          </label>
        </div>
      ))}
      <div className="max-w-xs">
        <Field label="Date the Minister approved" type="date" value={date} onChange={(e) => setDate(e.target.value)} hint="From the minute. This marks gate 1 as passed, for the Director to confirm." />
      </div>
    </fieldset>,
    <>
      {back(4)}
      <Button className="ml-auto" busy={busy} disabled={!ready || locked} onClick={() => onPass(date)}>Mark gate 1 passed and continue</Button>
    </>,
    'The two documents that make this an official project.',
  );
}

function Tiles<K extends string>({ legend, value, options, onChange }: { legend: string; value: K; options: Array<{ key: K; label: string }>; onChange: (v: K) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.key} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 px-4 ${value === o.key ? 'border-brand-900 bg-brand-50 font-semibold' : 'border-line bg-surface hover:border-line-strong'}`}>
            <input type="radio" name={legend} checked={value === o.key} onChange={() => onChange(o.key)} className="size-5 accent-brand-900" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TownSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-semibold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="min-h-14 rounded-md border-2 border-line-strong bg-surface px-3 text-lg">
        <option value="">Choose a town</option>
        {TOWN_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </label>
  );
}

function FilePick({ label, hint, file, onPick }: { label: string; hint: string; file: File | null; onPick: (f: File | null) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">{label}</span>
      <span className="text-sm text-ink-muted">{hint}</span>
      <label className="inline-flex min-h-12 w-fit cursor-pointer items-center rounded-md border-2 border-dashed border-line-strong bg-surface px-5 font-semibold text-brand-900 hover:bg-brand-50">
        {file ? `Chosen: ${file.name}` : 'Choose a file'}
        <input type="file" accept=".pdf,.docx" className="sr-only" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
