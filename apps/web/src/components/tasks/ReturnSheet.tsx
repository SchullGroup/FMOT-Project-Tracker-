'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { getReturnReasons } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import { Sheet } from './Sheet';

/** Return or send back: always a reason from the list, optionally a note. */
export function ReturnSheet(props: { open: boolean; actionLabel: string; onClose: () => void; onSubmit: (reasonId: string, comment: string) => Promise<void> }) {
  const reasons = useQuery({ queryKey: ['return-reasons'], queryFn: getReturnReasons, staleTime: Infinity });
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await props.onSubmit(reason, comment.trim());
      setReason('');
      setComment('');
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={props.open} title={`${props.actionLabel}: why?`} onClose={props.onClose}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <fieldset>
          <legend className="mb-3 text-lg">Choose the reason. The person who sent it will see it.</legend>
          <div className="flex flex-col gap-2">
            {reasons.data?.map((r) => (
              <label key={r.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 px-4 ${reason === r.id ? 'border-brand-900 bg-brand-50 font-semibold' : 'border-line hover:border-line-strong'}`}>
                <input type="radio" name="reason" value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} className="size-5 accent-brand-900" />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">Note (optional)</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="rounded-md border-2 border-line-strong bg-surface p-3 text-base" />
        </label>
        {error && <p role="alert" className="font-medium text-danger">{error}</p>}
        <Button type="submit" variant="danger" busy={busy} disabled={!reason} wide>
          {props.actionLabel}
        </Button>
      </form>
    </Sheet>
  );
}
