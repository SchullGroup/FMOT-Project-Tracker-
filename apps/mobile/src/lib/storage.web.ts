import type { KeyStore } from './storage';

export type { KeyStore } from './storage';

/*
 * The web build exists only to take screenshots of the screens at phone sizes on a computer; it is never given to
 * anyone. Browsers have no keychain, so it keeps everything in this tab's session storage, gone when the tab closes.
 */
const session: KeyStore = {
  get: async (key) => sessionStorage.getItem(key),
  set: async (key, value) => sessionStorage.setItem(key, value),
  remove: async (key) => sessionStorage.removeItem(key),
};

export const secureStore = session;
export const prefsStore = session;
