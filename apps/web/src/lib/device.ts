/*
 * A stable id for this browser, sent with sign-in so the API can bind the
 * device. Kept in localStorage; clearing site data makes it a new device,
 * which then needs the SMS code again.
 */
const DEVICE_KEY = 'fmot.deviceId';
const KNOWN_PHONE_KEY = 'fmot.knownPhone';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

/** The phone that last signed in on this device, so we can offer the PIN directly. */
export function getKnownPhone(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KNOWN_PHONE_KEY);
}

export function setKnownPhone(phone: string | null): void {
  if (phone) window.localStorage.setItem(KNOWN_PHONE_KEY, phone);
  else window.localStorage.removeItem(KNOWN_PHONE_KEY);
}
