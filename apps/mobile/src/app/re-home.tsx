import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Notice, Screen, SupportButton, T } from '@/components/ui';
import { errorText } from '@/i18n';
import { getContext, getReviewQueue, mediaUrl, sendBackItem, verifyItem, type CheckResult, type ReviewItem } from '@/lib/field';
import { formatChainage, formatTime, greetingName, lotsLabel, partOfDay } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';
import { api, useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

// The checks in the order the engineer reads them.
const CHECK_ORDER = ['corridor', 'lot', 'chainage', 'location', 'time', 'device', 'duplicate'];
const MARK: Record<CheckResult, { mark: string; bg: string; fg: string }> = {
  pass: { mark: '✓', bg: colour.successBg, fg: colour.successFg },
  warn: { mark: '!', bg: colour.warningBg, fg: colour.warningFg },
  fail: { mark: '✕', bg: colour.errorBg, fg: colour.errorFg },
  // Grey: the check cannot run on test phones, so amber always means something real.
  not_available: { mark: '–', bg: colour.muted, fg: colour.textSecondary },
};

/*
 * M9 Home for resident engineers (screens/m9-re-home). The review queue one card at a time: the photo, its chainage,
 * the automatic checks in plain words, then Verify or Send back (with a reason from the list) and the next card. The
 * buttons stay at the bottom of the screen, always visible. Below, the milestones claimed as complete, each with
 * "Verify on site": the engineer's own photo of it, which verifies it.
 */
export default function ReHome() {
  const { strings: s, me } = useSession();
  const data = useLoad(async () => {
    const [queue, context] = await Promise.all([getReviewQueue(api), getContext(api)]);
    return { queue, context };
  });
  // Decided on this phone since the queue was loaded: skipped at once, before the reload.
  const [done, setDone] = useState<string[]>([]);
  const [returning, setReturning] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const lots = data.data?.context.lots ?? [];
  const queue = (data.data?.queue.items ?? []).filter((i) => !done.includes(i.id));
  const card = queue[0];
  const claims = queue.filter((i) => i.kind === 'milestone_claim');
  const name = greetingName(me?.user.name ?? '');
  const reasons = data.data?.context.returnReasons ?? [];

  async function decide(kind: 'verify' | 'sendBack') {
    if (!card || (kind === 'sendBack' && !reason)) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === 'verify') await verifyItem(api, card.id);
      else await sendBackItem(api, card.id, reason!);
      setDone((d) => [...d, card.id]);
      setToast(kind === 'verify' ? s.reHome.verified : s.reHome.sentBackDone);
      setReturning(false);
      setReason(null);
    } catch (e) {
      setError(errorText(s, e));
      // Someone else (or the on-site photo) decided it already: drop it and move on.
      void data.reload();
    } finally {
      setBusy(false);
    }
  }

  const footer = card ? (
    returning ? (
      <View style={styles.row}>
        <Button kind="secondary" label={s.common.cancel} onPress={() => { setReturning(false); setReason(null); }} />
        <Button kind="danger" style={styles.flex} label={s.reHome.sendBack} disabled={!reason} busy={busy} onPress={() => void decide('sendBack')} />
      </View>
    ) : (
      <View style={styles.row}>
        <Button kind="secondary" style={styles.flex} label={s.reHome.sendBack} disabled={busy} onPress={() => setReturning(true)} />
        <Button style={styles.flex} label={s.reHome.verify} busy={busy} onPress={() => void decide('verify')} />
      </View>
    )
  ) : undefined;

  return (
    <Screen footer={footer}>
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
      {toast && <Notice tone="success">{toast}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Card style={styles.queue}>
        <T variant="heading">{data.data ? s.reHome.toVerify(queue.length) : s.common.loading}</T>
        {data.data && queue.some((i) => i.flagged) && <T colour={colour.textError}>{s.reHome.flagged(queue.filter((i) => i.flagged).length)}</T>}
        {data.data && !card && <T colour={colour.textSecondary}>{s.reHome.queueEmpty}</T>}
        {card && <ReviewCard key={card.id} item={card} />}
        {card && returning && (
          <View style={styles.reasons}>
            <T variant="label">{s.reHome.why}</T>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {reasons.map((r) => <Chip key={r.code} label={r.label} selected={reason === r.code} onPress={() => setReason(r.code)} />)}
            </View>
          </View>
        )}
      </Card>

      <Card style={styles.claims}>
        <T variant="heading">{s.reHome.milestonesToVerify(claims.length)}</T>
        {claims.length === 0 && <T variant="small" colour={colour.textSecondary}>{s.reHome.noClaims}</T>}
        {claims.map((c) => {
          const milestoneId = String(c.details?.milestone_id ?? '');
          return (
            <View key={c.id} style={styles.claim}>
              <View style={styles.flex}>
                <T variant="bodyStrong">{c.milestoneName ?? s.reHome.milestone}</T>
                <T variant="small" colour={colour.textSecondary}>
                  {[c.chainageM !== null ? formatChainage(c.chainageM) : null, c.lotName, s.reHome.claimedAt(formatTime(c.capturedAt))].filter(Boolean).join(' · ')}
                </T>
              </View>
              <Button
                kind="secondary"
                label={s.reHome.verifyOnSite}
                disabled={!milestoneId}
                onPress={() => router.push({ pathname: '/capture', params: { mode: 'onsite', lotId: c.lotId, lotName: c.lotName, milestoneId, milestoneName: c.milestoneName ?? '' } })}
              />
            </View>
          );
        })}
      </Card>

      <Button kind="danger" label={s.home.reportIncident} disabled={!lots[0]} onPress={() => lots[0] && router.push({ pathname: '/incident', params: { lotId: lots[0].id, lotName: lots[0].name } })} />
      <SupportButton />
    </Screen>
  );
}

/** One item of the queue: the photo (or the report's answers), where and who, and the checks in plain words. */
function ReviewCard({ item }: { item: ReviewItem }) {
  const s = useSession().strings;
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (item.thumbMediaId) void mediaUrl(api, item.thumbMediaId, 'web').then(setUri).catch(() => setFailed(true));
  }, [item.thumbMediaId]);

  const what = item.kind === 'photo' ? item.discipline : item.kind === 'milestone_claim' ? s.reHome.claim(item.milestoneName ?? '') : item.kind === 'daily_report' ? s.reHome.report : s.reHome.incident;
  const checks = Object.entries(item.checks ?? {}).sort(([a], [b]) => CHECK_ORDER.indexOf(a) - CHECK_ORDER.indexOf(b));
  const report = item.kind === 'daily_report' ? (item.details as { workers?: number; machines?: string[]; weather?: string; problem?: boolean } | null) : null;

  return (
    <View style={styles.card}>
      {item.thumbMediaId ? (
        <View style={styles.photo}>
          {uri ? (
            <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={s.reHome.photoOf(what ?? '')} />
          ) : failed ? (
            <T colour={colour.textSecondary}>{s.reHome.photoFailed}</T>
          ) : (
            <ActivityIndicator color={colour.textSecondary} />
          )}
        </View>
      ) : null}
      <T variant="bodyStrong">{[item.chainageM !== null ? formatChainage(item.chainageM) : null, what, item.submittedBy, formatTime(item.capturedAt)].filter(Boolean).join(' · ')}</T>
      {report && (
        <T>{s.reHome.reportLine(report.workers ?? 0, report.machines?.length ?? 0, s.report.weatherLabel[(report.weather ?? 'sunny') as keyof typeof s.report.weatherLabel] ?? '', !!report.problem)}</T>
      )}
      {item.flagged && <Notice tone="error">{s.reHome.flaggedCard}</Notice>}
      <View style={styles.checks} accessibilityLabel={s.reHome.checks}>
        {checks.map(([key, c]) => (
          <View key={key} style={styles.check}>
            <View style={[styles.mark, { backgroundColor: MARK[c.result].bg }]}>
              <T variant="label" colour={MARK[c.result].fg}>{MARK[c.result].mark}</T>
            </View>
            <T variant="small" style={styles.flex}>
              {`${s.reHome.checkName[key as keyof typeof s.reHome.checkName] ?? key}: ${c.reason}`}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  menu: { minWidth: touch.min, minHeight: touch.min, alignItems: 'center', justifyContent: 'center' },
  queue: { backgroundColor: colour.muted, borderColor: colour.muted, gap: space.sm },
  card: { gap: space.sm },
  photo: { height: 220, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colour.raised, borderWidth: 1, borderColor: colour.border, alignItems: 'center', justifyContent: 'center' },
  checks: { gap: space.xs },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  mark: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  reasons: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', gap: space.md },
  claims: { gap: space.sm },
  claim: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
});
