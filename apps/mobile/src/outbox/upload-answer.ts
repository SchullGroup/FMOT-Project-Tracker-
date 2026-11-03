import { ApiError, OfflineError, SignedOutError } from '@/lib/api';
import { formatChainage } from '@/lib/format';
import type { UploadResult } from './outbox';

/* How an upload's answer is read, the same on the phone and in the web build. */

// 201 or 200: accepted; 408, 429 and 5xx: try later; any other 4xx: the item itself was refused.
export async function answer(res: Response): Promise<UploadResult> {
  if (res.ok) {
    const body = (await res.json()) as { id: string; chainageM: number | null };
    return { ok: true, serverId: body.id, chainageLabel: body.chainageM !== null ? formatChainage(body.chainageM) : null };
  }
  let message = `The tracker answered ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (body.message) message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
  } catch {
    /* not JSON */
  }
  return { ok: false, retry: res.status === 408 || res.status === 429 || res.status >= 500, error: message };
}

export function failure(error: unknown): UploadResult {
  if (error instanceof SignedOutError) return { ok: false, retry: true, error: 'Signed out; it sends when you sign in again' };
  if (error instanceof OfflineError) return { ok: false, retry: true, error: 'No signal' };
  if (error instanceof ApiError) return { ok: false, retry: error.status >= 500, error: error.message };
  return { ok: false, retry: true, error: (error as Error).message };
}
