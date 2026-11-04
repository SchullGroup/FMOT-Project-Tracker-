import type { ReactNode } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUPPORT_PHONE } from '@/lib/config';
import { useSession } from '@/session/session';
import { colour, crest, radius, space, touch, typeStyle, type TextVariant } from '@/theme';

/** Text in the design's type, scaled by Large text. Never below 16 points. */
export function T({ variant = 'body', colour: c = colour.text, style, children, ...rest }: { variant?: TextVariant; colour?: string; style?: StyleProp<TextStyle>; children: ReactNode; numberOfLines?: number; accessibilityRole?: 'header' | 'text' | 'alert' }) {
  const { prefs } = useSession();
  return (
    <Text style={[typeStyle(variant, prefs.largeText), { color: c }, style]} {...rest}>
      {children}
    </Text>
  );
}

/** One screen: safe area, the page colour, scrolling, the 16-point gutter. */
export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'danger' | 'quiet';

/** A button at least 56 points tall (48 for quiet links), one main action per screen. */
export function Button({ label, onPress, kind = 'primary', busy, disabled, hint, style }: { label: string; onPress: () => void; kind?: ButtonKind; busy?: boolean; disabled?: boolean; hint?: string; style?: StyleProp<ViewStyle> }) {
  const off = disabled || busy;
  const bg = off && kind !== 'quiet' ? colour.disabledBg : { primary: colour.primaryBg, secondary: colour.secondaryBg, danger: colour.dangerBg, quiet: 'transparent' }[kind];
  const fg = off ? colour.disabledFg : { primary: colour.primaryFg, secondary: colour.secondaryFg, danger: colour.dangerFg, quiet: colour.link }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      accessibilityHint={hint}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        kind === 'quiet' ? styles.quiet : null,
        { backgroundColor: bg, borderColor: kind === 'secondary' && !off ? colour.secondaryBorder : 'transparent', opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={fg} /> : <T variant="bodyStrong" colour={fg} style={[styles.center, kind === 'quiet' ? styles.underline : null]}>{label}</T>}
    </Pressable>
  );
}

/** A panel on the page, as the design's cards. */
export function Card({ children, style, onPress, label }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string }) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && { backgroundColor: colour.muted }]}>
      {children}
    </Pressable>
  );
}

/** A labelled text field, 56 points tall, its hint and error read with it. */
export function Field({ label, hint, error, ...input }: { label: string; hint?: string; error?: string | null } & TextInputProps) {
  const { prefs } = useSession();
  return (
    <View style={{ gap: space.xs }}>
      <T variant="label">{label}</T>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colour.textSecondary}
        style={[styles.input, typeStyle('body', prefs.largeText), { borderColor: error ? colour.textError : colour.borderStrong }]}
        {...input}
      />
      {hint && <T variant="small" colour={colour.textSecondary}>{hint}</T>}
      {error && <T variant="small" colour={colour.textError} accessibilityRole="alert">{error}</T>}
    </View>
  );
}

/** A short message in a coloured box. */
export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success' | 'warning'; children: ReactNode }) {
  const bg = { info: colour.infoBg, error: colour.errorBg, success: colour.successBg, warning: colour.warningBg }[tone];
  const fg = { info: colour.infoFg, error: colour.errorFg, success: colour.successFg, warning: colour.warningFg }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: bg }]} accessibilityLiveRegion="polite">
      <T colour={fg} accessibilityRole={tone === 'error' ? 'alert' : 'text'}>{children}</T>
    </View>
  );
}

/** A choice chip (language). */
export function Chip({ label, selected, disabled, onPress }: { label: string; selected: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, selected && { borderColor: colour.selectedBorder, borderWidth: 2, backgroundColor: colour.selectedBg }, disabled && { opacity: 0.55 }]}
    >
      <T variant="label">{label}</T>
    </Pressable>
  );
}

/** An on/off row with its label; the whole row is the switch. */
export function Toggle({ label, hint, value, onChange, disabled }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value, disabled: !!disabled }} disabled={disabled} onPress={() => onChange(!value)} style={[styles.toggleRow, disabled && { opacity: 0.55 }]}>
      <View style={[styles.track, { backgroundColor: value ? colour.brand : colour.borderStrong }]}>
        <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </View>
      <View style={styles.flex}>
        <T>{label}</T>
        {hint && <T variant="small" colour={colour.textSecondary}>{hint}</T>}
      </View>
    </Pressable>
  );
}

/** Call support: on every screen. */
export function SupportButton() {
  const s = useSession().strings;
  return <Button kind="secondary" label={s.common.callSupport(SUPPORT_PHONE.shown)} onPress={() => void Linking.openURL(`tel:${SUPPORT_PHONE.dial}`)} />;
}

export const Gap = ({ size = space.lg }: { size?: number }) => <View style={{ height: size }} />;

/** The coat of arms of Nigeria (docs/brand), at the top of the screens before sign-in. */
export function Crest() {
  const { strings: s } = useSession();
  return <Image source={require('../../assets/coat-of-arms.png')} style={{ height: crest.large, width: (crest.large * 284) / 241 }} accessibilityLabel={s.common.coatOfArms} />;
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colour.page },
  scroll: { padding: space.lg, gap: space.md, flexGrow: 1 },
  footer: { paddingHorizontal: space.lg, paddingBottom: space.sm, gap: space.md },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  underline: { textDecorationLine: 'underline' },
  button: { minHeight: touch.large, borderRadius: radius.md, borderWidth: 2, paddingHorizontal: space.xl, alignItems: 'center', justifyContent: 'center' },
  quiet: { minHeight: touch.min, borderWidth: 0 },
  card: { backgroundColor: colour.raised, borderRadius: radius.lg, borderWidth: 1, borderColor: colour.border, padding: space.lg, gap: space.xs },
  input: { minHeight: touch.large, borderWidth: 2, borderRadius: radius.md, backgroundColor: colour.raised, paddingHorizontal: space.md, color: colour.text },
  notice: { borderRadius: radius.md, padding: space.md },
  chip: { minHeight: touch.min, minWidth: touch.min, paddingHorizontal: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colour.borderStrong, backgroundColor: colour.raised, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { minHeight: touch.min, flexDirection: 'row', alignItems: 'center', gap: space.md },
  track: { width: 52, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colour.raised },
});
