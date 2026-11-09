import { fetch as expoFetch } from 'expo/fetch';
import { Directory, File, Paths } from 'expo-file-system';
import { openDatabaseAsync } from 'expo-sqlite';
import type { Api } from '@/lib/api';
import type { FileOps, OutboxItem, SqlDb, UploadResult } from './outbox';
import { answer, failure } from './upload-answer';

/* The outbox's connections to the phone: SQLite, the app's document folder, and the upload to the API. */

export const openFieldDb = async (): Promise<SqlDb> => openDatabaseAsync('field.db');

// The document folder is kept by the system (the cache, where the camera and recorder write, may be emptied).
const outboxDir = (clientId: string) => new Directory(Paths.document, 'outbox', clientId);

export const phoneFiles: FileOps = {
  async keep(fromUri, clientId, name) {
    const dir = outboxDir(clientId);
    dir.create({ intermediates: true, idempotent: true });
    const target = new File(dir, name);
    if (target.exists) target.delete();
    const source = new File(fromUri);
    await source.move(target);
    return source.uri;
  },
  async remove(path) {
    const file = new File(path);
    if (file.exists) file.delete();
  },
  size: (path) => {
    const file = new File(path);
    return file.exists ? file.size : 0;
  },
};

/** expo/fetch: its FormData takes expo-file-system files, sent as the file itself. */
export const uploadFetch = (url: string, init: { method: string; headers: Record<string, string>; body: FormData }) =>
  expoFetch(url, init as never) as unknown as Promise<Response>;

/*
 * POST /field/submissions as multipart: the metadata JSON, the photo, the voice note. The API answers 201 for a new
 * item and 200 with the same item for a client id it already has, so a retry never makes a duplicate. A failure that
 * may pass (no signal, the server busy or down, the session to renew) is tried again later; a refusal of the item
 * itself (400, 403, 404, 409, 413, 415) waits for Retry.
 */
export function uploader(api: Api) {
  return async (item: OutboxItem): Promise<UploadResult> => {
    try {
      const res = await api.upload('/field/submissions', () => {
        const form = new FormData();
        form.append('metadata', JSON.stringify(item.metadata));
        if (item.photoPath) form.append('photo', new File(item.photoPath) as unknown as Blob, 'photo.jpg');
        if (item.photo2Path) form.append('photo', new File(item.photo2Path) as unknown as Blob, 'photo-2.jpg');
        if (item.voicePath) form.append('voice', new File(item.voicePath) as unknown as Blob, 'voice.m4a');
        return form;
      });
      return await answer(res);
    } catch (error) {
      return failure(error);
    }
  };
}
