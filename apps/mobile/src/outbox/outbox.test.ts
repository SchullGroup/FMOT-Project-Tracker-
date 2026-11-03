import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { BACKOFF_MS, Outbox, TOO_OLD_AFTER_MS, WARN_AFTER_MS, type FileOps, type NewItem, type OutboxItem, type SqlDb, type UploadResult } from './outbox';

/*
 * The outbox against a real SQLite database file (node:sqlite stands in for expo-sqlite, with the same SQL), so "the
 * app restarts" is a new Outbox over the same file.
 */

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'outbox-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function sqlite(path: string): SqlDb {
  const db = new DatabaseSync(path);
  return {
    execAsync: async (sql) => void db.exec(sql),
    runAsync: async (sql, ...params) => db.prepare(sql).run(...params),
    getAllAsync: async <T,>(sql: string, ...params: Array<string | number | null>) => db.prepare(sql).all(...params) as T[],
  };
}

// Files: a set of paths that "exist"; keep() moves a cache file into the outbox folder.
function fakeFiles() {
  const files = new Map<string, number>();
  const ops: FileOps & { files: Map<string, number> } = {
    files,
    keep: async (from, clientId, name) => {
      const size = files.get(from) ?? 1000;
      files.delete(from);
      const to = `document/outbox/${clientId}/${name}`;
      files.set(to, size);
      return to;
    },
    remove: async (path) => void files.delete(path),
    size: (path) => files.get(path) ?? 0,
  };
  return ops;
}

const T0 = Date.parse('2026-11-03T10:00:00Z');
const item = (n: number, over: Partial<NewItem> = {}): NewItem => ({
  clientId: `00000000-0000-4000-8000-00000000000${n}`,
  userId: 'musa',
  kind: 'photo',
  lotId: 'lot-3',
  metadata: { client_id: `00000000-0000-4000-8000-00000000000${n}`, kind: 'photo' },
  capturedAt: new Date(T0 - n * 1000).toISOString(),
  chainageLabel: 'km 150+300',
  photoUri: `cache/photo-${n}.jpg`,
  thumbUri: `cache/thumb-${n}.jpg`,
  ...over,
});

function setup(upload: (i: OutboxItem) => Promise<UploadResult> = async (i) => ({ ok: true, serverId: `srv-${i.clientId.slice(-1)}`, chainageLabel: 'km 150+301' })) {
  let now = T0;
  const files = fakeFiles();
  const path = join(dir, 'field.db');
  const make = () => new Outbox({ db: sqlite(path), files, upload: jest.fn(upload), now: () => now });
  return { files, make, setNow: (t: number) => (now = t), advance: (ms: number) => (now += ms) };
}

describe('the outbox', () => {
  it('keeps an item, its files and its place in the queue across a restart', async () => {
    const s = setup(async () => ({ ok: false, retry: true, error: 'Network request failed' }));
    const first = s.make();
    await first.init();
    s.files.files.set('cache/photo-1.jpg', 2_000_000);
    const added = await first.add(item(1));
    expect(added.photoPath).toBe(`document/outbox/${added.clientId}/photo.jpg`);
    expect(s.files.files.has('cache/photo-1.jpg')).toBe(false);
    await first.send('musa');

    // The app is closed and opened again.
    const second = s.make();
    await second.init();
    const [again] = await second.list('musa');
    expect(again).toMatchObject({ clientId: added.clientId, status: 'queued', attempts: 1, lastError: 'Network request failed' });
    expect(s.files.files.get(again!.photoPath!)).toBe(2_000_000);
  });

  it('puts back an item that was being sent when the app stopped', async () => {
    let release: () => void = () => undefined;
    const s = setup(() => new Promise<UploadResult>((r) => (release = () => r({ ok: true, serverId: 'srv', chainageLabel: null }))));
    const first = s.make();
    await first.init();
    await first.add(item(1));
    void first.send('musa');
    await new Promise((r) => setTimeout(r, 0));
    expect((await first.get(item(1).clientId))!.status).toBe('sending');
    const second = s.make();
    await second.init();
    expect((await second.get(item(1).clientId))!.status).toBe('queued');
    release();
  });

  it('waits 30 s, 2 min, 10 min, then every 30 min after failures', async () => {
    const upload = jest.fn(async (): Promise<UploadResult> => ({ ok: false, retry: true, error: 'offline' }));
    const s = setup(upload);
    const box = s.make();
    await box.init();
    await box.add(item(1));
    const waits: number[] = [];
    for (let i = 0; i < 5; i++) {
      await box.send('musa');
      const it = (await box.get(item(1).clientId))!;
      waits.push(it.nextTryAt - (T0 + waits.reduce((a, b) => a + b, 0)));
      // Not due yet: nothing is tried.
      s.advance(it.nextTryAt - (T0 + waits.slice(0, -1).reduce((a, b) => a + b, 0)) - 1);
      await box.send('musa');
      s.advance(1);
    }
    expect(waits).toEqual([BACKOFF_MS[0], BACKOFF_MS[1], BACKOFF_MS[2], BACKOFF_MS[3], BACKOFF_MS[3]]);
    expect(upload).toHaveBeenCalledTimes(5);
  });

  it('warns after 24 hours and stops at 72 hours, telling the person to take it again', async () => {
    const upload = jest.fn(async (): Promise<UploadResult> => ({ ok: true, serverId: 'srv', chainageLabel: null }));
    const s = setup(upload);
    const box = s.make();
    await box.init();
    await box.add(item(1, { capturedAt: new Date(T0 - WARN_AFTER_MS - 60_000).toISOString() }));
    await box.add(item(2, { capturedAt: new Date(T0 - TOO_OLD_AFTER_MS - 60_000).toISOString() }));
    expect(box.age((await box.get(item(1).clientId))!)).toBe('late');
    expect(box.age((await box.get(item(2).clientId))!)).toBe('too_old');
    await box.send('musa');
    expect((await box.get(item(1).clientId))!.status).toBe('sent');
    expect((await box.get(item(2).clientId))!.status).toBe('too_old');
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it('sends the same client id again after a lost answer, and the API keeps one copy', async () => {
    // The first try reaches the API but the answer is lost; the retry gets the existing item back (API: 200, same id).
    const seen: string[] = [];
    let call = 0;
    const s = setup(async (i) => {
      seen.push(i.clientId);
      call += 1;
      if (call === 1) return { ok: false, retry: true, error: 'The connection dropped' };
      return { ok: true, serverId: 'srv-same', chainageLabel: 'km 150+301' };
    });
    const box = s.make();
    await box.init();
    await box.add(item(1));
    await box.send('musa');
    s.advance(BACKOFF_MS[0]!);
    await box.send('musa');
    expect(seen).toEqual([item(1).clientId, item(1).clientId]);
    expect(await box.get(item(1).clientId)).toMatchObject({ status: 'sent', serverId: 'srv-same', attempts: 2, chainageLabel: 'km 150+301' });
  });

  it("keeps a person's items for that person only", async () => {
    const upload = jest.fn(async (): Promise<UploadResult> => ({ ok: true, serverId: 'srv', chainageLabel: null }));
    const s = setup(upload);
    const box = s.make();
    await box.init();
    await box.add(item(1));
    // Musa signs out with one unsent item; Ibrahim signs in on the same phone.
    expect(await box.unsentCount('musa')).toBe(1);
    expect(await box.list('ibrahim')).toEqual([]);
    expect(await box.send('ibrahim')).toBe(0);
    expect(upload).not.toHaveBeenCalled();
    // Musa again: it goes.
    expect(await box.send('musa')).toBe(1);
  });

  it('never deletes a file when the upload fails, and deletes the full size only once accepted', async () => {
    let answer: UploadResult = { ok: false, retry: false, error: 'Lot is not active' };
    const s = setup(async () => answer);
    const box = s.make();
    await box.init();
    await box.add(item(1, { voiceUri: 'cache/voice-1.m4a' }));
    const kept = (await box.get(item(1).clientId))!;
    await box.send('musa');
    expect((await box.get(item(1).clientId))!.status).toBe('failed');
    for (const p of [kept.photoPath, kept.thumbPath, kept.voicePath]) expect(s.files.files.has(p!)).toBe(true);

    answer = { ok: true, serverId: 'srv-1', chainageLabel: null };
    await box.retry(item(1).clientId);
    await box.send('musa');
    const sent = (await box.get(item(1).clientId))!;
    expect(sent).toMatchObject({ status: 'sent', photoPath: null, voicePath: null, thumbPath: kept.thumbPath });
    expect(s.files.files.has(kept.photoPath!)).toBe(false);
    expect(s.files.files.has(kept.voicePath!)).toBe(false);
    expect(s.files.files.has(kept.thumbPath!)).toBe(true);
  });

  it("takes the API's status, and drops the thumbnail once verified", async () => {
    const s = setup();
    const box = s.make();
    await box.init();
    await box.add(item(1));
    await box.add(item(2));
    await box.send('musa');
    const thumb1 = (await box.get(item(1).clientId))!.thumbPath!;
    await box.applyServer('musa', [
      { clientId: item(1).clientId, id: 'srv-1', status: 'verified', returnReason: null, chainageLabel: 'km 150+301' },
      { clientId: item(2).clientId, id: 'srv-2', status: 'sent_back', returnReason: 'Photo unclear', chainageLabel: null },
    ], '2026-11-03T10:05:00.000Z');
    expect(await box.get(item(1).clientId)).toMatchObject({ serverStatus: 'verified', thumbPath: null });
    expect(s.files.files.has(thumb1)).toBe(false);
    expect(await box.get(item(2).clientId)).toMatchObject({ serverStatus: 'sent_back', returnReason: 'Photo unclear' });
    expect((await box.lastSync('musa')).syncedAt).toBe('2026-11-03T10:05:00.000Z');
  });
});
