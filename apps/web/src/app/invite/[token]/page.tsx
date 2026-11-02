'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthFrame } from '@/components/AuthFrame';
import { PinInput } from '@/components/PinInput';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { setKnownPhone } from '@/lib/device';
import { acceptInvite, getInvite, sendInviteCode } from '@/lib/endpoints';
import { messageFor } from '@/lib/messages';

/*
 * W2 Accept invite: the link from the invite text message. Shows who the
 * account is for, texts a code, and sets the PIN in one go.
 */
export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const invite = useQuery({ queryKey: ['invite', token], queryFn: () => getInvite(token), retry: false });

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (invite.isPending) {
    return (
      <AuthFrame title="Welcome">
        <p className="text-lg text-ink-muted">Checking your invite…</p>
      </AuthFrame>
    );
  }
  if (invite.isError) {
    return (
      <AuthFrame title="This invite cannot be used">
        <p className="text-lg">{messageFor(invite.error)}</p>
      </AuthFrame>
    );
  }

  const { name, role, organisation, phoneMasked } = invite.data;

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      await sendInviteCode(token);
      setCodeSent(true);
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  async function accept(e: FormEvent) {
    e.preventDefault();
    if (pin !== pin2) {
      setError('The two PINs are different. Type the same PIN twice.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await acceptInvite(token, code, pin);
      setKnownPhone(null); // the API returns the full phone in /me; set on next sign-in
      router.replace('/');
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title={`Welcome, ${name}`}>
      <dl className="mb-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-lg">
        <dt className="text-ink-muted">Role</dt>
        <dd className="font-medium">{role}</dd>
        <dt className="text-ink-muted">Organisation</dt>
        <dd className="font-medium">{organisation}</dd>
        <dt className="text-ink-muted">Phone</dt>
        <dd className="font-medium tabular">{phoneMasked}</dd>
      </dl>

      {!codeSent ? (
        <div className="flex flex-col gap-4">
          <p className="text-lg">To set up your account, we will text a code to this phone.</p>
          {error && (
            <p role="alert" className="text-base font-medium text-danger">
              {error}
            </p>
          )}
          <Button busy={busy} onClick={sendCode} wide>
            Text me a code
          </Button>
          <p className="text-base text-ink-muted">
            Not you, or the details are wrong? Do not continue; call the IT support desk.
          </p>
        </div>
      ) : (
        <form onSubmit={accept} className="flex flex-col gap-6" noValidate>
          <Field
            label="Code from the text message"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            autoFocus
            className="max-w-56 text-center text-3xl tracking-[0.3em]"
          />
          <p className="text-lg">Now choose a four-digit PIN. You will use it to sign in and to approve things.</p>
          <PinInput label="New PIN" value={pin} onChange={setPin} />
          <PinInput label="Type the PIN again" value={pin2} onChange={setPin2} error={error} />
          <Button type="submit" busy={busy} wide>
            Set up my account
          </Button>
        </form>
      )}
    </AuthFrame>
  );
}
