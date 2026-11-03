import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Card, Screen, SupportButton, T } from '@/components/ui';
import { useSession } from '@/session/session';
import { colour, space } from '@/theme';

type State = 'unknown' | 'granted' | 'denied' | 'blocked';

/** M1 Onboarding: camera and location, each with a sentence on why it is needed. */
export default function Permissions() {
  const { strings: s, setPrefs } = useSession();
  const [camera, requestCamera] = useCameraPermissions();
  const [location, setLocation] = useState<State>('unknown');

  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then((p) => setLocation(stateOf(p)));
  }, []);

  const cameraState: State = camera ? stateOf(camera) : 'unknown';
  const finish = () => void setPrefs({ onboarded: true });

  return (
    <Screen
      footer={
        <>
          <Button label={s.common.continue} onPress={finish} />
          {(cameraState !== 'granted' || location !== 'granted') && <Button kind="quiet" label={s.permissions.later} onPress={finish} />}
        </>
      }
    >
      <T variant="title" accessibilityRole="header">{s.permissions.title}</T>
      <Permission
        title={s.permissions.cameraTitle}
        why={s.permissions.cameraWhy}
        state={cameraState}
        onAllow={() => void requestCamera()}
      />
      <Permission
        title={s.permissions.locationTitle}
        why={s.permissions.locationWhy}
        state={location}
        onAllow={() => void Location.requestForegroundPermissionsAsync().then((p) => setLocation(stateOf(p)))}
      />
      <View style={{ flex: 1 }} />
      <SupportButton />
    </Screen>
  );
}

function stateOf(p: { granted: boolean; canAskAgain: boolean; status: string }): State {
  if (p.granted) return 'granted';
  if (p.status === 'undetermined') return 'unknown';
  return p.canAskAgain ? 'denied' : 'blocked';
}

function Permission({ title, why, state, onAllow }: { title: string; why: string; state: State; onAllow: () => void }) {
  const s = useSession().strings;
  return (
    <Card style={styles.card}>
      <T variant="heading">{title}</T>
      <T colour={colour.textSecondary}>{why}</T>
      {state === 'granted' ? (
        <T variant="bodyStrong" colour={colour.successFg}>✓ {s.permissions.allowed}</T>
      ) : state === 'blocked' ? (
        <>
          <T colour={colour.textError}>{s.permissions.denied}</T>
          <Button kind="secondary" label={s.permissions.openSettings} onPress={() => void Linking.openSettings()} />
        </>
      ) : (
        <Button kind="secondary" label={s.permissions.allow} onPress={onAllow} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({ card: { gap: space.sm } });
