import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BackLink, Button, Notice, Screen, SupportButton, T } from '@/components/ui';
import { errorText } from '@/i18n';
import type { Milestone } from '@/lib/field';
import { formatChainage } from '@/lib/format';
import { claimsOf, loadMilestones, milestoneState, type MilestoneState } from '@/lib/milestones';
import { useLoad } from '@/lib/useLoad';
import { useOutbox } from '@/outbox/OutboxProvider';
import { useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

/*
 * M5 Milestones (screens/m5-milestones): the lot's milestones along the line with their status. An open one opens to
 * "Mark complete", which takes two photos (the second from another angle) and sends one claim through the outbox; the
 * resident engineer then verifies it on site.
 */
export default function Milestones() {
  const { strings: s } = useSession();
  const { items } = useOutbox();
  const { lotId, lotName, projectName } = useLocalSearchParams<{ lotId: string; lotName?: string; projectName?: string }>();
  const data = useLoad(() => loadMilestones(lotId));
  const [open, setOpen] = useState<string | null>(null);

  const claims = claimsOf(items, lotId);
  const list = data.data?.list ?? [];

  const markComplete = (m: Milestone) =>
    router.push({ pathname: '/capture', params: { mode: 'milestone', lotId, lotName: lotName ?? '', milestoneId: m.id, milestoneName: m.name, ...(m.discipline ? { discipline: m.discipline } : {}) } });

  return (
    <Screen footer={<SupportButton />}>
      <BackLink label={s.common.home} />
      <T variant="title" accessibilityRole="header">{s.milestones.title}</T>
      <T variant="small" colour={colour.textSecondary}>{[lotName, projectName, s.milestones.byChainage].filter(Boolean).join(' · ')}</T>
      {data.data?.offline && <Notice tone="warning">{s.milestones.offline}</Notice>}
      {data.error != null && !data.data && <Notice tone="error">{errorText(s, data.error)}</Notice>}
      {!data.data && !data.error && <T>{s.common.loading}</T>}
      {data.data && list.length === 0 && <T colour={colour.textSecondary}>{s.milestones.none}</T>}

      {list.map((m) => {
        const state = milestoneState(m, claims);
        const expanded = open === m.id && state === 'open';
        return (
          <View key={m.id} style={[styles.row, expanded && styles.expanded]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded, disabled: state !== 'open' }}
              disabled={state !== 'open'}
              onPress={() => setOpen(expanded ? null : m.id)}
              style={styles.head}
            >
              <View style={styles.flex}>
                <T variant="bodyStrong">{m.name}</T>
                <T variant="small" colour={colour.textSecondary}>
                  {[formatChainage(m.chainageM), m.plannedDate ? s.milestones.planned(plannedLabel(m.plannedDate)) : null].filter(Boolean).join(' · ')}
                </T>
              </View>
              <StateChip state={state} label={s.milestones.state[state]} />
            </Pressable>
            {expanded && (
              <>
                <T variant="small" colour={colour.textSecondary}>{s.milestones.how}</T>
                <Button label={s.milestones.markComplete} onPress={() => markComplete(m)} />
              </>
            )}
          </View>
        );
      })}
    </Screen>
  );
}

const plannedLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function StateChip({ state, label }: { state: MilestoneState; label: string }) {
  const tone = {
    open: { bg: colour.raised, fg: colour.text, border: colour.borderStrong },
    onPhone: { bg: colour.raised, fg: colour.text, border: colour.borderStrong },
    claimed: { bg: colour.infoBg, fg: colour.infoFg, border: colour.infoBg },
    verified: { bg: colour.successBg, fg: colour.successFg, border: colour.successBg },
  }[state];
  return (
    <View style={[styles.chip, { backgroundColor: tone.bg, borderColor: tone.border }, state === 'onPhone' && styles.dashed]}>
      <T variant="label" colour={tone.fg}>{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { borderWidth: 1, borderColor: colour.borderStrong, borderRadius: radius.md, backgroundColor: colour.raised, padding: space.md, gap: space.sm },
  expanded: { borderWidth: 2, borderColor: colour.selectedBorder },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: touch.min },
  chip: { minHeight: 32, paddingHorizontal: space.sm, borderRadius: radius.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dashed: { borderStyle: 'dashed', borderWidth: 2 },
});
