import type { StripMap } from '@/lib/types';

/*
 * Progress along the line: one band per discipline, chainage across. Green
 * is complete, orange in progress, grey not started. Lot boundaries and the
 * track-laying front are marked. A text summary follows for screen readers.
 */
export function StripMapChart({ data }: { data: StripMap }) {
  const W = 1000;
  const LABEL = 130;
  const BAND = 26;
  const GAP = 12;
  const TOP = 24; // room for the track-laying front label
  const x = (m: number) => LABEL + (m / data.lengthM) * (W - LABEL - 30);
  const height = TOP + data.disciplines.length * (BAND + GAP) + 60;
  const km = data.lengthM / 1000;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * km));

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-labelledby="strip-desc">
        {data.lots.slice(1).map((l) => (
          <line key={l.name} x1={x(l.fromM)} x2={x(l.fromM)} y1={TOP} y2={height - 40} stroke="#8d99a8" strokeDasharray="4 4" />
        ))}
        {data.disciplines.map((d, i) => {
          const y = TOP + i * (BAND + GAP) + 6;
          return (
            <g key={d.code}>
              <text x={0} y={y + BAND / 2 + 6} fontSize="17" fill="#1b2430">
                {d.name}
              </text>
              <rect x={x(0)} y={y} width={x(data.lengthM) - x(0)} height={BAND} rx="4" fill="#dfe6f0" />
              {d.segments.map((s, j) => (
                <rect
                  key={j}
                  x={x(s.fromM)}
                  y={y}
                  width={Math.max(3, x(s.toM) - x(s.fromM))}
                  height={BAND}
                  fill={s.state === 'complete' ? '#2f7a3e' : '#c76f0a'}
                />
              ))}
            </g>
          );
        })}
        {data.trackFrontM !== null && (
          <g>
            <line x1={x(data.trackFrontM)} x2={x(data.trackFrontM)} y1={TOP - 4} y2={height - 52} stroke="#0b2545" strokeWidth="2" />
            <text x={x(data.trackFrontM)} y={TOP - 10} fontSize="14" textAnchor="middle" fill="#0b2545">
              Track-laying front, km {Math.round(data.trackFrontM / 1000)}
            </text>
          </g>
        )}
        <line x1={x(0)} x2={x(data.lengthM)} y1={height - 30} y2={height - 30} stroke="#4a5565" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t * 1000)} x2={x(t * 1000)} y1={height - 34} y2={height - 26} stroke="#4a5565" />
            <text x={x(t * 1000)} y={height - 8} fontSize="14" textAnchor={t === 0 ? 'start' : t === ticks[ticks.length - 1] ? 'end' : 'middle'} fill="#4a5565">
              km {t}
            </text>
          </g>
        ))}
        {data.lots.map((l) => (
          <text key={l.name} x={(x(l.fromM) + x(l.toM)) / 2} y={height - 44} fontSize="13" textAnchor="middle" fill="#4a5565">
            {l.name}
          </text>
        ))}
      </svg>
      <figcaption id="strip-desc" className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
        <span><span aria-hidden className="mr-2 inline-block size-3 rounded-sm bg-status-operational" />Complete</span>
        <span><span aria-hidden className="mr-2 inline-block size-3 rounded-sm bg-status-construction" />In progress</span>
        <span><span aria-hidden className="mr-2 inline-block size-3 rounded-sm bg-brand-100" />Not started</span>
        <span className="sr-only">
          {data.disciplines
            .map((d) => `${d.name}: ${Math.round(d.segments.filter((s) => s.state === 'complete').reduce((n, s) => n + s.toM - s.fromM, 0) / 1000)} km complete`)
            .join('. ')}
        </span>
      </figcaption>
    </figure>
  );
}
