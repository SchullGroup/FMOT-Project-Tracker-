/** "+2348031234567" as people write it: "08031234567". */
export const localNumber = (e164: string) => (e164.startsWith('+234') ? `0${e164.slice(4)}` : e164);

/**
 * What the person entered from the invite text message: the short code (ABCD-2345, typed in any case, with or without
 * the hyphen or spaces), or the long code from a pasted link (the part after /invite/).
 */
export function inviteToken(text: string): string {
  const t = text.trim();
  const link = /\/invite\/([A-Za-z0-9._~-]+)/.exec(t)?.[1];
  if (link) return link;
  const short = t.toUpperCase().replace(/[\s-]/g, '');
  if (/^[A-HJ-NP-Z2-9]{8}$/.test(short)) return `${short.slice(0, 4)}-${short.slice(4)}`;
  return t.replace(/[^A-Za-z0-9._~-]/g, '');
}

/** 142300 -> "km 142+300", the way engineers write chainage. */
export const formatChainage = (m: number) => `km ${Math.floor(m / 1000)}+${String(Math.round(m % 1000)).padStart(3, '0')}`;

/** "10:47" in the phone's time. */
export const formatTime = (iso: string | Date) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Morning before 12, afternoon before 5 pm, evening after. */
export const partOfDay = (d = new Date()): 'morning' | 'afternoon' | 'evening' => (d.getHours() < 12 ? 'morning' : d.getHours() < 17 ? 'afternoon' : 'evening');

/** "Lot 1, Lot 2 and Lot 3"; "Lots 1 to 3" (or "Lots 1 and 2") when they are numbered in a run. */
export function lotsLabel(names: string[]): string {
  const nums = names.map((n) => /^Lot (\d+)$/.exec(n)?.[1]).map(Number);
  if (names.length > 1 && nums.every((n, i) => n > 0 && (i === 0 || n === nums[i - 1]! + 1))) return `Lots ${nums[0]} ${names.length === 2 ? 'and' : 'to'} ${nums[nums.length - 1]}`;
  return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** The name in a greeting: a title keeps the surname ("Engr. T. Adeyemi" -> "Engr. Adeyemi"), others the first name. */
export function greetingName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (/^(Engr|Mr|Mrs|Ms|Dr|Barr|Arc|Prof|Hon)\.?$/i.test(parts[0] ?? '') && parts.length > 1) return `${parts[0]} ${parts[parts.length - 1]}`;
  return parts[0] ?? '';
}
