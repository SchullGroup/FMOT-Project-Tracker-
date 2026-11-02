'use client';

import { Field } from './ui/Field';

/** A four-digit PIN field: numeric keypad on phones, digits hidden. */
export function PinInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  autoFocus?: boolean;
}) {
  return (
    <Field
      label={props.label}
      type="password"
      inputMode="numeric"
      autoComplete="off"
      pattern="[0-9]*"
      maxLength={4}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
      error={props.error}
      autoFocus={props.autoFocus}
      className="max-w-40 text-center text-3xl tracking-[0.5em]"
    />
  );
}
