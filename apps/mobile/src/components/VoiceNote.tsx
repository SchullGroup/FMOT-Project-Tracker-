import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { Mic } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, T } from '@/components/ui';
import { useSession } from '@/session/session';
import { colour, radius, space, touch } from '@/theme';

const MAX_MS = 60_000;

export type Voice = { uri: string; ms: number };

/**
 * Hold to record a voice note (up to 60 seconds, stops by itself), then play or delete it. The same control as on the
 * camera screen, for the report (M4) and the incident (M6).
 */
export function VoiceNote({ value, onChange, label, onDenied }: { value: Voice | null; onChange: (v: Voice | null) => void; label: string; onDenied: () => void }) {
  const s = useSession().strings;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recording = useAudioRecorderState(recorder);
  const player = useAudioPlayer(value?.uri ?? null);

  async function start() {
    const p = await requestRecordingPermissionsAsync();
    if (!p.granted) return onDenied();
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }
  async function stop() {
    if (!recording.isRecording) return;
    const ms = recording.durationMillis;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (recorder.uri && ms >= 1000) onChange({ uri: recorder.uri, ms });
  }

  useEffect(() => {
    if (recording.isRecording && recording.durationMillis >= MAX_MS) void stop();
  });

  if (value) {
    return (
      <View style={styles.row}>
        <Button kind="secondary" style={styles.flex} label={s.capture.playVoice(Math.round(value.ms / 1000))} onPress={() => { player.seekTo(0); player.play(); }} />
        <Button kind="quiet" label={s.capture.deleteVoice} onPress={() => onChange(null)} />
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={s.capture.voiceHint}
      onPressIn={() => void start()}
      onPressOut={() => void stop()}
      style={[styles.voice, recording.isRecording && { backgroundColor: colour.errorBg, borderColor: colour.dangerBg }]}
    >
      <Mic size={22} color={recording.isRecording ? colour.dangerBg : colour.text} />
      <T variant="bodyStrong">{recording.isRecording ? s.capture.recording(Math.floor(recording.durationMillis / 1000)) : label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  voice: { minHeight: touch.large, borderWidth: 2, borderColor: colour.secondaryBorder, borderRadius: radius.md, backgroundColor: colour.raised, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.md },
});
