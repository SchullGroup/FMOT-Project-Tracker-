import { dayCount, lowerFirst } from '@/lib/format';
import type { GateRow } from '@/lib/types';

const FILL: Record<GateRow['status'], string> = {
  passed: 'bg-status-operational text-white border-status-operational',
  in_progress: 'bg-surface text-status-construction border-status-construction border-[3px]',
  awaiting_confirmation: 'bg-surface text-brand-800 border-brand-800 border-[3px]',
  blocked: 'bg-status-stalled text-white border-status-stalled',
  not_started: 'bg-surface text-ink-muted border-line-strong',
};

/** The 15 gates in a row: passed, current, blocked, not started. */
export function GateStrip({ gates }: { gates: GateRow[] }) {
  const current = gates.find((g) => g.status !== 'passed');
  return (
    <div>
      <ol className="flex flex-wrap gap-1.5" aria-label="Gates">
        {gates.map((g) => (
          <li key={g.no}>
            <span
              title={`Gate ${g.no}: ${g.name}`}
              aria-label={`Gate ${g.no}, ${g.name}: ${g.status.replace(/_/g, ' ')}`}
              className={`tabular grid size-10 place-items-center rounded-md border-2 text-base font-semibold ${FILL[g.status]}`}
            >
              {g.no}
            </span>
          </li>
        ))}
      </ol>
      {current && (
        <p className="mt-3 text-base">
          Now at gate {current.no}, {lowerFirst(current.name)}
          {current.daysWaiting !== null && <span className="text-ink-muted">, {dayCount(current.daysWaiting)}</span>}
        </p>
      )}
    </div>
  );
}
