import * as SecureStore from 'expo-secure-store';
import Storage from 'expo-sqlite/kv-store';

/** A small string store. The API client takes one, so tests can pass an in-memory store. */
export interface KeyStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/*
 * Secrets (the refresh token, the device id, the phone number) live only in the phone's keychain or keystore. Keys
 * may hold letters, digits, ".", "-" and "_".
 */
export const secureStore: KeyStore = {
  get: (key) => SecureStore.getItemAsync(key),
  set: (key, value) => SecureStore.setItemAsync(key, value),
  remove: (key) => SecureStore.deleteItemAsync(key),
};

/** Settings that are not secret (language, Large text, fingerprint on or off), in SQLite on the phone. */
export const prefsStore: KeyStore = {
  get: (key) => Storage.getItem(key),
  set: (key, value) => Storage.setItem(key, value),
  remove: (key) => Storage.removeItem(key),
};
