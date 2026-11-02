import { useId, type SelectHTMLAttributes } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

/** A labelled select; the hint is linked by aria-describedby, not part of the name. */
export function Select({ label, hint, className = '', children, ...rest }: Props) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-semibold">{label}</label>
      {hint && <p id={hintId} className="text-sm text-ink-muted">{hint}</p>}
      <select id={id} aria-describedby={hintId} className={`min-h-14 rounded-md border-2 border-line-strong bg-surface px-3 text-lg disabled:bg-canvas ${className}`} {...rest}>
        {children}
      </select>
    </div>
  );
}
