import { openDatabaseAsync } from 'expo-sqlite';
import type { Api } from '@/lib/api';
import { answer, failure } from './upload-answer';
import type { FileOps, OutboxItem, SqlDb, UploadResult } from './outbox';

/*
 * The web build exists only to take screenshots at phone sizes and to drive the screens in a browser (never given to
 * anyone). There is no file system: the camera and image tools give data or blob URLs, which stay as they are for the
 * tab's life. SQLite runs in the browser (expo-sqlite's web build).
 */

export const openFieldDb = async (): Promise<SqlDb> => openDatabaseAsync('field.db');

export const phoneFiles: FileOps = {
  keep: async (fromUri) => fromUri,
  remove: async () => undefined,
  size: () => 0,
};

export const uploadFetch = (url: string, init: { method: string; headers: Record<string, string>; body: FormData }) => fetch(url, init);

export function uploader(api: Api) {
  return async (item: OutboxItem): Promise<UploadResult> => {
    try {
      const photo = item.photoPath ? await (await fetch(item.photoPath)).blob() : null;
      const voice = item.voicePath ? await (await fetch(item.voicePath)).blob() : null;
      const res = await api.upload('/field/submissions', () => {
        const form = new FormData();
        form.append('metadata', JSON.stringify(item.metadata));
        if (photo) form.append('photo', photo, 'photo.jpg');
        if (voice) form.append('voice', voice, 'voice.m4a');
        return form;
      });
      return await answer(res);
    } catch (error) {
      return failure(error);
    }
  };
}
