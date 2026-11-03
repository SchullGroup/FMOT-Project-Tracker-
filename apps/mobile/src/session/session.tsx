import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { stringsFor, type Language, type Strings } from '@/i18n';
import { createApi, type Me } from '@/lib/api';
import { apiBaseUrl } from '@/lib/config';
import { prefsStore, secureStore } from '@/lib/storage';

/*
 * Who is using the app and how far they are: first run (welcome and permissions), signed out, locked (a session is
 * stored but the PIN or fingerprint has not opened the app yet), or open. Settings that are not secret live in SQLite;
 * the session itself only in secure storage (see lib/api.ts).
 */

export interface Prefs {
  language: Language;
  largeText: boolean;
  biometric: boolean;
  onboarded: boolean;
}

const DEFAULT_PREFS: Prefs = { language: 'en', largeText: false, biometric: false, onboarded: false };
const PREFS_KEY = 'fmot.prefs';

export type Status = 'starting' | 'welcome' | 'signedOut' | 'locked' | 'open';

/** The roles this app is for; anyone else is sent to the website. */
export const FIELD_ROLES = ['contractor_site_manager', 'consultant_resident_engineer'] as const;

// When a refresh fails in the middle of using the app, the provider sends the person back to sign-in.
let onSignedOut: (() => void) | null = null;
export const api = createApi({ baseUrl: () => apiBaseUrl(), store: secureStore, onSignedOut: () => onSignedOut?.() });

interface Session {
  status: Status;
  prefs: Prefs;
  strings: Strings;
  me: Me | null;
  savedPhone: string | null;
  setPrefs: (change: Partial<Prefs>) => Promise<void>;
  /** After any successful sign-in or unlock: load /me and open the app (offering the fingerprint after a new PIN). */
  opened: (offerBiometric?: boolean) => Promise<void>;
  offerBiometric: boolean;
  clearBiometricOffer: () => void;
  signOut: () => Promise<void>;
  biometricAvailable: () => Promise<boolean>;
  checkBiometric: (prompt: string) => Promise<boolean>;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('starting');
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [me, setMe] = useState<Me | null>(null);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [offerBiometric, setOfferBiometric] = useState(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  useEffect(() => {
    onSignedOut = () => {
      setMe(null);
      setStatus('signedOut');
    };
    return () => {
      onSignedOut = null;
    };
  }, []);

  useEffect(() => {
    void (async () => {
      let loaded = DEFAULT_PREFS;
      try {
        const raw = await prefsStore.get(PREFS_KEY);
        if (raw) loaded = { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) };
      } catch {
        /* first run, or unreadable: start from the defaults */
      }
      setPrefsState(loaded);
      setSavedPhone(await api.savedPhone());
      if (!loaded.onboarded) setStatus('welcome');
      else setStatus((await api.hasSession()) ? 'locked' : 'signedOut');
    })();
  }, []);

  const setPrefs = useCallback(async (change: Partial<Prefs>) => {
    const next = { ...prefsRef.current, ...change };
    setPrefsState(next);
    await prefsStore.set(PREFS_KEY, JSON.stringify(next));
    if (change.onboarded && status === 'welcome') setStatus((await api.hasSession()) ? 'locked' : 'signedOut');
  }, [status]);

  const opened = useCallback(async (offer = false) => {
    const who = await api.me();
    setMe(who);
    setSavedPhone(who.user.phone);
    setOfferBiometric(offer && !prefsRef.current.biometric);
    setStatus('open');
  }, []);
  const clearBiometricOffer = useCallback(() => setOfferBiometric(false), []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setMe(null);
    // The fingerprint shortcut opened this session only; the next person signs in with a code and a PIN.
    await setPrefs({ biometric: false });
    setStatus('signedOut');
  }, [setPrefs]);

  const biometricAvailable = useCallback(async () => (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync()), []);
  const checkBiometric = useCallback(async (prompt: string) => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: prompt, cancelLabel: stringsFor(prefsRef.current.language).common.cancel, disableDeviceFallback: false });
    return result.success;
  }, []);

  const value = useMemo<Session>(
    () => ({ status, prefs, strings: stringsFor(prefs.language), me, savedPhone, setPrefs, opened, offerBiometric, clearBiometricOffer, signOut, biometricAvailable, checkBiometric }),
    [status, prefs, me, savedPhone, setPrefs, opened, offerBiometric, clearBiometricOffer, signOut, biometricAvailable, checkBiometric],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error('useSession outside SessionProvider');
  return s;
}

/** The strings in the person's language. */
export const useStrings = () => useSession().strings;
