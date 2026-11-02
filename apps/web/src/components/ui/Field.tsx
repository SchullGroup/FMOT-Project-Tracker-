import { useId, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
}

export function Field({ label, hint, error, className = '', ...rest }: Props) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={`min-h-14 rounded-md border-2 bg-surface px-4 text-xl tabular ${error ? 'border-danger' : 'border-line-strong focus:border-brand-900'} ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-base font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
