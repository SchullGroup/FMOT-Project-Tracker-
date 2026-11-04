import { ApiError, OfflineError } from '@/lib/api';
import { en, type Strings } from './en';

export type Language = 'en' | 'ha' | 'yo' | 'ig';

/** The language choices, in their own words. Only English has its strings file so far. */
export const LANGUAGES: Array<{ code: Language; name: string; ready: boolean }> = [
  { code: 'en', name: 'English', ready: true },
  { code: 'ha', name: 'Hausa', ready: false },
  { code: 'yo', name: 'Yorùbá', ready: false },
  { code: 'ig', name: 'Igbo', ready: false },
];

// Add ha, yo and ig here as their files arrive; anything missing in them falls back to English.
const FILES: Partial<Record<Language, Strings>> = { en };

export const stringsFor = (language: Language): Strings => FILES[language] ?? en;

/** A plain sentence for any error from the API client. */
export function errorText(s: Strings, error: unknown): string {
  if (error instanceof OfflineError) return s.errors.offline;
  if (error instanceof ApiError) {
    if (error.status === 429) return s.errors.too_many_requests;
    // A 5xx without the API's JSON body (code http_5xx) came from something in front of it: the API did not answer.
    if (/^http_5\d\d$/.test(error.code)) return s.errors.offline;
    const known = (s.errors as Record<string, string>)[error.code];
    if (known) return known;
    return error.status < 500 && error.message ? error.message : s.errors.generic;
  }
  return s.errors.generic;
}

export type { Strings };
