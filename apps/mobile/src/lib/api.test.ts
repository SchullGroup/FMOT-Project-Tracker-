import { ApiError, createApi, getDeviceId, KEYS, SignedOutError } from './api';
import type { KeyStore } from './storage';

const memoryStore = (initial: Record<string, string> = {}): KeyStore & { data: Record<string, string> } => {
  const data = { ...initial };
  return {
    data,
    get: async (k) => data[k] ?? null,
    set: async (k, v) => {
      data[k] = v;
    },
    remove: async (k) => {
      delete data[k];
    },
  };
};

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// A fake API: each call is answered by the next handler; every request is recorded.
function fakeFetch(...answers: Array<(url: string, init: RequestInit) => Response>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fn = jest.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const answer = answers.shift();
    if (!answer) throw new Error(`Unexpected request ${url}`);
    return answer(url, init);
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

const header = (init: RequestInit, name: string) => (init.headers as Record<string, string>)[name];

describe('the API client', () => {
  it('refreshes once with the stored token on an ended session, keeps the rotated token and retries', async () => {
    const store = memoryStore({ [KEYS.refresh]: 'refresh-1' });
    const { fn, calls } = fakeFetch(
      () => json(401, { statusCode: 401, code: 'unauthorized', message: 'Unauthorized' }),
      () => json(200, { accessToken: 'access-2', refreshToken: 'refresh-2', expiresIn: 900 }),
      () => json(200, { ok: true }),
    );
    const client = createApi({ baseUrl: () => 'http://api.test/api', store, fetch: fn });

    await expect(client.request('/me')).resolves.toEqual({ ok: true });

    expect(calls.map((c) => c.url)).toEqual(['http://api.test/api/me', 'http://api.test/api/auth/refresh', 'http://api.test/api/me']);
    // The refresh sends the token in the body, as a mobile client.
    expect(header(calls[1]!.init, 'X-Client')).toBe('mobile');
    expect(JSON.parse(calls[1]!.init.body as string)).toEqual({ refreshToken: 'refresh-1' });
    expect(header(calls[1]!.init, 'Authorization')).toBeUndefined();
    // The retry carries the new access token; the rotated refresh token replaces the old one.
    expect(header(calls[2]!.init, 'Authorization')).toBe('Bearer access-2');
    expect(store.data[KEYS.refresh]).toBe('refresh-2');
  });

  it('shares one refresh between requests that fail together', async () => {
    const store = memoryStore({ [KEYS.refresh]: 'refresh-1' });
    let refreshes = 0;
    const fn = jest.fn(async (url: string, init: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshes += 1;
        await new Promise((r) => setTimeout(r, 10));
        return json(200, { accessToken: 'access-2', refreshToken: 'refresh-2' });
      }
      return header(init, 'Authorization') === 'Bearer access-2' ? json(200, { url }) : json(401, { code: 'unauthorized' });
    }) as unknown as typeof fetch;
    const client = createApi({ baseUrl: () => 'http://api.test/api', store, fetch: fn });

    await Promise.all([client.request('/me'), client.request('/field/context')]);
    expect(refreshes).toBe(1);
  });

  it('signs out when the refresh fails: forgets the session and tells the app', async () => {
    const store = memoryStore({ [KEYS.refresh]: 'refresh-old', [KEYS.device]: 'mobile-device', [KEYS.phone]: '+2347000000112' });
    const onSignedOut = jest.fn();
    const { fn } = fakeFetch(
      () => json(401, { code: 'unauthorized' }),
      () => json(401, { code: 'unauthorized', message: 'Refresh token revoked' }),
    );
    const client = createApi({ baseUrl: () => 'http://api.test/api', store, fetch: fn, onSignedOut });

    await expect(client.request('/me')).rejects.toBeInstanceOf(SignedOutError);
    expect(onSignedOut).toHaveBeenCalledTimes(1);
    expect(store.data[KEYS.refresh]).toBeUndefined();
    // The phone stays bound: its id and number are kept for the next sign-in.
    expect(store.data[KEYS.device]).toBe('mobile-device');
    expect(store.data[KEYS.phone]).toBe('+2347000000112');
    expect(await client.hasSession()).toBe(false);
  });

  it('never retries a wrong PIN: it is an answer, not an ended session', async () => {
    const store = memoryStore({ [KEYS.device]: 'mobile-device' });
    const { fn, calls } = fakeFetch(() => json(401, { code: 'pin_incorrect', message: 'Wrong PIN' }));
    const client = createApi({ baseUrl: () => 'http://api.test/api', store, fetch: fn });

    const error = await client.pinLogin('07000000112', '1357').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('pin_incorrect');
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ login: '07000000112', pin: '1357', deviceId: 'mobile-device' });
  });

  it('keeps the refresh token from sign-in only in the store, and sends it on sign-out', async () => {
    const store = memoryStore({ [KEYS.device]: 'mobile-device' });
    const { fn, calls } = fakeFetch(
      () => json(200, { accessToken: 'access-1', refreshToken: 'refresh-1', user: { id: 'u', name: 'Musa', role: 'contractor_site_manager' } }),
      () => json(204),
    );
    const client = createApi({ baseUrl: () => 'http://api.test/api', store, fetch: fn });

    await client.pinLogin('07000000112', '4826', 'ticket-1');
    expect(store.data[KEYS.refresh]).toBe('refresh-1');
    expect(store.data[KEYS.phone]).toBe('07000000112');
    await client.signOut();
    expect(calls[1]!.url).toBe('http://api.test/api/auth/logout');
    expect(JSON.parse(calls[1]!.init.body as string)).toEqual({ refreshToken: 'refresh-1' });
    expect(store.data[KEYS.refresh]).toBeUndefined();
  });
});

describe('the device id', () => {
  it('is made once and stays the same across restarts', async () => {
    const store = memoryStore();
    const first = await getDeviceId(store);
    expect(first).toMatch(/^mobile-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    // A "restart": a new client over the same secure storage.
    const api = createApi({ baseUrl: () => 'http://api.test/api', store, fetch: jest.fn() as unknown as typeof fetch });
    expect(await api.deviceId()).toBe(first);
    expect(await getDeviceId(store)).toBe(first);
  });

  it('differs between installs', async () => {
    expect(await getDeviceId(memoryStore())).not.toBe(await getDeviceId(memoryStore()));
  });
});
