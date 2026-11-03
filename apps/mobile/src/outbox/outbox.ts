/*
 * The outbox: everything taken on the phone waits here until the API has it. It is the heart of the field app, so it
 * is plain logic over three small interfaces (SQL, files, upload) and is unit-tested against a real SQLite database.
 *
 * - One row per item, keyed by the client id made on the phone. The API is idempotent on that id, so sending the
 *   same item twice never makes a duplicate.
 * - Files live in the app's document folder from the moment Send is pressed (the camera and recorder write to the
 *   cache, which the system may empty), and are deleted only after the API has accepted the item.
 * - One item at a time, oldest first. A failure that may pass (no signal, a server error) waits 30 s, 2 min, 10 min,
 *   then every 30 min; a refusal (the API says the item itself is wrong) stops until someone presses Retry.
 * - Items belong to the person who took them: another person signed in on the same phone neither sees nor sends them.
 * - Older than 24 hours: a warning. Older than 72 hours: too old, not sent (the API would flag it), take it again.
 */

export type OutboxStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'too_old';
/** What the API says once it has the item (GET /field/my-submissions). */
export type ServerStatus = 'sent' | 'checked' | 'pending_re' | 'verified' | 'sent_back';
export type Kind = 'photo' | 'daily_report' | 'milestone_claim' | 'incident';

export interface OutboxItem {
  clientId: string;
  userId: string;
  kind: Kind;
  lotId: string;
  /** The JSON "metadata" part the API needs (client_id, kind, lot_id, captured_at, position, device ...). */
  metadata: Record<string, unknown>;
  photoPath: string | null;
  voicePath: string | null;
  thumbPath: string | null;
  status: OutboxStatus;
  attempts: number;
  /** When the sender may try again (ms since 1970). */
  nextTryAt: number;
  serverId: string | null;
  serverStatus: ServerStatus | null;
  returnReason: string | null;
  lastError: string | null;
  capturedAt: string;
  createdAt: number;
  sentAt: number | null;
  /** "km 142+300": what the phone showed, replaced by the server's chainage once sent. */
  chainageLabel: string | null;
  supersedesId: string | null;
}

/** The part of expo-sqlite's SQLiteDatabase the outbox uses (node:sqlite stands in for it in tests). */
export interface SqlDb {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: SqlParam[]): Promise<unknown>;
  getAllAsync<T>(sql: string, ...params: SqlParam[]): Promise<T[]>;
}
type SqlParam = string | number | null;

export interface FileOps {
  /** Moves a file (from the camera's or recorder's cache) into the outbox folder; returns its new path. */
  keep(fromUri: string, clientId: string, name: string): Promise<string>;
  remove(path: string): Promise<void>;
  size(path: string): number;
}

export type UploadResult = { ok: true; serverId: string; chainageLabel: string | null } | { ok: false; retry: boolean; error: string };

export interface OutboxDeps {
  db: SqlDb;
  files: FileOps;
  upload: (item: OutboxItem) => Promise<UploadResult>;
  now?: () => number;
}

const HOUR = 3_600_000;
export const WARN_AFTER_MS = 24 * HOUR;
export const TOO_OLD_AFTER_MS = 72 * HOUR;
/** Waits after the 1st, 2nd and 3rd failed try; every 30 minutes after that. */
export const BACKOFF_MS = [30_000, 2 * 60_000, 10 * 60_000, 30 * 60_000];
export const backoff = (attempts: number) => BACKOFF_MS[Math.min(Math.max(attempts, 1), BACKOFF_MS.length) - 1]!;

const UNSENT: OutboxStatus[] = ['queued', 'sending', 'failed', 'too_old'];

interface Row {
  client_id: string;
  user_id: string;
  kind: Kind;
  lot_id: string;
  metadata: string;
  photo_path: string | null;
  voice_path: string | null;
  thumb_path: string | null;
  status: OutboxStatus;
  attempts: number;
  next_try_at: number;
  server_id: string | null;
  server_status: ServerStatus | null;
  return_reason: string | null;
  last_error: string | null;
  captured_at: string;
  created_at: number;
  sent_at: number | null;
  chainage_label: string | null;
  supersedes_id: string | null;
}

const fromRow = (r: Row): OutboxItem => ({
  clientId: r.client_id,
  userId: r.user_id,
  kind: r.kind,
  lotId: r.lot_id,
  metadata: JSON.parse(r.metadata) as Record<string, unknown>,
  photoPath: r.photo_path,
  voicePath: r.voice_path,
  thumbPath: r.thumb_path,
  status: r.status,
  attempts: r.attempts,
  nextTryAt: r.next_try_at,
  serverId: r.server_id,
  serverStatus: r.server_status,
  returnReason: r.return_reason,
  lastError: r.last_error,
  capturedAt: r.captured_at,
  createdAt: r.created_at,
  sentAt: r.sent_at,
  chainageLabel: r.chainage_label,
  supersedesId: r.supersedes_id,
});

export interface NewItem {
  clientId: string;
  userId: string;
  kind: Kind;
  lotId: string;
  metadata: Record<string, unknown>;
  capturedAt: string;
  chainageLabel: string | null;
  supersedesId?: string | null;
  /** Files as the camera, image manipulator and recorder left them (in the cache). */
  photoUri?: string | null;
  thumbUri?: string | null;
  voiceUri?: string | null;
}

export class Outbox {
  private readonly now: () => number;
  private sending: Promise<number> | null = null;
  private listeners = new Set<() => void>();

  constructor(private readonly deps: OutboxDeps) {
    this.now = deps.now ?? Date.now;
  }

  /** Makes the table, and puts back any item that was being sent when the app stopped. */
  async init() {
    await this.deps.db.execAsync(`
      CREATE TABLE IF NOT EXISTS outbox (
        client_id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        lot_id TEXT NOT NULL,
        metadata TEXT NOT NULL,
        photo_path TEXT,
        voice_path TEXT,
        thumb_path TEXT,
        status TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_try_at INTEGER NOT NULL DEFAULT 0,
        server_id TEXT,
        server_status TEXT,
        return_reason TEXT,
        last_error TEXT,
        captured_at TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        sent_at INTEGER,
        chainage_label TEXT,
        supersedes_id TEXT
      );
      CREATE INDEX IF NOT EXISTS outbox_user_status_idx ON outbox (user_id, status);
      CREATE TABLE IF NOT EXISTS outbox_sync (user_id TEXT PRIMARY KEY NOT NULL, synced_at TEXT NOT NULL, sent_at INTEGER);
    `);
    await this.deps.db.runAsync("UPDATE outbox SET status = 'queued' WHERE status = 'sending'");
  }

  /** Called whenever the outbox changes, so screens can refresh. */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }
  private changed() {
    this.listeners.forEach((l) => l());
  }

  /**
   * Send pressed: the files move into the outbox folder first, then the row is written, so an item in the table
   * always has its files.
   */
  async add(item: NewItem): Promise<OutboxItem> {
    const keep = (uri: string | null | undefined, name: string) => (uri ? this.deps.files.keep(uri, item.clientId, name) : Promise.resolve(null));
    const [photo, thumb, voice] = [await keep(item.photoUri, 'photo.jpg'), await keep(item.thumbUri, 'thumb.jpg'), await keep(item.voiceUri, 'voice.m4a')];
    const now = this.now();
    await this.deps.db.runAsync(
      `INSERT INTO outbox (client_id, user_id, kind, lot_id, metadata, photo_path, voice_path, thumb_path, status, attempts, next_try_at, captured_at, created_at, chainage_label, supersedes_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?, ?, ?, ?)`,
      item.clientId, item.userId, item.kind, item.lotId, JSON.stringify(item.metadata), photo, voice, thumb, now, item.capturedAt, now, item.chainageLabel, item.supersedesId ?? null,
    );
    this.changed();
    return (await this.get(item.clientId))!;
  }

  async get(clientId: string): Promise<OutboxItem | null> {
    const [row] = await this.deps.db.getAllAsync<Row>('SELECT * FROM outbox WHERE client_id = ?', clientId);
    return row ? fromRow(row) : null;
  }

  /** This person's items, newest first. */
  async list(userId: string): Promise<OutboxItem[]> {
    return (await this.deps.db.getAllAsync<Row>('SELECT * FROM outbox WHERE user_id = ? ORDER BY created_at DESC', userId)).map(fromRow);
  }

  /** Items of this person still on the phone (for the Queued count and the sign-out warning). */
  async unsentCount(userId: string): Promise<number> {
    const rows = await this.deps.db.getAllAsync<{ n: number }>(`SELECT count(*) AS n FROM outbox WHERE user_id = ? AND status IN (${UNSENT.map(() => '?').join(', ')})`, userId, ...UNSENT);
    return Number(rows[0]?.n ?? 0);
  }

  /** "Taken over a day ago" and "too old" for one item, from its capture time. */
  age(item: Pick<OutboxItem, 'capturedAt'>): 'fresh' | 'late' | 'too_old' {
    const ms = this.now() - new Date(item.capturedAt).getTime();
    return ms > TOO_OLD_AFTER_MS ? 'too_old' : ms > WARN_AFTER_MS ? 'late' : 'fresh';
  }

  /**
   * Sends what is due for this person, one item at a time, oldest first, and returns how many were accepted. A
   * failure that may pass stops the run (the next items would fail the same way); a refusal moves on to the next.
   * Only one run at a time: a second call while one runs gets the same run.
   */
  send(userId: string): Promise<number> {
    this.sending ??= this.run(userId).finally(() => {
      this.sending = null;
    });
    return this.sending;
  }

  private async run(userId: string): Promise<number> {
    let accepted = 0;
    await this.markTooOld(userId);
    for (;;) {
      const [row] = await this.deps.db.getAllAsync<Row>(
        "SELECT * FROM outbox WHERE user_id = ? AND status = 'queued' AND next_try_at <= ? ORDER BY created_at LIMIT 1",
        userId,
        this.now(),
      );
      if (!row) return accepted;
      const item = fromRow(row);
      await this.deps.db.runAsync("UPDATE outbox SET status = 'sending' WHERE client_id = ?", item.clientId);
      this.changed();
      let result: UploadResult;
      try {
        result = await this.deps.upload(item);
      } catch (error) {
        result = { ok: false, retry: true, error: (error as Error).message };
      }
      const attempts = item.attempts + 1;
      if (result.ok) {
        await this.deps.db.runAsync(
          "UPDATE outbox SET status = 'sent', attempts = ?, server_id = ?, server_status = COALESCE(server_status, 'pending_re'), sent_at = ?, last_error = NULL, chainage_label = COALESCE(?, chainage_label), photo_path = NULL, voice_path = NULL WHERE client_id = ?",
          attempts, result.serverId, this.now(), result.chainageLabel, item.clientId,
        );
        // Only now is the full-size photo (and voice note) deleted; the thumbnail stays until the engineer decides.
        for (const path of [item.photoPath, item.voicePath]) if (path) await this.deps.files.remove(path).catch(() => undefined);
        await this.deps.db.runAsync('INSERT INTO outbox_sync (user_id, synced_at, sent_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET sent_at = excluded.sent_at', userId, new Date(0).toISOString(), this.now());
        accepted += 1;
        this.changed();
        continue;
      }
      await this.deps.db.runAsync(
        'UPDATE outbox SET status = ?, attempts = ?, next_try_at = ?, last_error = ? WHERE client_id = ?',
        result.retry ? 'queued' : 'failed', attempts, this.now() + backoff(attempts), result.error, item.clientId,
      );
      this.changed();
      if (result.retry) return accepted;
    }
  }

  private async markTooOld(userId: string) {
    const cutoff = new Date(this.now() - TOO_OLD_AFTER_MS).toISOString();
    await this.deps.db.runAsync("UPDATE outbox SET status = 'too_old' WHERE user_id = ? AND status IN ('queued', 'failed') AND captured_at < ?", userId, cutoff);
  }

  /** Retry pressed (a failed item, or a queued one waiting out its pause): try it now. */
  async retry(clientId: string) {
    await this.deps.db.runAsync("UPDATE outbox SET status = 'queued', next_try_at = 0 WHERE client_id = ? AND status IN ('queued', 'failed')", clientId);
    this.changed();
  }

  /** The API's word on items it has (GET /field/my-submissions): status, reason, chainage; thumbnails go once verified. */
  async applyServer(userId: string, items: Array<{ clientId: string; id: string; status: ServerStatus; returnReason: string | null; chainageLabel: string | null }>, syncedAt: string) {
    for (const s of items) {
      const [row] = await this.deps.db.getAllAsync<Row>('SELECT * FROM outbox WHERE client_id = ? AND user_id = ?', s.clientId, userId);
      if (!row) continue;
      const verified = s.status === 'verified';
      await this.deps.db.runAsync(
        "UPDATE outbox SET server_id = ?, server_status = ?, return_reason = ?, chainage_label = COALESCE(?, chainage_label), status = CASE WHEN status IN ('queued', 'sending', 'failed') THEN 'sent' ELSE status END, thumb_path = CASE WHEN ? THEN NULL ELSE thumb_path END WHERE client_id = ?",
        s.id, s.status, s.returnReason, s.chainageLabel, verified ? 1 : 0, s.clientId,
      );
      if (verified && row.thumb_path) await this.deps.files.remove(row.thumb_path).catch(() => undefined);
    }
    await this.deps.db.runAsync('INSERT INTO outbox_sync (user_id, synced_at) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET synced_at = excluded.synced_at', userId, syncedAt);
    this.changed();
  }

  /** When the API last answered for this person: the time to ask "changed since", and the last item it accepted. */
  async lastSync(userId: string): Promise<{ syncedAt: string | null; sentAt: number | null }> {
    const [row] = await this.deps.db.getAllAsync<{ synced_at: string; sent_at: number | null }>('SELECT synced_at, sent_at FROM outbox_sync WHERE user_id = ?', userId);
    return { syncedAt: row && row.synced_at !== new Date(0).toISOString() ? row.synced_at : null, sentAt: row?.sent_at ?? null };
  }

  /** Clear sent: forget items the API has and the engineer has verified (their files are already gone). */
  async clearVerified(userId: string) {
    await this.deps.db.runAsync("DELETE FROM outbox WHERE user_id = ? AND status = 'sent' AND server_status = 'verified'", userId);
    this.changed();
  }

  /** Bytes this person's items take on the phone. */
  async spaceUsed(userId: string): Promise<number> {
    const items = await this.list(userId);
    return items.reduce((n, i) => n + [i.photoPath, i.voicePath, i.thumbPath].reduce((m, p) => m + (p ? this.deps.files.size(p) : 0), 0), 0);
  }
}
