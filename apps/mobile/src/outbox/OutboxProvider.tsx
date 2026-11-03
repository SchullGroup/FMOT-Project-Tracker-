import * as Network from 'expo-network';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { getMySubmissions } from '@/lib/field';
import { api, useSession } from '@/session/session';
import { openFieldDb, phoneFiles, uploader } from './device';
import { Outbox, type OutboxItem, type ServerStatus } from './outbox';

/*
 * Runs the outbox while the app is open (Expo Go cannot upload in the background): when the app opens or comes back
 * to the front, when the network returns, and every 30 seconds. After sending, it asks the API what changed since the
 * last time (GET /field/my-submissions?since=) so the statuses move up the ladder.
 */

const EVERY_MS = 30_000;

interface OutboxState {
  ready: boolean;
  outbox: Outbox | null;
  /** This person's items, newest first. */
  items: OutboxItem[];
  unsent: number;
  online: boolean;
  lastSentAt: number | null;
  lastSyncedAt: string | null;
  syncNow: () => Promise<void>;
}

const Ctx = createContext<OutboxState | null>(null);

export function OutboxProvider({ children }: { children: ReactNode }) {
  const { status, me } = useSession();
  const userId = status === 'open' ? (me?.user.id ?? null) : null;
  const [outbox, setOutbox] = useState<Outbox | null>(null);
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [online, setOnline] = useState(true);
  const [sync, setSync] = useState<{ syncedAt: string | null; sentAt: number | null }>({ syncedAt: null, sentAt: null });
  const busy = useRef(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const box = new Outbox({ db: await openFieldDb(), files: phoneFiles, upload: uploader(api) });
      await box.init();
      if (alive) setOutbox(box);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!outbox || !userId) return setItems([]);
    setItems(await outbox.list(userId));
    setSync(await outbox.lastSync(userId));
  }, [outbox, userId]);

  useEffect(() => (outbox ? outbox.subscribe(() => void refresh()) : undefined), [outbox, refresh]);

  const syncNow = useCallback(async () => {
    if (!outbox || !userId || busy.current) return;
    busy.current = true;
    try {
      await outbox.send(userId);
      const { syncedAt } = await outbox.lastSync(userId);
      const changed = await getMySubmissions(api, syncedAt ?? undefined);
      await outbox.applyServer(
        userId,
        changed.items.map((i) => ({ clientId: i.clientId, id: i.id, status: i.status as ServerStatus, returnReason: i.returnReason?.label ?? null, chainageLabel: i.chainage ?? null })),
        changed.serverTime,
      );
    } catch {
      /* no signal or signed out: the next run tries again */
    } finally {
      busy.current = false;
      await refresh();
    }
  }, [outbox, userId, refresh]);

  // When the app opens (or a person signs in), when it comes back to the front, and every 30 seconds while open.
  useEffect(() => {
    if (!outbox || !userId) return;
    void refresh();
    void syncNow();
    const timer = setInterval(() => void syncNow(), EVERY_MS);
    const app = AppState.addEventListener('change', (s) => s === 'active' && void syncNow());
    return () => {
      clearInterval(timer);
      app.remove();
    };
  }, [outbox, userId, syncNow, refresh]);

  // When the network comes back.
  useEffect(() => {
    void Network.getNetworkStateAsync().then((s) => setOnline(s.isConnected !== false));
    const sub = Network.addNetworkStateListener((s) => {
      const now = s.isConnected !== false && s.isInternetReachable !== false;
      setOnline(now);
      if (now) void syncNow();
    });
    return () => sub.remove();
  }, [syncNow]);

  const unsent = items.filter((i) => i.status !== 'sent').length;
  const value = useMemo<OutboxState>(
    () => ({ ready: !!outbox, outbox, items, unsent, online, lastSentAt: sync.sentAt, lastSyncedAt: sync.syncedAt, syncNow }),
    [outbox, items, unsent, online, sync, syncNow],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOutbox(): OutboxState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOutbox outside OutboxProvider');
  return v;
}
