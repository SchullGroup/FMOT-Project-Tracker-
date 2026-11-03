import { StyleSheet, View } from 'react-native';
import type { Strings } from '@/i18n';
import type { OutboxItem } from '@/outbox/outbox';
import { colour, radius, space, touch } from '@/theme';
import { T } from './ui';

/** The photo status ladder (gap review), as on the M8 board: one chip per step. */
export type Rung = 'queued' | 'sending' | 'sent' | 'pending' | 'verified' | 'sentBack' | 'failed' | 'tooOld';

export function rungOf(item: OutboxItem): Rung {
  if (item.status === 'too_old') return 'tooOld';
  if (item.status === 'failed') return 'failed';
  if (item.status === 'sending') return 'sending';
  if (item.status === 'queued') return 'queued';
  if (item.serverStatus === 'verified') return 'verified';
  if (item.serverStatus === 'sent_back') return 'sentBack';
  if (item.serverStatus === 'pending_re' || item.serverStatus === 'checked') return 'pending';
  return 'sent';
}

const TONE: Record<Rung, { bg: string; fg: string; dashed?: boolean }> = {
  queued: { bg: colour.raised, fg: colour.text, dashed: true },
  sending: { bg: colour.raised, fg: colour.text, dashed: true },
  sent: { bg: colour.muted, fg: colour.text },
  pending: { bg: colour.infoBg, fg: colour.infoFg },
  verified: { bg: colour.successBg, fg: colour.successFg },
  sentBack: { bg: colour.errorBg, fg: colour.errorFg },
  failed: { bg: colour.errorBg, fg: colour.errorFg },
  tooOld: { bg: colour.warningBg, fg: colour.warningFg },
};

export function StatusChip({ rung, s }: { rung: Rung; s: Strings }) {
  const t = TONE[rung];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }, t.dashed && styles.dashed]}>
      <T variant="label" colour={t.fg}>{s.outbox.status[rung]}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: touch.min - 8, paddingHorizontal: space.md, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  dashed: { borderWidth: 2, borderStyle: 'dashed', borderColor: colour.borderStrong },
});
