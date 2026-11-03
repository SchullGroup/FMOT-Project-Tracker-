import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Notice, Screen, SupportButton, T } from '@/components/ui';
import { errorText } from '@/i18n';
import { getContext, getReviewQueue } from '@/lib/field';
import { formatChainage, formatTime, greetingName, lotsLabel, partOfDay } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';
import { api, useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

const soon = (title: string) => router.push({ pathname: '/coming-soon', params: { title } });

/** M9 Home for resident engineers (screens/m9-re-home): the review queue count, the lots, and what comes next. */
export default function ReHome() {
  const { strings: s, me } = useSession();
  const data = useLoad(async () => {
    const [queue, context] = await Promise.all([getReviewQueue(api), getContext(api)]);
    return { queue, context };
  });
  const lots = data.data?.context.lots ?? [];
  const first = data.data?.queue.items[0];
  const name = greetingName(me?.user.name ?? '');

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.flex}>
          <T variant="title" accessibilityRole="header">{s.home.greeting(partOfDay(), name)}</T>
          <T variant="small" colour={colour.textSecondary}>{s.reHome.subtitle(me?.organisation.name ?? '', lotsLabel(lots.map((l) => l.name)))}</T>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={s.home.menu} onPress={() => router.push('/settings')} style={styles.menu}>
          <T variant="title">☰</T>
        </Pressable>
      </View>

      {data.error != null && !data.data && <Notice tone="error">{errorText(s, data.error)}</Notice>}

      <Card style={styles.queue}>
        <T variant="heading">{data.data ? s.reHome.toVerify(data.data.queue.total) : s.common.loading}</T>
        {data.data && data.data.queue.flagged > 0 && <T colour={colour.textError}>{s.reHome.flagged(data.data.queue.flagged)}</T>}
        {data.data && !first && <T colour={colour.textSecondary}>{s.reHome.queueEmpty}</T>}
        {first && (
          <>
            <View style={styles.photo}>
              <T colour={colour.textSecondary} style={styles.center}>{s.reHome.photoLater}</T>
            </View>
            <T variant="bodyStrong">{[first.chainageM !== null ? formatChainage(first.chainageM) : null, first.lotName, first.submittedBy, formatTime(first.capturedAt)].filter(Boolean).join(' · ')}</T>
            <View style={styles.row}>
              <Button kind="secondary" label={s.reHome.sendBack} style={styles.flex} onPress={() => soon(s.reHome.openQueue)} />
              <Button label={s.reHome.verify} style={styles.flex} onPress={() => soon(s.reHome.openQueue)} />
            </View>
          </>
        )}
      </Card>

      <Card onPress={() => soon(s.reHome.milestonesToVerify)} label={s.reHome.milestonesToVerify}>
        <T variant="heading">{s.reHome.milestonesToVerify}</T>
        <T variant="small" colour={colour.textSecondary}>{s.reHome.nextStep}</T>
      </Card>
      <Card onPress={() => soon(s.reHome.testsWitnessed)} label={s.reHome.testsWitnessed}>
        <T variant="heading">{s.reHome.testsWitnessed}</T>
        <T variant="small" colour={colour.textSecondary}>{s.reHome.nextStep}</T>
      </Card>
      <Button kind="secondary" label={s.reHome.verifyOnSite} onPress={() => soon(s.reHome.verifyOnSite)} />
      <SupportButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  menu: { minWidth: touch.min, minHeight: touch.min, alignItems: 'center', justifyContent: 'center' },
  queue: { backgroundColor: colour.muted, borderColor: colour.muted, gap: space.sm },
  photo: { height: 160, borderRadius: radius.md, backgroundColor: colour.raised, borderWidth: 1, borderColor: colour.border, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: space.md },
});
