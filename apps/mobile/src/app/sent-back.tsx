import { router } from 'expo-router';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { StatusChip } from '@/components/StatusChip';
import { Button, Card, Notice, Screen, SupportButton, T } from '@/components/ui';
import { errorText } from '@/i18n';
import { getMySubmissions } from '@/lib/field';
import { formatTime } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';
import { useOutbox } from '@/outbox/OutboxProvider';
import { api, useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

/*
 * M7 Sent back (screens/m7-sent-back): what the resident engineer returned, with the reason. Retake opens the camera
 * for the same lot; the new photo carries supersedes_id, so the API and the engineer see it replaces the old one.
 */
export default function SentBack() {
  const { strings: s } = useSession();
  const { items: local } = useOutbox();
  const data = useLoad(() => getMySubmissions(api));
  const all = data.data?.items ?? [];
  // Already retaken: a newer item (on the server or still on the phone) names it.
  const retaken = new Set([...all.map((i) => i.supersedesId), ...local.map((i) => i.supersedesId)].filter((x): x is string => !!x));
  const back = all.filter((i) => i.status === 'sent_back' && !retaken.has(i.id));
  const waiting = all.filter((i) => i.status === 'sent_back' && local.some((l) => l.supersedesId === i.id && l.status !== 'sent'));

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <ChevronLeft size={22} color={colour.text} />
        <T variant="label">{s.common.home}</T>
      </Pressable>
      <T variant="title" accessibilityRole="header">{s.sentBackScreen.title(back.length)}</T>
      <T colour={colour.textSecondary}>{back.length ? s.sentBackScreen.intro : s.sentBackScreen.none}</T>
      {data.error != null && !data.data && <Notice tone="error">{errorText(s, data.error)}</Notice>}

      {back.map((item) => {
        const thumb = local.find((l) => l.clientId === item.clientId)?.thumbPath;
        return (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              {thumb ? (
                <Image source={{ uri: thumb }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.noThumb]}>
                  <ImageIcon size={24} color={colour.textSecondary} />
                </View>
              )}
              <View style={styles.flex}>
                <T variant="bodyStrong">{[item.chainage, item.discipline].filter(Boolean).join(' · ')}</T>
                <T variant="small" colour={colour.textSecondary}>{[item.reviewedBy, item.reviewedAt ? formatTime(item.reviewedAt) : null].filter(Boolean).join(' · ')}</T>
                <StatusChip rung="sentBack" s={s} />
              </View>
            </View>
            <T variant="bodyStrong">{s.sentBackScreen.reason(item.returnReason?.label ?? '')}</T>
            <Button
              label={s.sentBackScreen.retake}
              onPress={() => router.push({ pathname: '/capture', params: { lotId: item.lotId, supersedesId: item.id, ...(item.chainageM !== null ? { chainageM: String(item.chainageM) } : {}) } })}
            />
          </Card>
        );
      })}
      {waiting.map((item) => (
        <Card key={item.id}>
          <T variant="bodyStrong">{[item.chainage, item.discipline].filter(Boolean).join(' · ')}</T>
          <T variant="small" colour={colour.textSecondary}>{s.sentBackScreen.retaken}</T>
        </Card>
      ))}
      <SupportButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: touch.min, alignSelf: 'flex-start' },
  card: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.md },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colour.muted },
  noThumb: { alignItems: 'center', justifyContent: 'center' },
});
