import type { KeyStore } from './storage';

/*
 * The API client for the phone. It is the mobile half of the API's sign-in (apps/api/src/auth):
 * - every request says X-Client: mobile, so sign-in and refresh return the refresh token in the body instead of a
 *   cookie; the token is kept only in secure storage, the access token (15 minutes) only in memory;
 * - a stable device id, made once and kept in secure storage, so the API binds this phone to the person;
 * - a 401 that means the session ended is refreshed once (one refresh shared by every request waiting on it) and the
 *   request retried; when the refresh fails the session is forgotten and the app goes back to sign-in. A 401 that
 *   means something else (a wrong PIN or code) is shown as it is, never retried: a retry would count the same wrong
 *   PIN twice towards the lock.
 * Nothing here imports Expo, so the unit tests run it with an in-memory store and a fake fetch.
 */

export const KEYS = { refresh: 'fmot.refresh', device: 'fmot.device', phone: 'fmot.phone' } as const;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** The session has ended and could not be renewed: sign in again. */
export class SignedOutError extends Error {
  constructor() {
    super('Signed out');
  }
}

/** Could not reach the API at all (no signal, wrong address, API not running). */
export class OfflineError extends Error {}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface Me {
  user: { id: string; name: string; phone: string };
  organisation: { id: string; name: string; type: string };
  role: { code: string; name: string };
  permissions: string[];
}

export type CodeChannel = 'sms' | 'email';

/** Who the invite is for, and every way the code can go (masked), the person's code channel first. */
export interface InvitePreview {
  name: string;
  role: string;
  organisation: string;
  phoneMasked: string;
  codeChannel?: CodeChannel;
  codeSentTo?: string;
  channels?: { channel: CodeChannel; sentTo: string }[];
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Sign-in calls: no access token, and a 401 is an answer, not an ended session. */
  signIn?: boolean;
}

// A random id for this install; not a secret, only stable.
function newDeviceId(random: () => number): string {
  const hex = Array.from({ length: 32 }, () => Math.floor(random() * 16).toString(16)).join('');
  return `mobile-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** This phone's id, made on first use and kept in secure storage, so it survives restarts. */
export async function getDeviceId(store: KeyStore, random: () => number = Math.random): Promise<string> {
  const saved = await store.get(KEYS.device);
  if (saved) return saved;
  const id = newDeviceId(random);
  await store.set(KEYS.device, id);
  return id;
}

export function createApi(deps: {
  baseUrl: () => string;
  store: KeyStore;
  fetch?: typeof fetch;
  /** For multipart uploads with files (expo/fetch on the phone, whose FormData takes expo-file-system files). */
  uploadFetch?: (url: string, init: { method: string; headers: Record<string, string>; body: FormData }) => Promise<Response>;
  onSignedOut?: () => void;
  random?: () => number;
}) {
  const doFetch = deps.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  let accessToken: string | null = null;
  let refreshing: Promise<boolean> | null = null;

  async function raw(path: string, opts: RequestOptions): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/json', 'X-Client': 'mobile' };
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken && !opts.signIn) headers.Authorization = `Bearer ${accessToken}`;
    try {
      return await doFetch(`${deps.baseUrl()}${path}`, {
        method: opts.method ?? 'GET',
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      });
    } catch {
      throw new OfflineError('Could not reach the tracker');
    }
  }

  async function toError(res: Response): Promise<ApiError> {
    let code = `http_${res.status}`;
    let message = res.statusText;
    try {
      const data = (await res.json()) as { code?: string; message?: string | string[] };
      code = data.code ?? code;
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message);
    } catch {
      /* not JSON */
    }
    return new ApiError(res.status, code, message);
  }

  // Only an ended session is refreshed: code "unauthorized", or a bare 401.
  async function sessionEnded(res: Response): Promise<boolean> {
    if (res.status !== 401) return false;
    const { code } = await toError(res.clone());
    return code === 'unauthorized' || code === 'http_401';
  }

  async function keep(tokens: Tokens) {
    accessToken = tokens.accessToken;
    await deps.store.set(KEYS.refresh, tokens.refreshToken);
  }

  /** Forget the session on this phone (the device id and phone number stay). */
  async function forget() {
    accessToken = null;
    await deps.store.remove(KEYS.refresh);
  }

  /** A new access token from the stored refresh token; the refresh token is rotated on every use. */
  function refresh(): Promise<boolean> {
    refreshing ??= (async () => {
      try {
        const refreshToken = await deps.store.get(KEYS.refresh);
        if (!refreshToken) return false;
        const res = await raw('/auth/refresh', { method: 'POST', body: { refreshToken }, signIn: true });
        if (!res.ok) return false;
        await keep((await res.json()) as Tokens);
        return true;
      } catch (error) {
        if (error instanceof OfflineError) throw error;
        return false;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  }

  async function signedOut(): Promise<never> {
    await forget();
    deps.onSignedOut?.();
    throw new SignedOutError();
  }

  async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    let res = await raw(path, opts);
    if (!opts.signIn && (await sessionEnded(res))) {
      if (!(await refresh())) return signedOut();
      res = await raw(path, opts);
      if (await sessionEnded(res)) return signedOut();
    }
    if (!res.ok) throw await toError(res);
    if (res.status === 204 || res.status === 202) return undefined as T;
    return (await res.json()) as T;
  }

  /*
   * A multipart upload (a field submission). The body is made fresh for each try, since a sent FormData cannot be
   * sent again. An ended session is refreshed once, as for any request; the caller decides what a failure means.
   */
  async function upload(path: string, makeBody: () => FormData): Promise<Response> {
    const send = () => {
      const headers: Record<string, string> = { Accept: 'application/json', 'X-Client': 'mobile' };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const init = { method: 'POST', headers, body: makeBody() };
      return deps.uploadFetch ? deps.uploadFetch(`${deps.baseUrl()}${path}`, init) : doFetch(`${deps.baseUrl()}${path}`, init);
    };
    let res: Response;
    try {
      res = await send();
      if (await sessionEnded(res)) {
        if (!(await refresh())) return signedOut();
        res = await send();
        if (await sessionEnded(res)) return signedOut();
      }
    } catch (error) {
      if (error instanceof SignedOutError) throw error;
      throw new OfflineError((error as Error).message || 'Could not reach the tracker');
    }
    return res;
  }

  const device = () => getDeviceId(deps.store, deps.random);
  // Keeps what the person signed in with (phone number or email address) for opening the app later with the PIN.
  const signedIn = async (tokens: Tokens, login: string) => {
    await keep(tokens);
    await deps.store.set(KEYS.phone, login);
  };

  return {
    request,
    upload,
    errorOf: toError,
    deviceId: device,
    /** True when this phone holds a session (it may still need the PIN or fingerprint to open). */
    hasSession: async () => (await deps.store.get(KEYS.refresh)) !== null,
    savedPhone: () => deps.store.get(KEYS.phone),

    /**
     * Step 1 of sign-in: the API sends a code to `login`, a phone number (by text) or an email address (the same
     * answer whether or not it belongs to an account).
     */
    requestCode: (login: string) => request<void>('/auth/otp/request', { method: 'POST', body: { login }, signIn: true }),
    /** Step 2: the code gives a 10-minute ticket for this phone, and says whether the person has a PIN yet. */
    verifyCode: async (login: string, code: string) =>
      request<{ ticket: string; hasPin: boolean }>('/auth/otp/verify', { method: 'POST', body: { login, code, deviceId: await device() }, signIn: true }),
    /** Step 3a: first PIN (or a new one after a reset). */
    setPin: async (login: string, ticket: string, pin: string) => {
      await signedIn(await request<Tokens>('/auth/pin/set', { method: 'POST', body: { login, ticket, pin, deviceId: await device() }, signIn: true }), login);
    },
    /** Step 3b, or opening the app later: the PIN (with the ticket on a phone not yet bound). */
    pinLogin: async (login: string, pin: string, ticket?: string) => {
      await signedIn(await request<Tokens>('/auth/pin/login', { method: 'POST', body: { login, pin, deviceId: await device(), ...(ticket ? { ticket } : {}) }, signIn: true }), login);
    },
    /** Opening the app with the fingerprint instead of the PIN: renew the stored session. */
    resume: refresh,

    invitePreview: (token: string) =>
      request<InvitePreview>(`/invites/${encodeURIComponent(token)}`, { signIn: true }),
    /** The code goes where the person picked (`channel`), else by their code channel. */
    inviteCode: (token: string, channel?: CodeChannel) => request<void>('/invites/code', { method: 'POST', body: { token, channel }, signIn: true }),
    /** The invite only shows a masked number, so the phone number for later PIN sign-ins comes from /me. */
    acceptInvite: async (token: string, code: string, pin: string, channel?: CodeChannel) => {
      await keep(await request<Tokens>('/invites/accept', { method: 'POST', body: { token, code, pin, deviceId: await device(), channel }, signIn: true }));
      const me = await request<Me>('/me');
      await deps.store.set(KEYS.phone, me.user.phone);
    },

    me: () => request<Me>('/me'),

    /** Ends the session on the API (revoking its refresh tokens) and on this phone. */
    signOut: async () => {
      const refreshToken = await deps.store.get(KEYS.refresh);
      try {
        if (refreshToken) await raw('/auth/logout', { method: 'POST', body: { refreshToken }, signIn: true });
      } catch {
        /* offline: the phone forgets it anyway, and the token expires */
      }
      await forget();
    },
    forget,
  };
}

export type Api = ReturnType<typeof createApi>;
