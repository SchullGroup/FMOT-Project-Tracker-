import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Screen, T } from '@/components/ui';
import { useSession } from '@/session/session';
import { colour } from '@/theme';

/** After the PIN is set: offer the fingerprint or face as a shortcut to the PIN on this phone. */
export default function Biometric() {
  const { strings: s, setPrefs, clearBiometricOffer, biometricAvailable, checkBiometric } = useSession();
  const [available, setAvailable] = useState<boolean | null>(null);

  const done = () => {
    clearBiometricOffer();
    router.replace('/');
  };

  useEffect(() => {
    void biometricAvailable().then((ok) => (ok ? setAvailable(true) : done()));
  }, []);

  if (!available) return null;
  return (
    <Screen
      footer={
        <>
          <Button
            label={s.biometric.yes}
            onPress={() =>
              void (async () => {
                if (await checkBiometric(s.biometric.prompt)) await setPrefs({ biometric: true });
                done();
              })()
            }
          />
          <Button kind="quiet" label={s.biometric.no} onPress={done} />
        </>
      }
    >
      <T variant="title" accessibilityRole="header">{s.biometric.title}</T>
      <T colour={colour.textSecondary}>{s.biometric.body}</T>
    </Screen>
  );
}
