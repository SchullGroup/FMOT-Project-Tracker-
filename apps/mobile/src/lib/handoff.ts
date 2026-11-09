import type { Fix } from './capture';

/*
 * The photo the camera hands back to M6 Report incident: the camera is its own screen, so the incident screen picks the
 * shot up when it comes back into view. In memory only; nothing is kept if the app stops (the person takes it again).
 */
export type HandedPhoto = { photo: string; thumb: string; takenAt: Date; fix: Fix; heading: number | null; weak: boolean };

let pending: HandedPhoto | null = null;

export const incidentPhoto = {
  put: (shot: HandedPhoto) => void (pending = shot),
  take: (): HandedPhoto | null => {
    const shot = pending;
    pending = null;
    return shot;
  },
};
