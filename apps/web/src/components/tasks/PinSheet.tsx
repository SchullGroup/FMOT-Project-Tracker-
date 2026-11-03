'use client';

import { useState } from 'react';
import { PinPad } from '@/components/PinPad';
import { Button } from '@/components/ui/Button';
import { confirmPin } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';
import { Sheet } from './Sheet';

/*
 * The PIN step-up, as in the design: what you are approving, four dots, a
 * keypad. The PIN is exchanged for a single-use confirmation bound to this
 * action on this record; the caller sends the decision with it.
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

  async function confirm(value = pin) {
    if (value.length !== 4 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { token } = await confirmPin(value, props.action, props.subjectId);
      await props.onConfirmed(token);
      setPin('');
    } catch (err) {
      setError(messageFor(err));
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  const close = () => { setPin(''); setError(null); props.onClose(); };

  return (
    <Sheet open={props.open} title="Enter your PIN" onClose={close}>
      <div className="flex flex-col items-center gap-5">
        <p className="text-center text-lg">{props.summary}</p>
        <PinPad value={pin} onChange={(v) => { setPin(v); setError(null); }} onComplete={(v) => void confirm(v)} error={error} autoFocus />
        <Button busy={busy} disabled={pin.length !== 4} wide onClick={() => void confirm()}>
          {props.actionLabel}
        </Button>
        <Button variant="quiet" onClick={close}>Cancel</Button>
      </div>
    </Sheet>
  );
}
