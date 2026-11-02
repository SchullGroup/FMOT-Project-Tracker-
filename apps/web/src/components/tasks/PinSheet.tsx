'use client';

import { useState, type FormEvent } from 'react';
import { PinInput } from '@/components/PinInput';
import { Button } from '@/components/ui/Button';
import { confirmPin } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import { Sheet } from './Sheet';

/*
 * The PIN step-up. The PIN is exchanged for a single-use confirmation bound
 * to this action on this record; the caller then sends the decision with it.
 */
export function PinSheet(props: {
  open: boolean;
  actionLabel: string;
  action: string;
  subjectId: string;
  summary: string;
  onClose: () => void;
  onConfirmed: (token: string) => Promise<void>;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = await confirmPin(pin, props.action, props.subjectId);
      await props.onConfirmed(token);
      setPin('');
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={props.open} title={`${props.actionLabel}: enter your PIN`} onClose={() => { setPin(''); setError(null); props.onClose(); }}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <p className="text-lg">{props.summary}</p>
        <PinInput label="Your PIN" value={pin} onChange={setPin} error={error} autoFocus />
        <Button type="submit" busy={busy} disabled={pin.length !== 4} wide>
          {props.actionLabel}
        </Button>
      </form>
    </Sheet>
  );
}
