import type { MapCategory } from '@/lib/status';
import { CATEGORY_COLOUR } from '@/lib/status';

/**
 * The picture on a project card when there is no site photo yet (a draft, or a line not yet built): the route itself,
 * drawn in its status colour with its end towns and its length, in the space the photo would take.
 */
export function CorridorSketch({ line, name, category, lengthLabel }: { line: [number, number][]; name: string; category: MapCategory; lengthLabel: string }) {
  const W = 320;
  const H = 180;
  const PAD = 28;
  // Longitude scaled by the cosine of the latitude, so the shape is not stretched sideways.
  const midLat = line.reduce((s, [, lat]) => s + lat, 0) / Math.max(line.length, 1);
  const k = Math.cos((midLat * Math.PI) / 180);
  const xs = line.map(([lon]) => lon * k);
  const ys = line.map(([, lat]) => lat);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((W - 2 * PAD) / Math.max(maxX - minX, 1e-6), (H - 2 * PAD) / Math.max(maxY - minY, 1e-6));
  const offX = (W - (maxX - minX) * scale) / 2;
  const offY = (H - (maxY - minY) * scale) / 2;
  const pts = line.map(([lon, lat]) => [offX + (lon * k - minX) * scale, H - (offY + (lat - minY) * scale)] as const);
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  // "Kano–Katsina–Maradi SGR": the first and last towns of the name.
  const towns = name.replace(/\s+(SGR|rehabilitation|coastal line|line)\b.*$/i, '').split('–').map((t) => t.trim()).filter(Boolean);
  const colour = CATEGORY_COLOUR[category];
  const [start, end] = [pts[0], pts[pts.length - 1]];
  const label = (p: readonly [number, number] | undefined, text: string | undefined) =>
    p && text ? (
      <text x={Math.min(Math.max(p[0], 40), W - 40)} y={p[1] < 30 ? p[1] + 18 : p[1] - 10} textAnchor="middle" className="fill-ink" style={{ fontSize: 12, fontWeight: 600 }}>
        {text}
      </text>
    ) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Route of ${name}, ${lengthLabel}`} className="aspect-video w-full rounded-md bg-brand-50">
      {line.length > 1 && (
        <>
          <path d={path} fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <path d={path} fill="none" stroke={colour} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={category === 'draft' ? '10 7' : undefined} />
          {[start, end].map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r={6} fill="#ffffff" stroke={colour} strokeWidth={3} />)}
          {label(start, towns[0])}
          {towns.length > 1 && label(end, towns[towns.length - 1])}
        </>
      )}
      <text x={W - 10} y={H - 10} textAnchor="end" className="fill-ink-muted" style={{ fontSize: 12 }}>
        {lengthLabel}
      </text>
    </svg>
  );
}
