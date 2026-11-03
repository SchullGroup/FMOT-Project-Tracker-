import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Notice, Screen, SupportButton, T } from '@/components/ui';
import { errorText } from '@/i18n';
import { getContext, getMySubmissions, ladder, reportSentToday, type FieldLot } from '@/lib/field';
import { formatTime, greetingName, partOfDay } from '@/lib/format';
import { prefsStore } from '@/lib/storage';
import { useLoad } from '@/lib/useLoad';
import { api, useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

const LOT_KEY = 'fmot.lot';

// The phone's position, when location is allowed: a recent fix if there is one, else a fresh one.
async function position(): Promise<{ lat: number; lon: number; accuracyM: number | null } | null> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) return null;
  const fix = (await Location.getLastKnownPositionAsync({ maxAge: 120_000, requiredAccuracy: 100 })) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return { lat: fix.coords.latitude, lon: fix.coords.longitude, accuracyM: fix.coords.accuracy !== null ? Math.round(fix.coords.accuracy) : null };
}

const soon = (title: string) => router.push({ pathname: '/coming-soon', params: { title } });

/** M2 Home for site managers (screens/m2-home). */
export default function Home() {
  const { strings: s, me } = useSession();
  const [lotId, setLotId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const data = useLoad(async () => {
    const at = await position().catch(() => null);
    const [context, mine] = await Promise.all([getContext(api, at ?? undefined), getMySubmissions(api)]);
    return { context, mine, at, syncedAt: new Date() };
  });

  useEffect(() => {
    void prefsStore.get(LOT_KEY).then(setLotId);
  }, []);

  const lots = data.data?.context.lots ?? [];
  const lot: FieldLot | undefined = lots.find((l) => l.id === lotId) ?? lots[0];
  const counts = ladder(data.data?.mine.items ?? []);
  const reportSent = reportSentToday(data.data?.mine.items ?? []);
  const firstName = greetingName(me?.user.name ?? '');

  const choose = (id: string) => {
    setLotId(id);
    setPicking(false);
    void prefsStore.set(LOT_KEY, id);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <T variant="title" accessibilityRole="header" style={styles.flex}>{s.home.greeting(partOfDay(), firstName)}</T>
        <Pressable accessibilityRole="button" accessibilityLabel={s.home.menu} onPress={() => router.push('/settings')} style={styles.menu}>
          <T variant="title">☰</T>
        </Pressable>
      </View>

      {data.error != null && !data.data && <Notice tone="error">{errorText(s, data.error)}</Notice>}

      <Card style={styles.lotCard} onPress={lots.length > 1 ? () => setPicking((p) => !p) : undefined} label={s.home.chooseLot}>
        <T variant="label" colour={colour.textSecondary} style={styles.caps}>{s.home.currentLot}</T>
        {!data.data ? (
          <T>{s.common.loading}</T>
        ) : !lot ? (
          <T>{s.home.noLots}</T>
        ) : (
          <>
            <T variant="bodyStrong">{`${lot.name} · ${lot.projectName}${lots.length > 1 ? ' ▾' : ''}`}</T>
            <T colour={colour.textSecondary}>{nearestLine(s, lot, data.data.at)}</T>
          </>
        )}
      </Card>
      {picking &&
        lots.map((l) => (
          <Button key={l.id} kind={l.id === lot?.id ? 'primary' : 'secondary'} label={`${l.name} · ${l.projectName}`} onPress={() => choose(l.id)} />
        ))}

      <Pressable accessibilityRole="button" accessibilityHint={s.home.takePhotoHint} onPress={() => soon(s.home.takePhoto)} style={({ pressed }) => [styles.photo, pressed && { opacity: 0.9 }]}>
        <T variant="title" colour={colour.primaryFg}>{s.home.takePhoto}</T>
        <T colour={colour.primaryFg} style={styles.center}>{s.home.takePhotoHint}</T>
      </Pressable>

      <View style={styles.row}>
        <Card style={styles.half} onPress={() => soon(s.home.todaysReport)} label={s.home.todaysReport}>
          <T variant="heading">{s.home.todaysReport}</T>
          <T variant="bodyStrong" colour={reportSent ? colour.successFg : colour.text}>{reportSent ? s.home.reportSent : s.home.reportNotSent}</T>
          <T variant="small" colour={colour.textSecondary}>{s.home.reportDue}</T>
        </Card>
        <Card style={styles.half} onPress={() => soon(s.home.milestones)} label={s.home.milestones}>
          <T variant="heading">{s.home.milestones}</T>
          <T variant="small" colour={colour.textSecondary}>{s.home.milestonesHint}</T>
        </Card>
      </View>

      <Button kind="danger" label={s.home.reportIncident} onPress={() => soon(s.home.reportIncident)} />

      <Card style={styles.sentBack} onPress={() => soon(s.home.sentBack)} label={s.home.sentBack}>
        <T variant="heading">{s.home.sentBack}</T>
        {counts.sentBack > 0 && (
          <View style={styles.badge}>
            <T variant="label" colour={colour.dangerFg}>{String(counts.sentBack)}</T>
          </View>
        )}
        <T variant="small" colour={colour.textSecondary} style={styles.flex} numberOfLines={2}>
          {counts.sentBack ? s.home.sentBackMore(counts.firstReason ?? '', counts.sentBack - 1) : s.home.sentBackNone}
        </T>
        <T variant="title">›</T>
      </Card>

      <Card style={styles.photosCard}>
        <View style={styles.between}>
          <T variant="heading">{s.home.yourPhotos}</T>
          <T variant="small" colour={colour.textSecondary}>{data.data ? s.home.lastSync(formatTime(data.data.syncedAt)) : s.home.notSynced}</T>
        </View>
        <View style={styles.chips}>
          <Status label={s.home.queued(counts.queued)} bg={colour.raised} fg={colour.text} dashed />
          <Status label={s.home.sent(counts.sent)} bg={colour.muted} fg={colour.text} />
          <Status label={s.home.verified(counts.verified)} bg={colour.successBg} fg={colour.successFg} />
          <Status label={s.home.sentBackCount(counts.sentBack)} bg={colour.errorBg} fg={colour.errorFg} />
        </View>
      </Card>

      <SupportButton />
    </Screen>
  );
}

function nearestLine(s: ReturnType<typeof useSession>['strings'], lot: FieldLot, at: { accuracyM: number | null } | null): string {
  if (!at) return s.home.noLocation;
  if (!lot.nearest) return s.home.locating;
  if (lot.nearest.offsetM > 2000) return s.home.farFromLine((lot.nearest.offsetM / 1000).toFixed(1));
  if (!lot.nearest.inLot) return s.home.outsideLot(lot.nearest.chainage);
  return s.home.nearest(lot.nearest.chainage, at.accuracyM ?? 0);
}

function Status({ label, bg, fg, dashed }: { label: string; bg: string; fg: string; dashed?: boolean }) {
  return (
    <View style={[styles.status, { backgroundColor: bg }, dashed && styles.dashed]}>
      <T variant="label" colour={fg}>{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  caps: { textTransform: 'uppercase', letterSpacing: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  menu: { minWidth: touch.min, minHeight: touch.min, alignItems: 'center', justifyContent: 'center' },
  lotCard: { backgroundColor: colour.muted, borderColor: colour.muted },
  photo: { backgroundColor: colour.brand, borderRadius: radius.lg, minHeight: 104, alignItems: 'center', justifyContent: 'center', padding: space.lg, gap: space.xs },
  row: { flexDirection: 'row', gap: space.md },
  half: { flex: 1 },
  sentBack: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: colour.dangerBg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  photosCard: { gap: space.md },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  status: { minHeight: touch.min, paddingHorizontal: space.md, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  dashed: { borderWidth: 2, borderStyle: 'dashed', borderColor: colour.borderStrong },
});
