import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { BackLink, Button, Notice, Screen, SupportButton, T } from '@/components/ui';
import { VoiceNote, type Voice } from '@/components/VoiceNote';
import { baseMetadata, oneFix, uuid, type Fix } from '@/lib/capture';
import { getContext } from '@/lib/field';
import { formatChainage, formatTime } from '@/lib/format';
import { incidentPhoto, type HandedPhoto } from '@/lib/handoff';
import { useOutbox } from '@/outbox/OutboxProvider';
import { api, useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

/** The four tiles of the board, each an incident type code the API knows. */
const TYPES = ['accident', 'security', 'community', 'equipment'] as const;
type IncidentType = (typeof TYPES)[number];

/*
 * M6 Report incident (screens/m6-incident): what happened (four large tiles), a photo or a voice note or both, Send.
 * It goes through the outbox ahead of everything else; the API tells the resident engineer, the project manager and
 * the security desk. A security incident's place is never shown on the phone once sent, and it leaves the outbox list
 * as soon as the API has it.
 */
export default function Incident() {
  const { strings: s, me } = useSession();
  const { outbox, items, syncNow } = useOutbox();
  const { lotId, lotName } = useLocalSearchParams<{ lotId: string; lotName?: string }>();
  const [type, setType] = useState<IncidentType | null>(null);
  const [photo, setPhoto] = useState<HandedPhoto | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [fix, setFix] = useState<Fix | null>(null);
  const [fixDone, setFixDone] = useState(false);
  const [chainageM, setChainageM] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);

  // Where the phone is, once, as the screen opens; the chainage too when there is signal.
  useEffect(() => {
    void oneFix().then((f) => {
      setFix(f);
      setFixDone(true);
      if (f) void getContext(api, { lat: f.latitude, lon: f.longitude }).then((c) => setChainageM(c.lots.find((l) => l.id === lotId)?.nearest?.chainageM ?? null)).catch(() => undefined);
    });
  }, [lotId]);

  // The photo comes back from the camera.
  useFocusEffect(
    useCallback(() => {
      const shot = incidentPhoto.take();
      if (shot) setPhoto(shot);
    }, []),
  );

  const item = sentId ? items.find((i) => i.clientId === sentId) : undefined;
  useEffect(() => {
    if (item) setSeen(true);
  }, [item]);

  async function send() {
    if (!outbox || !me || !type || (!photo && !voice)) return;
    setBusy(true);
    setError(null);
    try {
      const at = photo?.fix ?? fix ?? (await oneFix());
      if (!at) return setError(s.incident.noLocation);
      const clientId = uuid();
      const takenAt = photo?.takenAt ?? new Date();
      const security = type === 'security';
      await outbox.add({
        clientId,
        userId: me.user.id,
        kind: 'incident',
        lotId,
        capturedAt: takenAt.toISOString(),
        // A security incident's place is never shown on the phone.
        chainageLabel: security || chainageM === null ? null : formatChainage(chainageM),
        photoUri: photo?.photo ?? null,
        thumbUri: security ? null : (photo?.thumb ?? null),
        voiceUri: voice?.uri ?? null,
        metadata: {
          ...baseMetadata({ clientId, kind: 'incident', lotId, takenAt, fix: at, heading: photo?.heading, weak: photo?.weak, chainageM, deviceId: await api.deviceId() }),
          details: { incident_type: type },
        },
      });
      setSentId(clientId);
      void syncNow();
    } finally {
      setBusy(false);
    }
  }

  if (sentId) {
    // Sent once the API has it; a security incident is then gone from the phone altogether.
    const sent = item ? item.status === 'sent' : seen;
    return (
      <Screen footer={<><Button label={s.incident.backHome} onPress={() => router.back()} /><SupportButton /></>}>
        <T variant="title" accessibilityRole="header">{sent ? s.incident.sentTitle : s.incident.savedTitle}</T>
        <Notice tone={sent ? 'success' : 'warning'}>{sent ? s.incident.told : s.incident.waiting}</Notice>
        {item?.status === 'failed' && <Notice tone="error">{s.outbox.failed(item.lastError ?? '')}</Notice>}
      </Screen>
    );
  }

  const where = !fixDone
    ? s.incident.finding
    : !fix
      ? s.incident.noLocationYet
      : [chainageM !== null ? formatChainage(chainageM) : null, s.incident.locked(fix.accuracyM), formatTime(new Date())].filter(Boolean).join(' · ');

  return (
    <Screen footer={<><Button kind="danger" label={s.incident.send} disabled={!type || (!photo && !voice)} busy={busy} onPress={() => void send()} /><SupportButton /></>}>
      <BackLink label={s.common.home} />
      <T variant="title" accessibilityRole="header">{s.home.reportIncident}</T>
      <T variant="small" colour={colour.textSecondary}>{[lotName, where].filter(Boolean).join(' · ')}</T>
      {error && <Notice tone="error">{error}</Notice>}

      <View accessibilityRole="radiogroup" style={styles.tiles}>
        {TYPES.map((t) => (
          <Pressable key={t} accessibilityRole="radio" accessibilityState={{ selected: type === t }} onPress={() => setType(t)} style={[styles.tile, type === t && styles.tileOn]}>
            <View style={[styles.radio, type === t && styles.radioOn]}>{type === t && <View style={styles.dot} />}</View>
            <View style={styles.flex}>
              <T variant="heading">{s.incident.types[t].title}</T>
              <T variant="small" colour={colour.textSecondary}>{s.incident.types[t].description}</T>
            </View>
          </Pressable>
        ))}
      </View>

      {photo ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: photo.thumb }} style={styles.thumb} accessibilityLabel={s.incident.photoAdded} />
          <View style={styles.flex}>
            <T variant="bodyStrong">{s.incident.photoAdded}</T>
            <Button kind="quiet" label={s.incident.removePhoto} onPress={() => setPhoto(null)} />
          </View>
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/capture', params: { mode: 'incident', lotId, lotName: lotName ?? '' } })} style={styles.add}>
          <Camera size={22} color={colour.text} />
          <T variant="bodyStrong">{s.incident.addPhoto}</T>
        </Pressable>
      )}
      <VoiceNote value={voice} onChange={setVoice} label={s.incident.holdVoice} onDenied={() => setError(s.capture.noMicrophone)} />
      {!photo && !voice && <T variant="small" colour={colour.textSecondary}>{s.incident.photoOrVoice}</T>}
      <T variant="small" colour={colour.textSecondary}>{s.incident.whoIsTold}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tiles: { gap: space.sm },
  tile: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 72, borderWidth: 1, borderColor: colour.borderStrong, borderRadius: radius.md, backgroundColor: colour.raised, padding: space.md },
  tileOn: { borderWidth: 3, borderColor: colour.selectedBorder, backgroundColor: colour.selectedBg },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colour.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colour.selectedBorder },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colour.selectedBorder },
  add: { minHeight: touch.large, borderWidth: 2, borderColor: colour.secondaryBorder, borderRadius: radius.md, backgroundColor: colour.raised, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  thumb: { width: 88, height: 88, borderRadius: radius.sm, backgroundColor: colour.muted },
});
