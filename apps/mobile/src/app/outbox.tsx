import { router } from 'expo-router';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { rungOf, StatusChip, type Rung } from '@/components/StatusChip';
import { Button, Card, Notice, Screen, SupportButton, T } from '@/components/ui';
import { formatTime } from '@/lib/format';
import { useOutbox } from '@/outbox/OutboxProvider';
import { isSecurityIncident, type OutboxItem } from '@/outbox/outbox';
import { useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

/*
 * M8 Outbox (screens/m8-outbox): what each status means, then every item of this person on the phone with its
 * thumbnail, where it is, and Try again for one not accepted. The last time the API answered, the space used, and a
 * reminder that photos only send while the app is open (Expo Go cannot upload in the background).
 */
export default function OutboxScreen() {
  const { strings: s, me } = useSession();
  const { outbox, items, online, lastSyncedAt, lastSentAt, syncNow } = useOutbox();
  const [space, setSpace] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (outbox && me) void outbox.spaceUsed(me.user.id).then(setSpace);
  }, [outbox, me, items]);

  const last = lastSentAt ?? (lastSyncedAt ? Date.parse(lastSyncedAt) : null);
  const legend: Array<[Rung, string]> = [
    ['queued', s.outbox.legend.queued],
    ['sent', s.outbox.legend.sent],
    ['pending', s.outbox.legend.pending],
    ['verified', s.outbox.legend.verified],
    ['sentBack', s.outbox.legend.sentBack],
  ];

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <ChevronLeft size={22} color={colour.text} />
        <T variant="label">{s.common.home}</T>
      </Pressable>
      <T variant="title" accessibilityRole="header">{s.outbox.title}</T>
      <T colour={colour.textSecondary}>{s.outbox.sub('', last ? s.outbox.lastSync(formatTime(new Date(last))) : s.outbox.neverSynced)}</T>
      {!online && <Notice tone="warning">{s.outbox.offline}</Notice>}

      <Card style={styles.legend}>
        <T variant="heading">{s.outbox.meaning}</T>
        {legend.map(([rung, text]) => (
          <View key={rung} style={styles.legendRow}>
            <StatusChip rung={rung} s={s} />
            <T variant="small" colour={colour.textSecondary} style={styles.flex}>{text}</T>
          </View>
        ))}
      </Card>

      {items.length === 0 && <T colour={colour.textSecondary}>{s.outbox.empty}</T>}
      {items.map((item) => (
        <Row key={item.clientId} item={item} onRetry={() => void outbox?.retry(item.clientId).then(syncNow)} />
      ))}

      <T variant="small" colour={colour.textSecondary}>{s.outbox.openOnly}</T>
      <T variant="small" colour={colour.textSecondary}>{s.outbox.space((space / 1_048_576).toFixed(1))}</T>
      <Button kind="secondary" label={s.outbox.sendNow} busy={busy} onPress={() => { setBusy(true); void syncNow().finally(() => setBusy(false)); }} />
      {items.some((i) => i.serverStatus === 'verified') && me && <Button kind="quiet" label={s.outbox.clearVerified} onPress={() => void outbox?.clearVerified(me.user.id)} />}
      <SupportButton />
    </Screen>
  );
}

function Row({ item, onRetry }: { item: OutboxItem; onRetry: () => void }) {
  const s = useSession().strings;
  const { outbox } = useOutbox();
  const rung = rungOf(item);
  const tile = String(item.metadata.discipline_code ?? '');
  const incidentType = String((item.metadata.details as { incident_type?: string } | undefined)?.incident_type ?? '');
  const kindLabel =
    item.kind === 'daily_report' ? s.outbox.kind.report
    : item.kind === 'milestone_claim' ? s.outbox.kind.claim
    : item.kind === 'incident' ? s.outbox.kind.incident(s.incident.types[incidentType as keyof typeof s.incident.types]?.title ?? '')
    : s.capture.tiles[tile as keyof typeof s.capture.tiles];
  // A security incident's place is never shown on the phone.
  const what = [isSecurityIncident(item) ? null : item.chainageLabel, kindLabel].filter(Boolean).join(' · ');
  const state =
    rung === 'queued' ? (item.attempts ? s.outbox.nextTry(formatTime(new Date(item.nextTryAt))) : s.outbox.waitingSignal)
    : rung === 'sending' ? s.outbox.sending
    : rung === 'sent' ? s.outbox.checksRunning
    : rung === 'pending' ? s.outbox.inQueue
    : rung === 'verified' ? s.outbox.verifiedLine
    : rung === 'sentBack' ? (item.returnReason ?? '')
    : '';
  const age = outbox?.age(item);
  return (
    <Card style={styles.item}>
      <View style={styles.itemRow}>
        {item.thumbPath ? (
          <Image source={{ uri: item.thumbPath }} style={styles.thumb} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.thumb, styles.noThumb]}>
            <ImageIcon size={24} color={colour.textSecondary} />
          </View>
        )}
        <View style={styles.flex}>
          <T variant="bodyStrong">{what || s.outbox.title}</T>
          <T variant="small" colour={colour.textSecondary}>{[formatTime(item.capturedAt), state].filter(Boolean).join(' · ')}</T>
          <StatusChip rung={rung} s={s} />
        </View>
      </View>
      {rung === 'queued' && age === 'late' && <Notice tone="warning">{s.outbox.late}</Notice>}
      {rung === 'tooOld' && <Notice tone="warning">{s.outbox.tooOld}</Notice>}
      {rung === 'failed' && (
        <>
          <Notice tone="error">{s.outbox.failed(item.lastError ?? '')}</Notice>
          <Button kind="secondary" label={s.outbox.retry} onPress={onRetry} />
        </>
      )}
      {rung === 'queued' && item.attempts > 0 && <Button kind="quiet" label={s.outbox.retry} onPress={onRetry} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: touch.min, alignSelf: 'flex-start' },
  legend: { gap: space.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  item: { gap: space.sm },
  itemRow: { flexDirection: 'row', gap: space.md },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colour.muted },
  noThumb: { alignItems: 'center', justifyContent: 'center' },
});
