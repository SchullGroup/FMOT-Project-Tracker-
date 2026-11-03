import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { Lock, Mic, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Notice, T } from '@/components/ui';
import { compass, localIso, shrink, shutterState, TILES, uuid } from '@/lib/capture';
import { getContext } from '@/lib/field';
import { formatChainage, formatTime } from '@/lib/format';
import { useOutbox } from '@/outbox/OutboxProvider';
import { api, useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

type Fix = { latitude: number; longitude: number; accuracyM: number; mocked: boolean };
type Shot = { photo: string; thumb: string; takenAt: Date; fix: Fix; heading: number | null; weak: boolean };

const VOICE_MAX_MS = 60_000;

/*
 * M3 Capture (screens/m3-capture). The camera of the app only: there is no gallery. The shutter waits for a location
 * fix of 25 m or better, showing the accuracy live; after 60 seconds without one it allows the photo with a warning,
 * which travels with it. After the shot: the photo, what it is (six tiles), an optional voice note (hold, up to 60 s),
 * Retake or Send. Send moves the files into the outbox and goes home; the outbox sends it when there is signal.
 */
export default function Capture() {
  const { strings: s, me } = useSession();
  const { outbox, syncNow } = useOutbox();
  const params = useLocalSearchParams<{ lotId: string; lotName?: string; chainageM?: string; supersedesId?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [fix, setFix] = useState<Fix | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const [liveChainage, setLiveChainage] = useState<number | null>(params.chainageM ? Number(params.chainageM) : null);
  // Chainage is worked out by the API; without signal the phone only has the last one it was told.
  const [chainageFresh, setChainageFresh] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [tile, setTile] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAsked = useRef(0);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recording = useAudioRecorderState(recorder);
  const [voice, setVoice] = useState<{ uri: string; ms: number } | null>(null);
  const player = useAudioPlayer(voice?.uri ?? null);

  // Live position and heading while the screen is open.
  useEffect(() => {
    let position: Location.LocationSubscription | null = null;
    let compassSub: Location.LocationSubscription | null = null;
    const use = (l: Location.LocationObject) =>
      setFix({ latitude: l.coords.latitude, longitude: l.coords.longitude, accuracyM: Math.round(l.coords.accuracy ?? 999), mocked: l.mocked === true });
    void (async () => {
      // Allowed on M1 already, as a rule; ask only if not.
      const had = await Location.getForegroundPermissionsAsync();
      const p = had.granted ? had : await Location.requestForegroundPermissionsAsync();
      if (!p.granted) return setError(s.capture.noLocation);
      // A first fix at once (the shutter can open sooner), then the live one as the phone improves it.
      void Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }).then(use).catch(() => undefined);
      position = await Location.watchPositionAsync({ accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 }, use);
    })().catch(() => setError(s.capture.noLocation));
    // The compass is a nice-to-have: some phones (and the web build) have none.
    void Location.watchHeadingAsync((h) => setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading))
      .then((sub) => (compassSub = sub))
      .catch(() => undefined);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      position?.remove();
      compassSub?.remove();
      clearInterval(timer);
    };
  }, [s.capture.noLocation]);

  // The chainage, live: asked of the API at most every 10 seconds once the fix is usable (kept if offline).
  useEffect(() => {
    if (!fix || fix.accuracyM > 100 || Date.now() - lastAsked.current < 10_000) return;
    lastAsked.current = Date.now();
    void getContext(api, { lat: fix.latitude, lon: fix.longitude })
      .then((c) => {
        const lot = c.lots.find((l) => l.id === params.lotId);
        if (lot?.nearest) {
          setLiveChainage(lot.nearest.chainageM);
          setChainageFresh(true);
        }
      })
      .catch(() => undefined);
  }, [fix, params.lotId]);

  // A voice note stops by itself at 60 seconds.
  useEffect(() => {
    if (recording.isRecording && recording.durationMillis >= VOICE_MAX_MS) void stopVoice();
  });

  const state = shutterState(fix?.accuracyM ?? null, now - startedAt);
  const canShoot = ready && !!fix && state !== 'waiting' && !busy;

  async function take() {
    if (!camera.current || !fix) return;
    setBusy(true);
    setError(null);
    try {
      const takenAt = new Date();
      const picture = await camera.current.takePictureAsync({ quality: 1, exif: false });
      const small = await shrink(picture.uri, picture.width, picture.height);
      setShot({ photo: small.photo, thumb: small.thumb, takenAt, fix, heading, weak: state === 'weak' });
    } catch (e) {
      console.warn('Capture failed:', (e as Error).message);
      setError(s.capture.failed);
    } finally {
      setBusy(false);
    }
  }

  async function startVoice() {
    const p = await requestRecordingPermissionsAsync();
    if (!p.granted) return setError(s.capture.noMicrophone);
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }
  async function stopVoice() {
    if (!recording.isRecording) return;
    const ms = recording.durationMillis;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (recorder.uri && ms >= 1000) setVoice({ uri: recorder.uri, ms });
  }

  async function send() {
    if (!shot || !tile || !outbox || !me) return;
    setBusy(true);
    const clientId = uuid();
    const chainageM = liveChainage;
    await outbox.add({
      clientId,
      userId: me.user.id,
      kind: 'photo',
      lotId: params.lotId,
      capturedAt: shot.takenAt.toISOString(),
      chainageLabel: chainageM !== null ? formatChainage(chainageM) : null,
      supersedesId: params.supersedesId ?? null,
      photoUri: shot.photo,
      thumbUri: shot.thumb,
      voiceUri: voice?.uri ?? null,
      metadata: {
        client_id: clientId,
        kind: 'photo',
        lot_id: params.lotId,
        discipline_code: tile,
        captured_at: localIso(shot.takenAt),
        latitude: shot.fix.latitude,
        longitude: shot.fix.longitude,
        accuracy_m: shot.fix.accuracyM,
        ...(shot.heading !== null ? { heading: Math.round(shot.heading) % 360 } : {}),
        device_id: await api.deviceId(),
        mock_location: shot.fix.mocked,
        weak_location: shot.weak,
        ...(chainageM !== null ? { phone_chainage_m: chainageM } : {}),
        ...(params.supersedesId ? { supersedes_id: params.supersedesId } : {}),
        details: {},
      },
    });
    void syncNow();
    router.dismissTo({ pathname: '/home', params: { saved: clientId } });
  }

  if (!permission) return <View style={styles.black} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.black, styles.pad]}>
        <T variant="title" colour={colour.textInverse}>{s.capture.cameraTitle}</T>
        <T colour={colour.textInverse}>{s.permissions.cameraWhy}</T>
        <Button label={s.permissions.allow} onPress={() => void requestPermission()} />
        <Button kind="quiet" label={s.common.back} onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const lockText =
    !fix ? s.capture.finding : state === 'locked' ? s.capture.locked(fix.accuracyM) : state === 'weak' ? s.capture.weak(fix.accuracyM) : s.capture.improving(fix.accuracyM, Math.ceil((60_000 - (now - startedAt)) / 1000));
  const lockTone = state === 'locked' ? { bg: colour.successBg, fg: colour.successFg } : state === 'weak' ? { bg: colour.warningBg, fg: colour.warningFg } : { bg: colour.raised, fg: colour.text };

  return (
    <SafeAreaView style={styles.black} edges={['top', 'bottom']}>
      <View style={styles.view}>
        {shot ? (
          <Image source={{ uri: shot.photo }} style={StyleSheet.absoluteFill} resizeMode="contain" accessibilityLabel={s.capture.photoTaken(formatTime(shot.takenAt))} />
        ) : (
          <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" mode="picture" onCameraReady={() => setReady(true)} />
        )}
        <View style={styles.topRow}>
          <View style={[styles.lock, { backgroundColor: (shot ? (shot.weak ? colour.warningBg : colour.successBg) : lockTone.bg) }]} accessibilityLiveRegion="polite">
            <Lock size={20} color={shot ? (shot.weak ? colour.warningFg : colour.successFg) : lockTone.fg} />
            <T variant="label" colour={shot ? (shot.weak ? colour.warningFg : colour.successFg) : lockTone.fg}>
              {shot ? (shot.weak ? s.capture.weak(shot.fix.accuracyM) : s.capture.locked(shot.fix.accuracyM)) : lockText}
            </T>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={s.common.cancel} onPress={() => router.back()} style={styles.close}>
            <X size={26} color={colour.text} />
          </Pressable>
        </View>
        {!shot && (
          <View style={styles.shutterRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={s.capture.shutter}
              accessibilityState={{ disabled: !canShoot, busy }}
              disabled={!canShoot}
              onPress={() => void take()}
              style={[styles.shutter, !canShoot && { opacity: 0.4 }]}
            >
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.bar}>
        <View style={styles.flex}>
          <T variant="title" colour={colour.primaryFg}>{liveChainage !== null ? formatChainage(liveChainage) : '–'}</T>
          <T variant="small" colour={colour.primaryFg}>{chainageFresh ? s.capture.chainageLive : s.capture.chainageLast}</T>
        </View>
        <T variant="small" colour={colour.primaryFg} style={styles.right}>
          {[params.lotName, formatTime(shot?.takenAt ?? new Date(now)), heading !== null ? s.capture.heading(compass(heading)) : null].filter(Boolean).join(' · ')}
        </T>
      </View>

      {shot ? (
        <View style={styles.after}>
          {shot.weak && <Notice tone="warning">{s.capture.weakNote}</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          <View style={styles.between}>
            <T variant="heading">{s.capture.whatIsThis}</T>
            <T variant="small" colour={colour.textSecondary}>{s.capture.tapOne}</T>
          </View>
          <View style={styles.tiles} accessibilityRole="radiogroup">
            {TILES.map(({ code, icon: Icon }) => (
              <Pressable
                key={code}
                accessibilityRole="radio"
                accessibilityState={{ selected: tile === code }}
                onPress={() => setTile(code)}
                style={[styles.tile, tile === code && styles.tileOn]}
              >
                <Icon size={26} color={colour.text} />
                <T variant="label" style={styles.center}>{s.capture.tiles[code as keyof typeof s.capture.tiles]}</T>
              </Pressable>
            ))}
          </View>
          {voice ? (
            <View style={styles.voiceRow}>
              <Button kind="secondary" style={styles.flex} label={s.capture.playVoice(Math.round(voice.ms / 1000))} onPress={() => { player.seekTo(0); player.play(); }} />
              <Button kind="quiet" label={s.capture.deleteVoice} onPress={() => setVoice(null)} />
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={s.capture.voiceHint}
              onPressIn={() => void startVoice()}
              onPressOut={() => void stopVoice()}
              style={[styles.voice, recording.isRecording && { backgroundColor: colour.errorBg, borderColor: colour.dangerBg }]}
            >
              <Mic size={22} color={recording.isRecording ? colour.dangerBg : colour.text} />
              <T variant="bodyStrong">{recording.isRecording ? s.capture.recording(Math.floor(recording.durationMillis / 1000)) : s.capture.holdVoice}</T>
            </Pressable>
          )}
          <View style={styles.row}>
            <Button kind="secondary" label={s.capture.retake} onPress={() => { setShot(null); setTile(null); setVoice(null); }} />
            <Button label={s.capture.send} style={styles.flex} disabled={!tile} busy={busy} onPress={() => void send()} />
          </View>
          <T variant="small" colour={colour.textSecondary} style={styles.center}>{s.capture.joinsOutbox}</T>
        </View>
      ) : (
        <View style={styles.after}>
          {error && <Notice tone="error">{error}</Notice>}
          <T colour={colour.textInverse}>{state === 'waiting' ? s.capture.waitHint : state === 'weak' ? s.capture.weakNote : s.capture.readyHint}</T>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: '#000' },
  pad: { padding: space.lg, gap: space.md, justifyContent: 'center' },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
  view: { flex: 1, minHeight: 240 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.lg, gap: space.sm },
  lock: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: touch.min, paddingHorizontal: space.md, borderRadius: radius.full, flexShrink: 1 },
  close: { width: 56, height: 56, borderRadius: 28, backgroundColor: colour.raised, alignItems: 'center', justifyContent: 'center' },
  shutterRow: { position: 'absolute', bottom: space.xl, left: 0, right: 0, alignItems: 'center' },
  shutter: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, backgroundColor: colour.brand, paddingHorizontal: space.lg, paddingVertical: space.md },
  after: { backgroundColor: colour.page, padding: space.lg, gap: space.md },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.sm },
  tile: { width: '32%', minHeight: 96, borderWidth: 1, borderColor: colour.borderStrong, borderRadius: radius.md, backgroundColor: colour.raised, alignItems: 'center', justifyContent: 'center', gap: space.xs, padding: space.xs },
  tileOn: { borderWidth: 3, borderColor: colour.selectedBorder, backgroundColor: colour.selectedBg },
  voice: { minHeight: touch.large, borderWidth: 2, borderColor: colour.secondaryBorder, borderRadius: radius.md, backgroundColor: colour.raised, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  row: { flexDirection: 'row', gap: space.md },
});
