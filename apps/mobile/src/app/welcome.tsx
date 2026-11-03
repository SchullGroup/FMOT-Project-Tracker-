import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Gap, Screen, SupportButton, T, Toggle } from '@/components/ui';
import { LANGUAGES } from '@/i18n';
import { useSession } from '@/session/session';
import { colour, space } from '@/theme';

/** M1 Onboarding, first screen: what the app is for, language, Large text. */
export default function Welcome() {
  const { strings: s, prefs, setPrefs } = useSession();
  return (
    <Screen footer={<Button label={s.welcome.start} onPress={() => router.push('/permissions')} />}>
      <T variant="title" accessibilityRole="header">{s.welcome.title}</T>
      <T colour={colour.textSecondary}>{s.welcome.intro}</T>
      <Gap size={space.sm} />
      <T variant="label">{s.welcome.language}</T>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {LANGUAGES.map((l) => (
          <Chip key={l.code} label={l.name} selected={prefs.language === l.code} disabled={!l.ready} onPress={() => void setPrefs({ language: l.code })} />
        ))}
      </View>
      <T variant="small" colour={colour.textSecondary}>{s.welcome.languageLater}</T>
      <Gap size={space.sm} />
      <Toggle label={s.welcome.largeText} hint={s.welcome.largeTextHint} value={prefs.largeText} onChange={(v) => void setPrefs({ largeText: v })} />
      <View style={{ flex: 1 }} />
      <SupportButton />
    </Screen>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm } });
