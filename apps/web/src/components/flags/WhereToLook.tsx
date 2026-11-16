'use client';

import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { formatDate, formatMonth } from '@/lib/format';
import type { ChangeFlags, ChangeFlagStretch } from '@/lib/types';
import { changeWords, FLAG_COLOURS, FLAG_LABELS, FLAG_STATUSES, flagText } from './flag-layers';

const km = (m: number) => `km ${(m / 1000).toFixed(1)}`;

/** The link value for a stretch: `<from>-<to>` in metres. */
export const lookParam = (s: { fromM: number; toM: number }) => `${s.fromM}-${s.toM}`;

export const EXPERIMENTAL_LABEL = 'Experimental: not yet reliable';

/**
 * Experimental "Where to look": automatic flags from the free 10 m pictures, per 500 m of line, for the IT administrator
 * while they are checked. A reason to look closer, never proof of progress, never used for payments. `mapHref` links a
 * stretch to the map that shows it.
 */
export function WhereToLook({ flags, mapHref }: { flags: ChangeFlags; mapHref: (s: ChangeFlagStretch) => string }) {
  const total = flags.segments.length;
  const lengthM = flags.segments[total - 1]?.toM ?? 0;
  const sens = flags.lastRun?.sensitivity;
  const noWork = flags.agreement.withoutRecordedWorkByStatus;

  const item = (s: ChangeFlagStretch, what: string, status?: ChangeFlagStretch['status']) => (
    <li key={`${s.fromM}-${s.toM}`} className="flex flex-col gap-1 rounded-md px-3 py-2 ring-1 ring-line">
      {status && (
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden className="inline-block h-2 w-6 rounded-sm" style={{ background: FLAG_COLOURS[status] }} />
          {FLAG_LABELS[status]}
        </span>
      )}
      <span>
        <strong>
          {km(s.fromM)} to {km(s.toM)}
        </strong>
        {s.lotName ? `, ${s.lotName}` : ''}: {what}
      </span>
      <Link href={mapHref(s)} className="text-sm font-medium text-brand-900 underline underline-offset-2">
        Show on the map
      </Link>
    </li>
  );

  return (
    <Section
      title="Where to look"
      aside={
        <div className="flex max-w-xl flex-col items-end gap-1 text-right">
          <span className="rounded bg-[#fff4e0] px-2 py-0.5 text-sm font-semibold text-[#7a4a00]">{EXPERIMENTAL_LABEL}</span>
          <p className="text-sm font-medium text-ink">Automatic flags from free 10 m pictures. A reason to look closer, not proof.</p>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {total === 0 || !flags.lastRun ? (
          <p className="text-ink-muted">Not worked out yet for this project.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Key">
                {FLAG_STATUSES.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span aria-hidden className="inline-block h-2 w-6 rounded-sm" style={{ background: FLAG_COLOURS[s] }} />
                    {FLAG_LABELS[s]} ({flags.counts[s]})
                  </li>
                ))}
              </ul>
              {/* The whole line, chainage left to right: each 500 m segment with its flag on hover (also on the map). */}
              <div className="flex h-6 w-full overflow-hidden rounded ring-1 ring-line" role="img" aria-label={`Flags along the line: ${flags.counts.changed} segments changed, ${flags.counts.waiting} waiting for confirmation, ${flags.counts.cleared} cleared, ${flags.counts.no_change} with no visible change, ${flags.counts.not_enough} without enough clear pictures`}>
                {flags.segments.map((s) => (
                  <span key={s.index} title={flagText(s)} className="h-full" style={{ width: `${(100 * (s.toM - s.fromM)) / lengthM}%`, background: FLAG_COLOURS[s.status] }} />
                ))}
              </div>
              <div className="flex justify-between text-[13px] text-ink-muted">
                <span>km 0</span>
                <span>{km(lengthM)}</span>
              </div>
              <p className="text-sm text-ink-muted">
                Each 500 m of line: how the 50 m strip either side usually follows the land 150 to 500 m away is fitted over the clear dates, season by season when there are enough, and a segment is flagged when it leaves that pattern on two clear dates in a row. A change that starts in the dry season (November to March) is changed. One that starts in the rainy season (April to October), when the greening alone can do it, waits for the next clear dry-season picture: still there, it is changed; gone, it is cleared. Only dates with {flags.minClearPercent}% of the strip clear of cloud count.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Work recorded recently, no visible change for 3 months or more</h3>
                {flags.lists.recordedNoChange.length ? (
                  <ul className="flex flex-col gap-2">
                    {flags.lists.recordedNoChange.map((s) => item(s, `no visible change for ${s.steadyMonths} months; ${s.disciplines.join(', ')} recorded up to ${s.latestRecordedMonth ? formatMonth(s.latestRecordedMonth.slice(0, 7)) : 'recently'}`))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-muted">None.</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Change where no work is recorded</h3>
                {flags.lists.changeNoRecord.length ? (
                  <ul className="flex flex-col gap-2">{flags.lists.changeNoRecord.map((s) => item(s, `${changeWords(s)}; no measured work or verified photo here`, s.status))}</ul>
                ) : (
                  <p className="text-sm text-ink-muted">None.</p>
                )}
              </div>
            </div>

            <p className="text-sm text-ink-muted">
              Method version {flags.methodVersion}, worked out {formatDate(flags.lastRun.ranAt)}, k = {flags.k}.{sens && ` At ${sens.changes.map((c) => `k = ${c.k}, ${c.segmentsChanged} segment${c.segmentsChanged === 1 ? '' : 's'}`).join(' and at ')} would read differently${sens.fragile ? ', so the result is fragile' : ''}.`} Of the {flags.agreement.segmentsWithEarthworksOrTrack} segments with recorded earthworks or track, {flags.agreement.ofThoseShowingChange} show a confirmed change; of the {flags.agreement.segmentsWithoutRecordedWork} with no recorded work, {noWork.no_change} show no change, {noWork.cleared} were cleared, {noWork.waiting} are waiting and {noWork.changed} show a confirmed change. Progress figures and payments never use these flags.
            </p>
          </>
        )}
      </div>
    </Section>
  );
}
