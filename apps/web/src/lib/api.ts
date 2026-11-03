/*
 * The one HTTP client. The access token lives only in memory; the refresh
 * token is an httpOnly cookie the browser sends to /api/auth/refresh. On a
 * 401 the client refreshes once and retries; if that fails it throws
 * SignedOutError and the app sends the person to the sign-in screen.
 */
import { mockFetch, mockUpload } from './mock';

export const MOCK = process.env.NEXT_PUBLIC_API_MOCK === '1';

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export class SignedOutError extends Error {
  constructor() {
    super('signed_out');
  }
}

/** An API error with the server's machine code (for example "pin_incorrect"). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** A single-use PIN confirmation token from POST /auth/pin/confirm. */
  pinConfirmation?: string;
  /** Skip the refresh-and-retry dance (used by the sign-in calls themselves). */
  noRefresh?: boolean;
}

async function rawFetch(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (opts.pinConfirmation) headers['X-Pin-Confirmation'] = opts.pinConfirmation;

  const init: RequestInit = {
    method: opts.method ?? 'GET',
    headers,
    credentials: 'include',
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  };
  return MOCK ? mockFetch(path, init) : fetch(`/api${path}`, init);
}

/** Exchange the refresh cookie for a new access token. Shared by concurrent callers. */
export async function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await rawFetch('/auth/refresh', { method: 'POST', noRefresh: true });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string };
      setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      queueMicrotask(() => {
        refreshing = null;
      });
    }
  })();
  return refreshing;
}

async function toApiError(res: Response): Promise<ApiError> {
  let code = `http_${res.status}`;
  let message = res.statusText;
  try {
    const data = (await res.json()) as { code?: string; error?: string; message?: string | string[] };
    code = data.code ?? data.error ?? code;
    message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message);
  } catch {
    /* body was not JSON */
  }
  return new ApiError(res.status, code, message);
}

// A 401 is an ended session only when its code says so; a wrong PIN or code is a 401 too, and retrying it after a
// refresh would count the same wrong PIN twice towards the lock.
async function sessionEnded(res: Response): Promise<boolean> {
  if (res.status !== 401) return false;
  const { code } = await toApiError(res.clone());
  return code === 'unauthorized' || code === 'http_401';
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await rawFetch(path, opts);

  if (!opts.noRefresh && (await sessionEnded(res))) {
    const ok = await refreshSession();
    if (!ok) throw new SignedOutError();
    res = await rawFetch(path, opts);
    if (res.status === 401) throw new SignedOutError();
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Multipart upload (documents, alignment files). Fields go first, the file
 * last, so the API can stream it. Uses the same refresh-and-retry rule.
 */
export async function upload<T>(path: string, fields: Record<string, string>, file: File): Promise<T> {
  if (MOCK) return mockUpload(path, fields, file) as Promise<T>;
  const send = () => {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    form.append('file', file, file.name);
    return fetch(`/api${path}`, {
      method: 'POST',
      body: form,
      credentials: 'include',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
  };
  let res = await send();
  if (await sessionEnded(res)) {
    if (!(await refreshSession())) throw new SignedOutError();
    res = await send();
  }
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}
