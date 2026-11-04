import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Crest, Field, Notice, Screen, SupportButton, T } from '@/components/ui';
import { PinPad } from '@/components/PinPad';
import { errorText } from '@/i18n';
import { ApiError } from '@/lib/api';
import { localNumber } from '@/lib/format';
import { api, useSession } from '@/session/session';
import { colour } from '@/theme';

type Step = { kind: 'phone' } | { kind: 'code' } | { kind: 'pin'; ticket: string; hasPin: boolean };

/*
 * Sign-in as the API supports it for phones: the mobile number, the 6-digit code from the text message (the test
 * server prints it in the API window), then the PIN: entered if the person has one, set (twice) if not. The code's
 * ticket binds this phone to the person.
 */
export default function SignIn() {
  const { strings: s, savedPhone, opened } = useSession();
  const [step, setStep] = useState<Step>({ kind: 'phone' });
  const [phone, setPhone] = useState(savedPhone ? localNumber(savedPhone) : '');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(errorText(s, e));
      setPin('');
      setFirstPin(null);
      // An expired code or ticket starts again from the number.
      if (e instanceof ApiError && (e.code === 'code_expired' || e.code === 'unauthorized')) setStep({ kind: 'phone' });
    } finally {
      setBusy(false);
    }
  }

  const sendCode = () =>
    run(async () => {
      await api.requestCode(phone);
      setCode('');
      setStep({ kind: 'code' });
    });

  const checkCode = () =>
    run(async () => {
      const { ticket, hasPin } = await api.verifyCode(phone, code);
      setStep({ kind: 'pin', ticket, hasPin });
    });

  const usePin = (value: string) => {
    if (step.kind !== 'pin') return;
    if (step.hasPin) return void run(async () => {
      await api.pinLogin(phone, value, step.ticket);
      await opened();
    });
    if (!firstPin) {
      setFirstPin(value);
      setPin('');
      return;
    }
    if (value !== firstPin) {
      setError(s.signIn.pinMismatch);
      setFirstPin(null);
      setPin('');
      return;
    }
    void run(async () => {
      await api.setPin(phone, step.ticket, value);
      await opened(true);
    });
  };

  if (step.kind === 'pin') {
    const label = step.hasPin ? s.signIn.pinEnter : firstPin ? s.signIn.pinAgain : s.signIn.pinSet;
    return (
      <Screen footer={<SupportButton />}>
        <T variant="title" accessibilityRole="header">{s.signIn.title}</T>
        {!step.hasPin && <T colour={colour.textSecondary}>{s.signIn.pinHint}</T>}
        {error && <Notice tone="error">{error}</Notice>}
        <PinPad label={label} value={pin} onChange={setPin} onComplete={usePin} disabled={busy} />
        {step.hasPin && <T variant="small" colour={colour.textSecondary}>{s.signIn.forgotPin}</T>}
      </Screen>
    );
  }

  if (step.kind === 'code') {
    return (
      <Screen footer={<><Button label={s.common.continue} busy={busy} disabled={!/^\d{6}$/.test(code)} onPress={() => void checkCode()} /><SupportButton /></>}>
        <T variant="title" accessibilityRole="header">{s.signIn.codeTitle}</T>
        <T colour={colour.textSecondary}>{s.signIn.codeSent(phone)}</T>
        {__DEV__ && <Notice tone="info">{s.signIn.codeOnTestServer}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        <Field label={s.signIn.codeLabel} value={code} onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" autoFocus maxLength={6} />
        <Button kind="quiet" label={s.signIn.newCode} onPress={() => void sendCode()} />
        <Button kind="quiet" label={s.signIn.otherNumber} onPress={() => setStep({ kind: 'phone' })} />
      </Screen>
    );
  }

  return (
    <Screen footer={<><Button label={s.signIn.sendCode} busy={busy} disabled={!(phone.includes('@') ? /^\S+@\S+\.\S+$/.test(phone.trim()) : phone.replace(/\D/g, '').length >= 10)} onPress={() => void sendCode()} /><SupportButton /></>}>
      <Crest />
      <T variant="title" accessibilityRole="header">{s.signIn.title}</T>
      {error && <Notice tone="error">{error}</Notice>}
      <Field label={s.signIn.phoneLabel} hint={s.signIn.phoneHint} value={phone} onChangeText={setPhone} keyboardType="default" autoCapitalize="none" autoCorrect={false} textContentType="username" autoComplete="username" />
      <Button kind="quiet" label={s.signIn.haveInvite} onPress={() => router.push('/invite')} />
    </Screen>
  );
}
