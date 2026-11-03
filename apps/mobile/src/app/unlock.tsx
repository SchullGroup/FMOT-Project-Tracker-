import { useEffect, useState } from 'react';
import { Button, Notice, Screen, SupportButton, T } from '@/components/ui';
import { PinPad } from '@/components/PinPad';
import { errorText } from '@/i18n';
import { ApiError } from '@/lib/api';
import { api, useSession } from '@/session/session';
import { colour } from '@/theme';

/*
 * Opening the app on later days: the PIN (checked by the API, so five wrong ones lock the account), or the
 * fingerprint or face if the person turned that on, which renews the stored session instead.
 */
export default function Unlock() {
  const { strings: s, prefs, savedPhone, opened, signOut, checkBiometric } = useSession();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setPin('');
      // The phone no longer holds a usable session or binding: start again with a text message code.
      if (e instanceof ApiError && ['device_unknown', 'device_not_bound', 'pin_not_set'].includes(e.code)) return void (await signOut());
      setError(errorText(s, e));
    } finally {
      setBusy(false);
    }
  }

  const biometric = () =>
    run(async () => {
      if (!(await checkBiometric(s.unlock.biometricPrompt))) return;
      if (!(await api.resume())) return void (await signOut());
      await opened();
    });

  useEffect(() => {
    if (prefs.biometric) void biometric();
    // Offer the fingerprint once when the screen opens.
  }, []);

  return (
    <Screen footer={<SupportButton />}>
      <T variant="title" accessibilityRole="header">{s.unlock.title}</T>
      <T colour={colour.textSecondary}>{s.unlock.usePin}</T>
      {error && <Notice tone="error">{error}</Notice>}
      <PinPad
        label={s.signIn.pinEnter}
        value={pin}
        onChange={setPin}
        disabled={busy || !savedPhone}
        onComplete={(value) => void run(async () => {
          await api.pinLogin(savedPhone!, value);
          await opened();
        })}
      />
      {prefs.biometric && <Button kind="secondary" label={s.unlock.useBiometric} onPress={() => void biometric()} />}
      <Button kind="quiet" label={s.unlock.notYou} onPress={() => void signOut()} />
    </Screen>
  );
}
