/*
 * The sample lines: each project's real railway from OpenStreetMap (© OpenStreetMap contributors, ODbL 1.0), the
 * same lines the demo seed uses (sample-routes.json says where they come from). Lagos–Calabar is not in
 * OpenStreetMap and keeps its sketch in mock.ts. Helpers to place things along a line by their share of its length.
 */
import data from './sample-routes.json';

type Pt = [number, number];

export const ROUTES = data.routes as unknown as Partial<Record<string, Pt[]>>;

// Kaduna–Kano's length in the sample figures (mock-project.ts); its chainages are placed by their share of it.
export const KK_SKETCH_M = 203_000;

const rad = (d: number) => (d * Math.PI) / 180;

/** Metres between two [longitude, latitude] points (haversine). */
export function metres(a: Pt, b: Pt): number {
  const h = Math.sin(rad(b[1] - a[1]) / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(rad(b[0] - a[0]) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

function cumulative(line: Pt[]): number[] {
  const out = [0];
  for (let i = 1; i < line.length; i++) out.push(out[i - 1]! + metres(line[i - 1]!, line[i]!));
  return out;
}

/** The point at a share (0 to 1) of the line's length. */
export function pointAt(line: Pt[], share: number): Pt {
  const c = cumulative(line);
  const target = Math.min(1, Math.max(0, share)) * c[c.length - 1]!;
  const i = Math.max(1, c.findIndex((m) => m >= target));
  const [a, b] = [line[i - 1]!, line[i]!];
  const t = (target - c[i - 1]!) / (c[i]! - c[i - 1]! || 1);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** The stretch of the line between two shares of its length. */
export function sliceLine(line: Pt[], from: number, to: number): Pt[] {
  const c = cumulative(line);
  const total = c[c.length - 1]!;
  const inside = line.filter((_, i) => c[i]! > from * total && c[i]! < to * total);
  return [pointAt(line, from), ...inside, pointAt(line, to)];
}

/** The nearest point of any of the lines to a town, when one is within maxM metres. */
export function snapToLines(lines: Pt[][], town: Pt, maxM = 15_000): Pt | null {
  let best: Pt | null = null;
  let bestM = maxM;
  for (const line of lines) {
    for (const p of line) {
      const m = metres(p, town);
      if (m < bestM) [best, bestM] = [p, m];
    }
  }
  return best;
}
