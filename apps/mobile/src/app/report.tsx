import { router, useLocalSearchParams } from 'expo-router';
import { Check, Cloud, CloudLightning, CloudRain, Minus, Plus, Sun, Wind, type LucideIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BackLink, Button, Chip, Notice, Screen, SupportButton, T } from '@/components/ui';
import { VoiceNote, type Voice } from '@/components/VoiceNote';
import { baseMetadata, oneFix, uuid } from '@/lib/capture';
import { getMySubmissions, lagosToday, WEATHER, type ReportDetails, type Weather } from '@/lib/field';
import { useLoad } from '@/lib/useLoad';
import { useOutbox } from '@/outbox/OutboxProvider';
import { api, useSession } from '@/session/session';
import { colour, radius, space, touch, typeStyle } from '@/theme';

// "yesterday", or the date ("Tue 3 Nov") for anything older.
function dayLabel(date: string, today: string, yesterdayWord: string): string {
  const yesterday = new Date(Date.parse(`${today}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  if (date === yesterday) return yesterdayWord;
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

const WEATHER_ICON: Record<Weather, LucideIcon> = { sunny: Sun, cloudy: Cloud, rain: CloudRain, storm: CloudLightning, harmattan: Wind };
const MAX_WORKERS = 5000;

/*
 * M4 Today's report (screens/m4-report): workers on site, machines working, weather, any problem (with an optional
 * voice note), prefilled from this lot's last report. One per lot per day: sending again the same day replaces it
 * (the API keeps the earlier one as a version). It goes through the outbox like a photo, and counts for the 16:00
 * reminder.
 */
export default function Report() {
  const { strings: s, me, prefs } = useSession();
  const { outbox, items, syncNow } = useOutbox();
  const { lotId, lotName } = useLocalSearchParams<{ lotId: string; lotName?: string }>();
  const today = lagosToday();

  // The reports this person has sent for the lot: the phone's own first (works offline), then the server's.
  const server = useLoad(async () => (await getMySubmissions(api)).items.filter((i) => i.kind === 'daily_report' && i.lotId === lotId && i.details));
  const reports = useMemo(() => {
    const local = items
      .filter((i) => i.kind === 'daily_report' && i.lotId === lotId)
      .map((i) => ({ details: i.metadata.details as ReportDetails, at: i.createdAt, sent: i.status === 'sent' }));
    const remote = (server.data ?? []).map((i) => ({ details: i.details!, at: Date.parse(i.receivedAt), sent: true }));
    return [...local, ...remote].sort((a, b) => b.details.report_date.localeCompare(a.details.report_date) || b.at - a.at);
  }, [items, server.data, lotId]);
  const last = reports[0]?.details ?? null;
  const machinesSeen = useMemo(() => [...new Set(reports.slice(0, 5).flatMap((r) => r.details.machines))], [reports]);

  // The form, filled from the last report the first time it is known.
  const [filled, setFilled] = useState(false);
  const [workers, setWorkers] = useState(0);
  const [machines, setMachines] = useState<string[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [newMachine, setNewMachine] = useState('');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [problem, setProblem] = useState<boolean | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!filled && last) {
    setFilled(true);
    setWorkers(last.workers);
    setMachines(last.machines);
    setWeather(last.weather);
  }

  const allMachines = [...machinesSeen, ...extra.filter((m) => !machinesSeen.includes(m))];
  const toggle = (m: string) => setMachines((on) => (on.includes(m) ? on.filter((x) => x !== m) : [...on, m]));
  const addMachine = () => {
    const name = newMachine.trim().slice(0, 60);
    if (!name) return;
    if (!allMachines.includes(name)) setExtra((e) => [...e, name]);
    if (!machines.includes(name)) setMachines((on) => [...on, name]);
    setNewMachine('');
  };
  const setCount = (n: number) => setWorkers(Math.max(0, Math.min(MAX_WORKERS, Number.isFinite(n) ? Math.round(n) : 0)));

  const sentToday = reports.find((r) => r.details.report_date === today);
  const ready = weather !== null && problem !== null;

  async function send() {
    if (!outbox || !me || !weather || problem === null) return;
    setBusy(true);
    setError(null);
    try {
      const fix = await oneFix();
      if (!fix) return setError(s.report.noLocation);
      const clientId = uuid();
      const takenAt = new Date();
      const details: ReportDetails = { report_date: today, workers, machines: allMachines.filter((m) => machines.includes(m)), weather, problem };
      await outbox.add({
        clientId,
        userId: me.user.id,
        kind: 'daily_report',
        lotId,
        capturedAt: takenAt.toISOString(),
        chainageLabel: null,
        voiceUri: problem && voice ? voice.uri : null,
        metadata: { ...baseMetadata({ clientId, kind: 'daily_report', lotId, takenAt, fix, deviceId: await api.deviceId() }), details },
      });
      void syncNow();
      router.back();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<><Button label={s.report.send} disabled={!ready} busy={busy} onPress={() => void send()} /><SupportButton /></>}>
      <BackLink label={s.common.home} />
      <T variant="title" accessibilityRole="header">{s.home.todaysReport}</T>
      <T variant="small" colour={colour.textSecondary}>
        {sentToday ? s.report.sentToday : last ? s.report.prefilled(dayLabel(last.report_date, today, s.report.yesterday), lotName ?? '') : s.report.firstOne(lotName ?? '')}
      </T>
      {error && <Notice tone="error">{error}</Notice>}

      <T variant="label">{s.report.workers}</T>
      <View style={styles.stepper}>
        <Pressable accessibilityRole="button" accessibilityLabel={s.report.fewer} onPress={() => setCount(workers - 1)} style={styles.step}>
          <Minus size={26} color={colour.text} />
        </Pressable>
        <TextInput
          accessibilityLabel={s.report.workers}
          accessibilityHint={last ? s.report.lastTime(last.workers) : undefined}
          value={String(workers)}
          onChangeText={(t) => setCount(Number(t.replace(/\D/g, '') || 0))}
          keyboardType="number-pad"
          maxLength={4}
          style={[styles.count, typeStyle('title', prefs.largeText)]}
        />
        <Pressable accessibilityRole="button" accessibilityLabel={s.report.more} onPress={() => setCount(workers + 1)} style={styles.step}>
          <Plus size={26} color={colour.text} />
        </Pressable>
      </View>
      {last && <T variant="small" colour={colour.textSecondary}>{s.report.lastTime(last.workers)}</T>}

      <T variant="label">{s.report.machines}</T>
      {allMachines.length === 0 && <T variant="small" colour={colour.textSecondary}>{s.report.noMachines}</T>}
      {allMachines.map((m) => (
        <Pressable key={m} accessibilityRole="checkbox" accessibilityState={{ checked: machines.includes(m) }} onPress={() => toggle(m)} style={styles.check}>
          <View style={[styles.box, machines.includes(m) && styles.boxOn]}>{machines.includes(m) && <Check size={20} color={colour.primaryFg} />}</View>
          <T style={styles.flex}>{m}</T>
        </Pressable>
      ))}
      <View style={styles.addRow}>
        <TextInput
          accessibilityLabel={s.report.addMachine}
          placeholder={s.report.addMachine}
          placeholderTextColor={colour.textSecondary}
          value={newMachine}
          onChangeText={setNewMachine}
          onSubmitEditing={addMachine}
          returnKeyType="done"
          maxLength={60}
          style={[styles.input, typeStyle('body', prefs.largeText)]}
        />
        <Button kind="secondary" label={s.report.add} disabled={!newMachine.trim()} onPress={addMachine} />
      </View>

      <T variant="label">{s.report.weather}</T>
      <View style={styles.tiles} accessibilityRole="radiogroup">
        {WEATHER.map((w) => {
          const Icon = WEATHER_ICON[w];
          return (
            <Pressable key={w} accessibilityRole="radio" accessibilityState={{ selected: weather === w }} onPress={() => setWeather(w)} style={[styles.tile, weather === w && styles.tileOn]}>
              <Icon size={26} color={colour.text} />
              <T variant="label">{s.report.weatherLabel[w]}</T>
            </Pressable>
          );
        })}
      </View>

      <T variant="label">{s.report.problem}</T>
      <View style={styles.row} accessibilityRole="radiogroup">
        <Chip label={s.report.no} selected={problem === false} onPress={() => setProblem(false)} />
        <Chip label={s.report.yes} selected={problem === true} onPress={() => setProblem(true)} />
      </View>
      {problem && <VoiceNote value={voice} onChange={setVoice} label={s.report.holdVoice} onDenied={() => setError(s.capture.noMicrophone)} />}
      {!ready && <T variant="small" colour={colour.textSecondary}>{s.report.needs}</T>}
      <T variant="small" colour={colour.textSecondary}>{s.report.outbox}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: space.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  step: { width: touch.large, height: touch.large, borderRadius: radius.md, borderWidth: 2, borderColor: colour.secondaryBorder, backgroundColor: colour.raised, alignItems: 'center', justifyContent: 'center' },
  // minWidth 0: a text box keeps its own default width otherwise and pushes the + button off a narrow screen.
  count: { flex: 1, minWidth: 0, minHeight: touch.large, borderWidth: 1, borderColor: colour.borderStrong, borderRadius: radius.md, backgroundColor: colour.raised, textAlign: 'center', color: colour.text },
  check: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: touch.min },
  box: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 2, borderColor: colour.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: colour.raised },
  boxOn: { backgroundColor: colour.brand, borderColor: colour.brand },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  input: { flex: 1, minHeight: touch.large, borderWidth: 1, borderColor: colour.borderStrong, borderRadius: radius.md, paddingHorizontal: space.md, backgroundColor: colour.raised, color: colour.text },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: { width: '31%', minHeight: 88, borderWidth: 1, borderColor: colour.borderStrong, borderRadius: radius.md, backgroundColor: colour.raised, alignItems: 'center', justifyContent: 'center', gap: space.xs, padding: space.xs },
  tileOn: { borderWidth: 3, borderColor: colour.selectedBorder, backgroundColor: colour.selectedBg },
});
