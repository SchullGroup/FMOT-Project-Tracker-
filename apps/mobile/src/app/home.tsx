import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, ChevronRight, FileText, Flag } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Notice, Screen, SupportButton, T } from '@/components/ui';
import { errorText } from '@/i18n';
import { getContext, getMySubmissions, ladder, reportSentToday, type FieldLot } from '@/lib/field';
import { formatTime, greetingName, partOfDay } from '@/lib/format';
import { prefsStore } from '@/lib/storage';
import { useLoad } from '@/lib/useLoad';
import { useOutbox } from '@/outbox/OutboxProvider';
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
  const { items: local, unsent, lastSentAt, lastSyncedAt } = useOutbox();
  const { saved } = useLocalSearchParams<{ saved?: string }>();
  const [toastFor, setToastFor] = useState<string | null>(null);
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
  // After Send on the camera: "Photo sent, km 142+300" once the API has it, until then "Saved ...".
  useEffect(() => {
    if (saved) setToastFor(saved);
  }, [saved]);
  const savedItem = toastFor ? local.find((i) => i.clientId === toastFor) : undefined;

  const lots = data.data?.context.lots ?? [];
  const lot: FieldLot | undefined = lots.find((l) => l.id === lotId) ?? lots[0];
  // The server's word for what it has, the outbox for what is still on the phone; a retake on the phone already answers its sent-back item.
  const retakenHere = new Set(local.map((i) => i.supersedesId).filter((x): x is string => !!x));
  const counts = ladder((data.data?.mine.items ?? []).filter((i) => !(i.status === 'sent_back' && retakenHere.has(i.id))), unsent);
  const lastSync = lastSentAt ?? (lastSyncedAt ? Date.parse(lastSyncedAt) : null) ?? data.data?.syncedAt.getTime() ?? null;
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

      <Pressable
        accessibilityRole="button"
        accessibilityHint={s.home.takePhotoHint}
        disabled={!lot}
        onPress={() => lot && router.push({ pathname: '/capture', params: { lotId: lot.id, lotName: lot.name, ...(lot.nearest?.inLot ? { chainageM: String(lot.nearest.chainageM) } : {}) } })}
        style={({ pressed }) => [styles.photo, pressed && { opacity: 0.9 }, !lot && { opacity: 0.5 }]}
      >
        <Camera size={32} color={colour.primaryFg} />
        <T variant="title" colour={colour.primaryFg}>{s.home.takePhoto}</T>
        <T colour={colour.primaryFg} style={styles.center}>{s.home.takePhotoHint}</T>
      </Pressable>

      <View style={styles.row}>
        <Card style={styles.half} onPress={() => soon(s.home.todaysReport)} label={s.home.todaysReport}>
          <View style={styles.iconTitle}>
            <FileText size={22} color={colour.text} />
            <T variant="heading" style={styles.flex}>{s.home.todaysReport}</T>
          </View>
          <T variant="bodyStrong" colour={reportSent ? colour.successFg : colour.text}>{reportSent ? s.home.reportSent : s.home.reportNotSent}</T>
          <T variant="small" colour={colour.textSecondary}>{s.home.reportDue}</T>
        </Card>
        <Card style={styles.half} onPress={() => soon(s.home.milestones)} label={s.home.milestones}>
          <View style={styles.iconTitle}>
            <Flag size={22} color={colour.text} />
            <T variant="heading" style={styles.flex}>{s.home.milestones}</T>
          </View>
          <T variant="small" colour={colour.textSecondary}>{s.home.milestonesHint}</T>
        </Card>
      </View>

      <Button kind="danger" label={s.home.reportIncident} onPress={() => soon(s.home.reportIncident)} />

      <Card style={styles.sentBack} onPress={() => router.push('/sent-back')} label={s.home.sentBack}>
        <T variant="heading">{s.home.sentBack}</T>
        {counts.sentBack > 0 && (
          <View style={styles.badge}>
            <T variant="label" colour={colour.dangerFg}>{String(counts.sentBack)}</T>
          </View>
        )}
        <T variant="small" colour={colour.textSecondary} style={styles.flex} numberOfLines={2}>
          {counts.sentBack ? s.home.sentBackMore(counts.firstReason ?? '', counts.sentBack - 1) : s.home.sentBackNone}
        </T>
        <ChevronRight size={26} color={colour.text} />
      </Card>

      <Card style={styles.photosCard} onPress={() => router.push('/outbox')} label={s.home.yourPhotos}>
        <View style={styles.between}>
          <T variant="heading">{s.home.yourPhotos}</T>
          <T variant="small" colour={colour.textSecondary}>{lastSync ? `${s.home.lastSync(formatTime(new Date(lastSync)))} ›` : s.home.notSynced}</T>
        </View>
        <View style={styles.chips}>
          <Status label={s.home.queued(counts.queued)} bg={colour.raised} fg={colour.text} dashed />
          <Status label={s.home.sent(counts.sent)} bg={colour.muted} fg={colour.text} />
          <Status label={s.home.verified(counts.verified)} bg={colour.successBg} fg={colour.successFg} />
          <Status label={s.home.sentBackCount(counts.sentBack)} bg={colour.errorBg} fg={colour.errorFg} />
        </View>
      </Card>

      <SupportButton />
      {toastFor && (
        <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <T colour={colour.textInverse} style={styles.flex}>
            {savedItem?.status === 'sent' ? (savedItem.chainageLabel ? s.home.toastSent(savedItem.chainageLabel) : s.home.toastSentNoPlace) : s.home.toastSaved}
          </T>
          <Pressable accessibilityRole="button" onPress={() => setToastFor(null)} style={styles.toastOk}>
            <T variant="label" colour={colour.textInverse}>{s.home.ok}</T>
          </Pressable>
        </View>
      )}
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
  iconTitle: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  toast: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colour.text, borderRadius: radius.md, paddingLeft: space.lg, paddingRight: space.xs, minHeight: touch.large },
  toastOk: { minWidth: touch.min, minHeight: touch.min, alignItems: 'center', justifyContent: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  status: { minHeight: touch.min, paddingHorizontal: space.md, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  dashed: { borderWidth: 2, borderStyle: 'dashed', borderColor: colour.borderStrong },
});
