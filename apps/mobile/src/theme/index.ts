import { largeText, tokens } from './tokens';

/*
 * The phone's theme, read from the design tokens (tokens.ts, generated). Screens use these names, never a raw value.
 * Text is never below 16 points, and body text is 18 (font-size.body-phone); Large text uses the Large text theme's
 * sizes (25 percent larger).
 */
export const colour = {
  page: tokens['color.surface.page'],
  raised: tokens['color.surface.raised'],
  muted: tokens['color.surface.muted'],
  brand: tokens['color.brand.primary'],
  text: tokens['color.text.primary'],
  textSecondary: tokens['color.text.secondary'],
  textInverse: tokens['color.text.inverse'],
  textError: tokens['color.text.error'],
  link: tokens['color.text.link'],
  border: tokens['color.border.default'],
  borderStrong: tokens['color.border.strong'],
  primaryBg: tokens['button.primary.bg'],
  primaryFg: tokens['button.primary.fg'],
  secondaryBg: tokens['button.secondary.bg'],
  secondaryFg: tokens['button.secondary.fg'],
  secondaryBorder: tokens['button.secondary.border'],
  dangerBg: tokens['button.danger.bg'],
  dangerFg: tokens['button.danger.fg'],
  disabledBg: tokens['button.disabled.bg'],
  disabledFg: tokens['button.disabled.fg'],
  selectedBg: tokens['color.interactive.selected.bg'],
  selectedBorder: tokens['color.interactive.selected.border'],
  focus: tokens['color.focus.ring'],
  successFg: tokens['color.feedback.success.fg'],
  successBg: tokens['color.feedback.success.bg'],
  errorFg: tokens['color.feedback.error.fg'],
  errorBg: tokens['color.feedback.error.bg'],
  infoFg: tokens['color.feedback.info.fg'],
  infoBg: tokens['color.feedback.info.bg'],
  warningFg: tokens['color.feedback.warning.fg'],
  warningBg: tokens['color.feedback.warning.bg'],
} as const;

export const space = {
  xs: tokens['spacing.4'],
  sm: tokens['spacing.8'],
  md: tokens['spacing.12'],
  lg: tokens['spacing.16'],
  xl: tokens['spacing.24'],
  xxl: tokens['spacing.32'],
} as const;

export const radius = { sm: tokens['radius.4'], md: tokens['radius.8'], lg: tokens['radius.16'], full: tokens['radius.full'] } as const;

/** The smallest thing a thumb may press (48 points), and the big buttons (56). */
export const touch = { min: tokens['phone.touch-min'], large: tokens['button.height.large'] } as const;

export type TextVariant = 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'small';

const SIZE: Record<TextVariant, keyof typeof largeText> = {
  title: 'font-size.title',
  heading: 'font-size.title-sm',
  body: 'font-size.body-phone',
  bodyStrong: 'font-size.body-phone',
  label: 'font-size.body',
  // The smallest text on the phone: 16 points (the web's 13 and 14 point sizes are not used here).
  small: 'font-size.body',
};

const WEIGHT: Record<TextVariant, 'regular' | 'semibold' | 'bold'> = {
  title: 'bold',
  heading: 'semibold',
  body: 'regular',
  bodyStrong: 'semibold',
  label: 'semibold',
  small: 'regular',
};

/** Outfit, loaded with expo-font in the root layout; one family name per weight. */
export const FONT = { regular: 'Outfit_400Regular', semibold: 'Outfit_600SemiBold', bold: 'Outfit_700Bold' } as const;

export function typeStyle(variant: TextVariant, large: boolean) {
  const fontSize = large ? largeText[SIZE[variant]] : tokens[SIZE[variant]];
  const lineHeight = Math.round(fontSize * (variant === 'title' || variant === 'heading' ? tokens['line-height.heading'] : tokens['line-height.body']));
  return { fontSize, lineHeight, fontFamily: FONT[WEIGHT[variant]] };
}
