/* Money arrives in kobo (the API never sends floats); it may come as a string for bigints. */
export function formatNaira(kobo: number | string | null | undefined, opts: { compact?: boolean } = {}): string {
  if (kobo === null || kobo === undefined) return '–';
  const naira = Number(kobo) / 100;
  if (opts.compact) {
    if (Math.abs(naira) >= 1e12) return `₦${(Math.round((naira / 1e12) * 100) / 100).toLocaleString('en-NG')}tn`;
    if (Math.abs(naira) >= 1e9) return `₦${trim(naira / 1e9)}bn`;
    if (Math.abs(naira) >= 1e6) return `₦${trim(naira / 1e6)}m`;
  }
  return `₦${naira.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}
const trim = (n: number) => (Math.round(n * 10) / 10).toLocaleString('en-NG');

/** The exact amount, to the kobo, for anything someone claims, approves or pays. Worked in bigint, so nothing rounds. */
export function formatNairaExact(kobo: number | string | bigint | null | undefined): string {
  if (kobo === null || kobo === undefined || kobo === '') return '–';
  const k = BigInt(kobo);
  const abs = k < 0n ? -k : k;
  return `${k < 0n ? '−' : ''}₦${(abs / 100n).toLocaleString('en-NG')}.${String(abs % 100n).padStart(2, '0')}`;
}

/** "2,400,000,000.5" typed in naira -> "240000000050" kobo, exactly; null when it is not an amount. */
export function nairaToKobo(input: string): string | null {
  const m = /^(\d{1,16})(?:\.(\d{0,2}))?$/.exec(input.replace(/[,\s₦]/g, ''));
  if (!m) return null;
  const kobo = BigInt(m[1]!) * 100n + BigInt((m[2] ?? '').padEnd(2, '0'));
  return kobo.toString();
}

/** A state as the API sends it ("akwa_ibom", "fct") -> its name ("Akwa Ibom", "FCT"). */
export const stateName = (code: string) => (code === 'fct' ? 'FCT' : code.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

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

/**
 * A role name inside a sentence: titles keep their capitals ("the Permanent
 * Secretary", "the Director, rail", "the NRC project engineer"); ordinary
 * roles are lower-cased ("the resident engineer", "the finance officer").
 */
export function roleInSentence(role: string): string {
  return /^(Permanent Secretary|Director|Minister|NRC|IT administrator)/.test(role) ? role : lowerFirst(role);
}
