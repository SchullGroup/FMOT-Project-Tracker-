import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { LucideIcon } from 'lucide-react-native';
import { Flag, Layers, MapPin, Signpost, TrainFront, Wrench } from 'lucide-react-native';

/* What the capture screen needs besides the camera: the six what-is-this tiles, the location rule, and resizing. */

/** The tiles on the M3 board, each a discipline code the API knows. */
export const TILES: Array<{ code: string; icon: LucideIcon }> = [
  { code: 'earthworks', icon: Layers },
  { code: 'structures', icon: Signpost },
  { code: 'track', icon: TrainFront },
  { code: 'stations', icon: MapPin },
  { code: 'equipment', icon: Wrench },
  { code: 'other', icon: Flag },
];

/** A good enough fix: 25 m or better. After 60 seconds without one, the photo may be taken and is marked weak. */
export const GOOD_FIX_M = 25;
export const WEAK_AFTER_MS = 60_000;

export function shutterState(accuracyM: number | null, waitedMs: number): 'waiting' | 'locked' | 'weak' {
  if (accuracyM !== null && accuracyM <= GOOD_FIX_M) return 'locked';
  return waitedMs >= WEAK_AFTER_MS ? 'weak' : 'waiting';
}

/** 0 to 360 degrees as N, NE, E ... (the board's "heading NE"). */
export const compass = (deg: number) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round((((deg % 360) + 360) % 360) / 45) % 8]!;

/** A version 4 UUID for the client id (the API refuses anything else). Not a secret: it only has to be unique. */
export function uuid(random: () => number = Math.random): string {
  const h = Array.from({ length: 32 }, () => Math.floor(random() * 16));
  h[12] = 4;
  h[16] = (h[16]! & 0x3) | 0x8;
  const s = h.map((n) => n.toString(16)).join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** "2026-11-03T10:52:07+01:00": the phone's time with its offset, as the API asks. */
export function localIso(d: Date): string {
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const offset = -d.getTimezoneOffset();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset >= 0 ? '+' : '-'}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`;
}

/**
 * The photo as it is kept and sent: 2048 px on its long side (never enlarged), JPEG quality 0.8; and a 400 px
 * thumbnail for the outbox.
 */
export async function shrink(uri: string, width: number, height: number) {
  const longSide = (size: number) => {
    const ctx = ImageManipulator.manipulate(uri);
    // Both sides given, worked out here: the web build does not compute the missing one.
    const scale = width && height ? size / Math.max(width, height) : 1;
    if (scale < 1) ctx.resize({ width: Math.round(width * scale), height: Math.round(height * scale) });
    return ctx.renderAsync();
  };
  const photo = await (await longSide(2048)).saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
  const thumb = await (await longSide(400)).saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return { photo: photo.uri, thumb: thumb.uri, width: photo.width, height: photo.height };
}
