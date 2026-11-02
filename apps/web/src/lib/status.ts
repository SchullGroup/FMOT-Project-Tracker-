import type { Health, ProjectStatus } from './types';

/*
 * The five map categories from the design system. One colour per category,
 * used identically on the map, the legend, cards and the gate strip.
 */
export type MapCategory = 'operational' | 'construction' | 'planned' | 'stalled' | 'draft';

export const CATEGORY_COLOUR: Record<MapCategory, string> = {
  operational: '#2f7a3e',
  construction: '#c76f0a',
  planned: '#6b7280',
  stalled: '#b00020',
  draft: '#8a939e',
};

export const CATEGORY_LABEL: Record<MapCategory, string> = {
  operational: 'Operational',
  construction: 'Under construction',
  planned: 'Planned',
  stalled: 'Stalled',
  draft: 'Draft',
};

export function categoryOf(status: ProjectStatus, health: Health | null): MapCategory {
  if (status === 'draft') return 'draft';
  if (status === 'stalled' || health === 'stalled') return 'stalled';
  if (status === 'under_construction') return 'construction';
  if (status === 'commissioned' || status === 'operational' || status === 'closed') return 'operational';
  return 'planned';
}

export const HEALTH_LABEL: Record<Health, string> = {
  on_track: 'On track',
  behind: 'Behind',
  stalled: 'Stalled',
};

export function formatKm(metres: number | null): string {
  if (metres === null) return 'Length not set';
  return `${Math.round(metres / 1000).toLocaleString('en-NG')} km`;
}

export function formatAge(iso: string): string {
  const hours = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/** +2348030000000 shown as 0803 000 0000 */
export function formatPhone(e164: string): string {
  const local = e164.startsWith('+234') ? `0${e164.slice(4)}` : e164;
  return local.replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3');
}
