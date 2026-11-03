'use client';

import { useEffect, useRef } from 'react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

/*
 * Four dots and a keypad, as in the design. Large keys for touch; the
 * physical keyboard works too (digits, Backspace, Enter). The dots are
 * announced as "2 of 4 digits entered" so screen readers can follow.
 */
export function PinPad({ value, onChange, onComplete, error, autoFocus }: { value: string; onChange: (v: string) => void; onComplete?: (v: string) => void; error?: string | null; autoFocus?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const press = (k: string) => {
    if (k === 'del') return onChange(value.slice(0, -1));
    if (!/^\d$/.test(k) || value.length >= 4) return;
    const next = value + k;
    onChange(next);
    if (next.length === 4) onComplete?.(next);
  };
  const pressRef = useRef(press);
  pressRef.current = press;

  // In a sheet the dialog focuses its own first control (the close button) after this mounts, so the keypad takes the
  // focus on the next frame and, while it is shown, also takes digits typed with the focus elsewhere in the sheet.
  useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() => box.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (box.current?.contains(target) || target?.closest('input, textarea, select, [contenteditable]')) return;
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        pressRef.current(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        pressRef.current('del');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
    };
  }, [autoFocus]);

  return (
    <div
      ref={box}
      tabIndex={0}
      onKeyDown={(e) => {
        if (/^\d$/.test(e.key)) { e.preventDefault(); press(e.key); }
        else if (e.key === 'Backspace') { e.preventDefault(); press('del'); }
        else if (e.key === 'Enter' && value.length === 4) { e.preventDefault(); onComplete?.(value); }
      }}
      className="flex flex-col items-center gap-4 rounded-md outline-offset-4"
      aria-label="PIN keypad. Type your four digits."
    >
      <div className="flex gap-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`size-4 rounded-full border-2 ${i < value.length ? 'border-brand-900 bg-brand-900' : 'border-line-strong bg-surface'}`} />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{value.length} of 4 digits entered</p>
      {error && <p role="alert" className="text-center font-medium text-danger">{error}</p>}
      <div className="grid w-full max-w-72 grid-cols-3 gap-2">
        {KEYS.map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => press(k)}
              aria-label={k === 'del' ? 'Delete the last digit' : k}
              className="grid min-h-14 place-items-center rounded-md bg-canvas text-2xl font-medium tabular hover:bg-brand-100 active:bg-brand-100"
            >
              {k === 'del' ? (
                <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 5H9l-6 7 6 7h12z" />
                  <path d="m17 9-6 6M11 9l6 6" />
                </svg>
              ) : k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
