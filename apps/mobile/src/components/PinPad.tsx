import { Pressable, StyleSheet, View } from 'react-native';
import { colour, radius, space, touch } from '@/theme';
import { T } from './ui';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

/*
 * Four dots and a 3 by 4 keypad, as on the M1 board. Keys are 56 points tall. Four digits call onComplete; the dots
 * are read out as "2 of 4 digits entered".
 */
export function PinPad({ label, value, onChange, onComplete, disabled }: { label: string; value: string; onChange: (v: string) => void; onComplete: (pin: string) => void; disabled?: boolean }) {
  const press = (k: string) => {
    if (disabled) return;
    if (k === 'del') return onChange(value.slice(0, -1));
    if (value.length >= 4) return;
    const next = value + k;
    onChange(next);
    if (next.length === 4) onComplete(next);
  };
  return (
    <View style={styles.wrap}>
      <T variant="label" style={styles.center} accessibilityRole="header">{label}</T>
      <View style={styles.dots} accessible accessibilityLabel={`${value.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i < value.length && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.grid}>
        {KEYS.map((k, i) =>
          k === '' ? (
            <View key={i} style={styles.key} />
          ) : (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? 'Delete the last digit' : k}
              disabled={disabled}
              onPress={() => press(k)}
              style={({ pressed }) => [styles.key, styles.keyFace, pressed && { backgroundColor: colour.border }]}
            >
              <T variant="heading">{k === 'del' ? '⌫' : k}</T>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  center: { textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space.lg },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colour.textSecondary },
  dotOn: { backgroundColor: colour.text, borderColor: colour.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.sm },
  key: { width: '32%', minHeight: touch.large },
  keyFace: { backgroundColor: colour.muted, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
