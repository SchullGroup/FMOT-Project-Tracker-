'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { AuthFrame } from '@/components/AuthFrame';
import { PinInput } from '@/components/PinInput';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { getKnownPhone, setKnownPhone } from '@/lib/device';
import { requestCode, setPin, signInWithPin, verifyCode } from '@/lib/endpoints';
import { isCode, messageFor } from '@/lib/messages';
import { formatPhone } from '@/lib/status';

// What the person typed, as shown back to them: an email address as it is, a phone number spaced.
const shown = (login: string) => (login.includes('@') ? login.trim() : formatPhone(login));

type Step = 'phone' | 'code' | 'pin' | 'new-pin';

function SignIn() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '/';
  const known = getKnownPhone();

  const [step, setStep] = useState<Step>(known ? 'pin' : 'phone');
  const [phone, setPhone] = useState(known ?? '');
  const [code, setCode] = useState('');
  const [pin, setPinValue] = useState('');
  const [pin2, setPin2] = useState('');
  const [ticket, setTicket] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // After "Send a new code": a line saying it went.
  const [notice, setNotice] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (e) {
      if (isCode(e, 'device_unknown')) {
        await requestCode(phone);
        setStep('code');
      }
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  }

  const resend = () =>
    run(async () => {
      await requestCode(phone);
      setCode('');
      setNotice(`We sent a new code to ${shown(phone)}. Use the newest one: the earlier code no longer works.`);
    });

  const done = () => {
    setKnownPhone(phone);
    router.replace(next);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 'phone')
      return run(async () => {
        await requestCode(phone);
        setStep('code');
      });
    if (step === 'code')
      return run(async () => {
        const result = await verifyCode(phone, code);
        setTicket(result.ticket);
        setStep(result.hasPin ? 'pin' : 'new-pin');
      });
    if (step === 'pin')
      return run(async () => {
        await signInWithPin(phone, pin, ticket);
        done();
      });
    if (pin !== pin2) {
      setError('The two PINs are different. Type the same PIN twice.');
      return;
    }
    return run(async () => {
      await setPin(phone, ticket!, pin);
      done();
    });
  };

  const titles: Record<Step, string> = {
    phone: 'Sign in',
    code: 'Enter the code we sent you',
    pin: 'Enter your PIN',
    'new-pin': 'Choose a PIN',
  };

  return (
    <AuthFrame title={titles[step]}>
      <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
        {step === 'phone' && (
          <Field
            label="Your phone number or email address"
            hint="The number or email address your account was set up with. We send the code to it."
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="0803 123 4567 or name@example.com"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error}
            autoFocus
            required
          />
        )}

        {step === 'code' && (
          <>
            <p className="text-lg">
              We sent a 6-digit code to <strong className="tabular">{shown(phone)}</strong>. It works for 10 minutes.
            </p>
            <Field
              label="Code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={error}
              autoFocus
              className="max-w-56 text-center text-3xl tracking-[0.3em]"
            />
          </>
        )}

        {step === 'pin' && (
          <>
            <p className="text-lg">
              Signing in as <strong className="tabular">{shown(phone)}</strong>
            </p>
            <PinInput label="PIN" value={pin} onChange={setPinValue} error={error} autoFocus />
          </>
        )}

        {step === 'new-pin' && (
          <>
            <p className="text-lg">You will use this PIN to sign in and to approve things. Do not share it.</p>
            <PinInput label="New PIN" value={pin} onChange={setPinValue} autoFocus />
            <PinInput label="Type the PIN again" value={pin2} onChange={setPin2} error={error} />
          </>
        )}

        <Button type="submit" busy={busy} wide>
          {step === 'phone' ? 'Send me a code' : step === 'code' ? 'Continue' : step === 'pin' ? 'Sign in' : 'Save PIN and sign in'}
        </Button>

        {step === 'code' && (
          <>
            {notice && (
              <p role="status" className="text-base font-medium text-brand-900">
                {notice}
              </p>
            )}
            <Button type="button" variant="quiet" disabled={busy} onClick={resend}>
              Send a new code
            </Button>
          </>
        )}
        {step === 'pin' && (
          <Button
            type="button"
            variant="quiet"
            onClick={() => {
              setKnownPhone(null);
              setPinValue('');
              setError(null);
              setStep('phone');
            }}
          >
            Use a different number or email
          </Button>
        )}
      </form>
    </AuthFrame>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
