/* Money arrives in kobo (the API never sends floats); it may come as a string for bigints. */
export function formatNaira(kobo: number | string | null | undefined, opts: { compact?: boolean } = {}): string {
  if (kobo === null || kobo === undefined) return '–';
  const naira = Number(kobo) / 100;
  if (opts.compact) {
    if (Math.abs(naira) >= 1e9) return `₦${trim(naira / 1e9)}bn`;
    if (Math.abs(naira) >= 1e6) return `₦${trim(naira / 1e6)}m`;
  }
  return `₦${naira.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}
const trim = (n: number) => (Math.round(n * 10) / 10).toLocaleString('en-NG');

/** 142300 -> "km 142+300", the way engineers write chainage. */
export function formatChainage(m: number | null | undefined): string {
  if (m === null || m === undefined) return '–';
  const km = Math.floor(m / 1000);
  const rest = Math.round(m % 1000);
  return `km ${km}+${String(rest).padStart(3, '0')}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "2026-09" -> "Sep 2026" */
export function formatMonth(ym: string): string {
  const [y, mo] = ym.split('-').map(Number);
  return new Date(y!, (mo ?? 1) - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/**
 * Lower-case the first letter for use mid-sentence ("gate 6, right-of-way"),
 * but leave abbreviations alone ("BPP no objection", "FEC award").
 */
export const lowerFirst = (t: string) => (/^[A-Z]{2}/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
