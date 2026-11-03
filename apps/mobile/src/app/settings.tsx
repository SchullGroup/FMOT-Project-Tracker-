import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Screen, SupportButton, T, Toggle } from '@/components/ui';
import { LANGUAGES } from '@/i18n';
import { localNumber } from '@/lib/format';
import { useSession } from '@/session/session';
import { colour, space } from '@/theme';

/** M10 Settings: language, Large text, fingerprint on or off, call support, sign out. */
export default function Settings() {
  const { strings: s, prefs, setPrefs, me, signOut, biometricAvailable, checkBiometric } = useSession();
  const [canBiometric, setCanBiometric] = useState(false);

  useEffect(() => {
    void biometricAvailable().then(setCanBiometric);
  }, [biometricAvailable]);

  const toggleBiometric = async (on: boolean) => {
    if (on && !(await checkBiometric(s.biometric.prompt))) return;
    await setPrefs({ biometric: on });
  };

  return (
    <Screen
      footer={
        <>
          <Button kind="danger" label={s.settings.signOut} hint={s.settings.signOutHint} onPress={() => void signOut()} />
          <Button kind="quiet" label={s.common.back} onPress={() => router.back()} />
        </>
      }
    >
      <T variant="title" accessibilityRole="header">{s.settings.title}</T>
      {me && <T colour={colour.textSecondary}>{s.settings.signedInAs(me.user.name, localNumber(me.user.phone))}</T>}

      <Card style={styles.card}>
        <T variant="heading">{s.settings.language}</T>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {LANGUAGES.map((l) => (
            <Chip key={l.code} label={l.name} selected={prefs.language === l.code} disabled={!l.ready} onPress={() => void setPrefs({ language: l.code })} />
          ))}
        </View>
        <T variant="small" colour={colour.textSecondary}>{s.welcome.languageLater}</T>
      </Card>

      <Card style={styles.card}>
        <Toggle label={s.settings.largeText} hint={s.welcome.largeTextHint} value={prefs.largeText} onChange={(v) => void setPrefs({ largeText: v })} />
        <Toggle
          label={s.settings.biometric}
          hint={canBiometric ? s.settings.biometricHint : s.settings.biometricUnavailable}
          value={prefs.biometric && canBiometric}
          disabled={!canBiometric}
          onChange={(v) => void toggleBiometric(v)}
        />
      </Card>

      <SupportButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
