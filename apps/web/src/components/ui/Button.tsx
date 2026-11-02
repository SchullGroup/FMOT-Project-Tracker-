import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-900 text-white hover:bg-brand-800 disabled:bg-line-strong',
  secondary: 'bg-surface text-brand-900 border-2 border-brand-900 hover:bg-brand-50 disabled:text-ink-muted disabled:border-line',
  quiet: 'bg-transparent text-brand-900 underline underline-offset-4 hover:bg-brand-50',
  danger: 'bg-danger text-white hover:brightness-110',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  busy?: boolean;
  wide?: boolean;
}

/** 48 px minimum height: the touch-target rule from the design system. */
export function Button({ variant = 'primary', busy, wide, className = '', children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${wide ? 'w-full' : ''} ${className}`}
    >
      {busy ? 'Please wait…' : children}
    </button>
  );
}
