import { CATEGORY_COLOUR, CATEGORY_LABEL, type MapCategory } from '@/lib/status';

/** The map key, as in the design. Filtering is done with the chips above the map. */
export function Legend({ categories }: { categories: MapCategory[] }) {
  return (
    <div className="rounded-md bg-surface/95 p-3 shadow-sm ring-1 ring-line">
      <p className="px-1 pb-1 font-semibold">Legend</p>
      <ul>
        {categories.map((c) => (
          <li key={c} className="flex min-h-8 items-center gap-3 px-1">
            <svg aria-hidden width="28" height="8" className="shrink-0">
              <line x1="2" y1="4" x2="26" y2="4" stroke={CATEGORY_COLOUR[c]} strokeWidth="5" strokeLinecap="round" strokeDasharray={c === 'draft' ? '5 4' : undefined} />
            </svg>
            {CATEGORY_LABEL[c]}
          </li>
        ))}
      </ul>
    </div>
  );
}
