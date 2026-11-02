import { CATEGORY_COLOUR, CATEGORY_LABEL, type MapCategory } from '@/lib/status';

/*
 * Legend doubling as the status filter: each row toggles that category on
 * the map. Drafts only exist for people who can see them.
 */
export function Legend(props: {
  categories: MapCategory[];
  visible: Set<MapCategory>;
  counts: Record<MapCategory, number>;
  onToggle: (c: MapCategory) => void;
}) {
  return (
    <fieldset className="rounded-md bg-surface/95 p-3 shadow-sm ring-1 ring-line">
      <legend className="sr-only">Show projects by status</legend>
      <p aria-hidden className="px-2 pb-1 text-sm font-semibold text-ink-muted">
        Show on map
      </p>
      {props.categories.map((c) => (
        <label key={c} className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-2 hover:bg-brand-50">
          <input
            type="checkbox"
            className="size-5 accent-brand-900"
            checked={props.visible.has(c)}
            onChange={() => props.onToggle(c)}
          />
          <svg aria-hidden width="28" height="8" className="shrink-0">
            <line
              x1="2"
              y1="4"
              x2="26"
              y2="4"
              stroke={CATEGORY_COLOUR[c]}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={c === 'draft' ? '5 4' : undefined}
            />
          </svg>
          <span className="flex-1">{CATEGORY_LABEL[c]}</span>
          <span className="tabular text-sm text-ink-muted">{props.counts[c]}</span>
        </label>
      ))}
    </fieldset>
  );
}
